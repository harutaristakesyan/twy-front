import ApiClient from '@/shared/api/ApiClient.ts';
import type { ApiResponse } from '@/shared/api/types.ts';
import type { Load, CreateLoadDto, UpdateLoadDto } from './types';

export const loadApi = {
  getAll: async (): Promise<Load[]> => {
    const response = await ApiClient.get<ApiResponse<Load[]>>('/loads');
    return response.data;
  },

  getById: async (id: string): Promise<Load> => {
    const response = await ApiClient.get<ApiResponse<Load>>(`/loads/${id}`);
    return response.data;
  },

  create: async (data: CreateLoadDto): Promise<Load> => {
    const response = await ApiClient.post<ApiResponse<Load>>('/loads', data);
    return response.data;
  },

  update: async (id: string, data: UpdateLoadDto): Promise<Load> => {
    const response = await ApiClient.patch<ApiResponse<Load>>(`/loads/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await ApiClient.delete(`/loads/${id}`);
  },
};

