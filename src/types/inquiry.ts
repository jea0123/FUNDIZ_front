

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

export interface SearchIqrParams {
    page: number;
    size: number;
    perGroup: number;
    keyword?: string;
}

export interface PageResult<T> {
    items: T[];
    page: number;
    size: number
    perGroup: number;

    totalElements: number;
    totalPages: number;

    hasPrev: boolean;
    hasNext: boolean;
    prevPage: number;
    nextPage: number;

    groupStart: number;
    groupEnd: number;
};
