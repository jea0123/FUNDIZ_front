export interface BackingPagePayment {
    orderId: string;
    method: string;
    status: string;
    amount: number;
    cardCompany: string

}

export interface Payment{
  paymentId:number;
  backingId:number;
  orderId:string;
  method:string;
  status:string;
  amount:number;
  cardCompany:string;
  createdAt:Date;
}