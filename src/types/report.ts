

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
    userId : number;
    target : number;
    reason : string;
    reportDate : Date;
    reportStatus : string;
    reportType : string;
}
