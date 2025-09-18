

export interface AddrAddRequest{
    addrName : string;
    recipient : string;
    postalCode : string;
    roadAddr : string;
    detailAddr : string;
    recipientPhone : string;
    isDefault : string;
}

export interface AddrUpdateRequest{
    addrId :number;
    userId : number;
    addrName : string;
    recipient : string;
    postalCode : string;
    roadAddr : string;
    detailAddr : string;
    recipientPhone : string;
    isDefault : string;
}

export interface AddressResponse{
    addrId : number;
    userId : number;
    addrName : string;
    recipient : string;
    postalCode : string;
    roadAddr : string;
    detailAddr : string;
    recipientPhone : string;
    isDefault : string;
}