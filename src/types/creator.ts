export interface CreatorProjectListDto {
    projectId: number;
    title: string;
    projectStatus: string;
    startDate: Date;
    endDate: Date;
    goalAmount: number;
    currAmount: number;
    backerCnt: number;
    ctgrName: string;
    subctgrName: string;
    percentNow: number;
    requestedAt?: string;
}

export interface SearchCreatorProjectDto {
    page: number;
    size: number;

    projectStatus?: string;
    rangeType?: string;
}