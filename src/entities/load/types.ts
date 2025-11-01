export type LoadStatus = 'Pending' | 'Approved' | 'Denied';

export interface LoadFile {
  id: string;
  fileName: string;
}

export interface Location {
  cityZipCode?: string | null;
  phone?: string | null;
  carrier: string;
  name: string;
  address: string;
}

export interface Load {
  id: string;
  customer: string;
  referenceNumber: string;
  customerRate?: number | null;
  contactName: string;
  carrier?: string | null;
  carrierPaymentMethod?: string | null;
  carrierRate?: number | null;
  chargeServiceFeeToOffice: boolean;
  loadType: string;
  serviceType: string;
  serviceGivenAs: string;
  commodity: string;
  bookedAs: string;
  soldAs: string;
  weight: string;
  temperature?: string | null;
  pickup: Location;
  dropoff: Location;
  branchId: string;
  status: LoadStatus;
  statusChangedBy: string | null;
  files: LoadFile[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoadDto {
  customer: string;
  referenceNumber: string;
  customerRate?: number | null;
  contactName: string;
  carrier?: string | null;
  carrierPaymentMethod?: string | null;
  carrierRate?: number | null;
  chargeServiceFeeToOffice: boolean;
  loadType: string;
  serviceType: string;
  serviceGivenAs: string;
  commodity: string;
  bookedAs: string;
  soldAs: string;
  weight: string;
  temperature?: string | null;
  pickup: Location;
  dropoff: Location;
  files?: LoadFile[];
}

export type UpdateLoadDto = Partial<CreateLoadDto>;

export interface ChangeLoadStatusDto {
  status: LoadStatus;
}

export interface GetLoadsParams {
  page?: number;
  limit?: number;
  sortField?: 'referenceNumber' | 'status' | 'createdAt' | 'customer';
  sortOrder?: 'ascend' | 'descend';
  query?: string;
}

export interface PaginatedLoadsResponse {
  loads: Load[];
  total: number;
}

