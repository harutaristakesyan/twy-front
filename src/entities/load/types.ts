export interface Load {
  id: string;
  
  // Customer Information
  customer: string;
  referenceNumber: string;
  customerRate?: string;
  contactName: string;
  
  // Carrier Information
  carrier?: string;
  carrierPaymentMethod?: string;
  carrierRate: string;
  
  // Service Information
  chargeServiceFeeToOffice: boolean;
  loadType: string;
  serviceType: string;
  serviceGivenAs: string;
  commodity: string;
  
  // Booking Information
  bookedAs: string;
  soldAs: string;
  weight: string;
  temperature?: string;
  
  // Pick-up Location
  pickupCityZipcode?: string;
  pickupPhoneNumber?: string;
  pickupSelectCarrier: string;
  pickupName: string;
  pickupAddress: string;
  
  // Drop-off Location
  dropoffCityZipcode?: string;
  dropoffPhoneNumber?: string;
  dropoffSelectCarrier: string;
  dropoffName: string;
  dropoffAddress: string;
  
  // Additional Fields
  fileIds?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoadDto {
  // Customer Information
  customer: string;
  referenceNumber: string;
  customerRate?: string;
  contactName: string;
  
  // Carrier Information
  carrier?: string;
  carrierPaymentMethod?: string;
  carrierRate: string;
  
  // Service Information
  chargeServiceFeeToOffice: boolean;
  loadType: string;
  serviceType: string;
  serviceGivenAs: string;
  commodity: string;
  
  // Booking Information
  bookedAs: string;
  soldAs: string;
  weight: string;
  temperature?: string;
  
  // Pick-up Location
  pickupCityZipcode?: string;
  pickupPhoneNumber?: string;
  pickupSelectCarrier: string;
  pickupName: string;
  pickupAddress: string;
  
  // Drop-off Location
  dropoffCityZipcode?: string;
  dropoffPhoneNumber?: string;
  dropoffSelectCarrier: string;
  dropoffName: string;
  dropoffAddress: string;
  
  // Additional Fields
  fileIds?: string[];
}

export interface UpdateLoadDto extends Partial<CreateLoadDto> {}

