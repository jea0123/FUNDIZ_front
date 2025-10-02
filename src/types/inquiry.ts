

export interface Inquiry{
    inqId : number;
    userId : number;
    adId : number;
    title : string;
    content : string;
    createdAt : Date;
    isCanceled : string;
    ctgr : string;
    isAnswer : string;
}

export interface IqrAddRequest{
    userId : number;
    title : string;
    content : string;
    createdAt : Date;
    isCanceled : string;
    ctgr : string;
    isAnswer : string;
}
