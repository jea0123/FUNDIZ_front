

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