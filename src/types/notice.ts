

export interface Notice{
    noticeId : number;
    adId: number;
    title : string;
    content : string;
    viewCnt : number;
    createdAt : Date;
}

export interface NoticeAddRequest{
    title : string;
    content : string;
    viewCnt : number;
    createdAt : Date;
}

export interface NoticeUpdateRequest{
    noticeId : number;
    adId: number;
    title : string;
    content : string;
}

export interface SearchNoticeParams {
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
