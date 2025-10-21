

export interface Report{
    reportId : number;
    userId : number;
    target : number;
    reason : string;
    reportDate : Date;
    reportStatus : string;
    reportType : string;
}

export interface ReportAddRequest{
    target : number;
    reason : string;
    reportDate : Date;
    reportStatus : string;
    reportType : string;
}


export interface SearchRptParams {
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

export interface ReportStatusUpdateRequest{
    reportId : number;
    reason : string;
    reportStatus : string;
}
