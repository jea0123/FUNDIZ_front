import type { SortKey } from "@/views/project/components/SortBar";
import type { News } from "./news";
import type { Reward, RewardCreateRequestDto } from "./reward";
import type { Tag } from "./tag";

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

export interface Featured{
    projectId: number;
    title: string;
    creatorName: string;
    thumbnail: string;
    endDate: Date;
    percentNow: number;
    currAmount: number;
    score: number;
}

export interface RecentView{
    projectId: number;
    title: string;
    thumbnail: string;
    currAmount: number;
    creatorName: string;
    endDate: Date;
    percentNow: number;
    viewedAt: Date;
}

export interface ProjectCreateRequestDto {
    projectId: number;
    ctgrId: number; //프런트 전용
    subctgrId: number;
    creatorId: number;

    title: string;
    content: string;
    thumbnail: string;
    goalAmount: number;
    startDate: Date;
    endDate: Date;

    tagList: string[];

    rewardList: RewardCreateRequestDto[];

    creatorName: string;
    businessNum: string;
    businessDoc?: File | null; //프런트 전용
    email: string;
    phone: string;
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
