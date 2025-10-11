

export interface Qna{
    qnaId : number;
    projectId : number;
    userId : number;
    creatorId : number;
    content : string;
    createdAt : Date;
    title : string;
}

export interface QnaAddRequest{
    projectId : number;
    userId : number;
    content : string;
    createdAt : Date;
}

export interface SearchQnaParams {
    page: number;
    size: number;
    perGroup: number;
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
