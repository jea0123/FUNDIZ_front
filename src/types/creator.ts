import type { Reward } from "./reward";
import type { Tag } from "./tag";

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

export interface CreatorProjectDetailDto {
    projectId: number;
    creatorId: number;
    title: string;
    content: string;
    thumbnail: string;
    goalAmount: number;
    currAmount: number;
    startDate: Date;
    endDate: Date;

    ctgrId: number;
    ctgrName: string;
    subctgrId: number;
    subctgrName: string;

    creatorName: string;
    businessNum: string;
    email: string;
    phone: string;

    tagList: Tag[];
    rewardList: Reward[];
}