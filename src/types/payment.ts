export interface BackingPagePayment {
  orderId: string;
  method: string;
  status: string;
  amount: number;
  cardCompany: string;
}

export interface Payment {
  paymentId: number;
  backingId: number;
  orderId: string;
  method: string;
  status: string;
  amount: number;
  cardCompany: string;
  createdAt: Date;
}

export interface PaymentInfo {
  payInfoId: number;
  userId: number;
  cardCompany: string;
  method: string;
  cardNum: string;
}

export interface cardList {
  payInfoId: number;
  cardCompany: string;
  method: string;
  cardNum: string;
}

export interface addCard {
  payInfoId: number;
  userId: number;
  cardCompany: string;
  method: string;
  cardNum: string;
}
