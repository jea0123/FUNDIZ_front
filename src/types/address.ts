export interface AddrUpdateRequest {
  addrId: number;
  userId: number;
  addrName: string;
  recipient: string;
  postalCode: string;
  roadAddr: string;
  detailAddr: string;
  recipientPhone: string;
}

export interface AddressResponse {
  addrId: number;
  userId: number;
  addrName: string;
  recipient: string;
  postalCode: string;
  roadAddr: string;
  detailAddr: string;
  recipientPhone: string;
  isDefault: string;
}
export interface resetDefaultAddr {
  addrId: number;
  userId: number;
  isDefault: string;
}

export interface Address{
  addrId: number;
  userId: number;
  addrName: string;
  recipient: string;
  postalCode: string;
  roadAddr: string;
  detailAddr: string;
  recipientPhone: string;
  isDefault: string;
}
