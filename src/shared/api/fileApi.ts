import ApiClient from './ApiClient.ts';
import type { ApiResponse } from './types.ts';

export interface FileUploadPayload {
  fileName: string;
  contentType: string;
  size: number;
}

export interface FileUploadResponse {
  fileId: string;
  bucket: string;
  key: string;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: {
    'Content-Type': string;
  };
  fileName: string;
  contentType: string;
  contentLength: number;
}

export interface FileDownloadResponse {
  downloadUrl: string;
  expiresAt: string;
}

export interface FileDeleteResponse {
  message: string;
}

export const fileApi = {
  /**
   * Request a presigned upload URL from the backend
   */
  requestUploadUrl: async (payload: FileUploadPayload): Promise<FileUploadResponse> => {
    const response = await ApiClient.post<ApiResponse<FileUploadResponse>>('/files', payload);
    return response.data;
  },

  /**
   * Upload file directly to S3 using the presigned URL
   */
  uploadToS3: async (uploadUrl: string, file: File, headers: Record<string, string>): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers,
      body: file,
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
    }
  },

  /**
   * Complete file upload flow: request URL and upload to S3
   */
  uploadFile: async (file: File): Promise<string> => {
    // Step 1: Request upload URL
    const payload: FileUploadPayload = {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    };

    const uploadContract = await fileApi.requestUploadUrl(payload);

    // Step 2: Upload to S3
    await fileApi.uploadToS3(uploadContract.uploadUrl, file, uploadContract.requiredHeaders);

    // Step 3: Return fileId for later use
    return uploadContract.fileId;
  },

  /**
   * Get download URL for a file
   */
  getDownloadUrl: async (fileId: string): Promise<FileDownloadResponse> => {
    const response = await ApiClient.get<ApiResponse<FileDownloadResponse>>(`/files/${fileId}`);
    return response.data;
  },

  /**
   * Delete a file
   */
  deleteFile: async (fileId: string): Promise<void> => {
    await ApiClient.delete<ApiResponse<FileDeleteResponse>>(`/files/${fileId}`);
  },

  /**
   * Download file to browser
   */
  downloadFile: async (fileId: string, fileName?: string): Promise<void> => {
    const { downloadUrl } = await fileApi.getDownloadUrl(fileId);
    
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    
    // Create a temporary link to trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

