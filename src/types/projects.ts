import type { SortKey } from "@/views/project/components/ProjectsSortBar";
import type { News } from "./news";
import type { Reward } from "./reward";
import type { Tag } from "./tag";
import type { ContentBlocks } from "./creator";

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
    contentBlocks: string;
    thumbnail: string;
    businessDoc: string;
    createdAt: Date;
    updatedAt: Date;
    projectStatus: string;
    backerCnt: number;
    likeCnt: number;
    viewCnt: number;
    isReqReview: string;
    requestedAt: Date;
    rejectedReason: string;
};

export interface RecentTop10 {
    projectId: number;
    title: string;
    thumbnail: string;
    currAmount: number;
    creatorId: number;
    creatorName: string;
    endDate: Date;
    percentNow: number;
    trendScore: number;
}

export interface ProjectDetail {
    projectId: number;
    creatorId: number;
    subctgrId: number;

    title: string;
    goalAmount: number;
    currAmount: number;
    startDate: Date;
    endDate: Date;
    content: string;
    contentBlocks: ContentBlocks; // EditorJS JSON
    thumbnail: string;
    projectStatus: string;
    backerCnt: number;
    likeCnt: number;
    viewCnt: number;

    percentNow: number;
    projectCnt: number;
    paymentDate: Date;

    creatorName: string;
    followerCnt: number;
    profileImg: string;

    ctgrName: string;
    subctgrName: string;

    tagList: Tag[];
    rewardList: Reward[];
    newsList: News[];
}

export interface Featured {
    projectId: number;
    title: string;
    creatorId: number;
    creatorName: string;
    thumbnail: string;
    endDate: Date;
    percentNow: number;
    currAmount: number;
    score: number;
}

export interface RecentView {
    projectId: number;
    title: string;
    thumbnail: string;
    currAmount: number;
    creatorName: string;
    endDate: Date;
    percentNow: number;
    viewedAt: Date;
}

export interface Subcategory {
    subctgrId: number;
    ctgrId: number;
    subctgrName: string;
}

export interface SearchProjectParams {
    //프론트전용 추가
    page: number;
    size: number;

    keyword?: string;
    ctgrId?: number;
    subctgrId?: number;
    sort?: SortKey;
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
