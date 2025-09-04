export interface Project {
    projectId: number;
    creatorId: number;
    subctgrId: number;
    title: string;
    goalAmount: number;
    currAmount: number;
    startDate: Date;
    endDate: Date;
    content: string;
    thumbnail: string;
    createdAt: Date;
    updatedAt: Date;
    projectStatus: string;
    backerCnt: number;
    likeCnt: number;
    viewCnt: number;
    isReqReview: string;
    rejectedReason: string;
};

export interface RecentTop10{
    projectId: number;
    title: string;
    thumbnail: string;
    currAmount: number;
    creatorName: string;
    endDate: Date;
    percentNow: number;
    trendScore: number;
}

export interface Featured{
    projectId: number;
    title: string;
    creatorName: string;
    thumbnail: string;
    endDate: Date;
    percentNow: number;
    goalAmount: number;
    score: number;
}
