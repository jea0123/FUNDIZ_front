import type { Reward } from "./reward";
import type { Tag } from "./tag";

export interface Analytics {
    kpi: {
        totalBackingAmount: number;
        fee: number;
        successRate: number;
        backingAmountAvg: number;
    };
    revenueTrends: RevenueTrends[];
    rewardSalesTops: RewardSalesTop[];
    paymentMethods: PaymentMethod[];
    categorySuccesses: SubcategorySuccess[];
};

export interface RevenueTrends {
    month: string;
    projectCnt: number;
    revenue: number;
}

export interface RewardSalesTop {
    rewardName: string;
    qty: number;
    revenue: number;
}

export interface PaymentMethod {
    paymentMethod: "CARD" | "BANK_TRANSFER" | "EASY_PAY" | "ETC";
    cnt: number;
}

export interface SubcategorySuccess {
    categoryName: string;
    successCnt: number;
    failCnt: number;
}

export interface Category {
    ctgrId: number;
    ctgrName: string;
}

export interface ProjectVerifyList {
    projectId: number;
    title: string;
    creatorName: string;
    ctgrName: string;
    subctgrName: string;
    goalAmount: number;
    startDate: Date;
    endDate: Date;
    projectStatus: string;
    requestedAt: Date;
}

export interface SearchProjectVerify {
    page: number;
    size: number;

    projectStatus?: string;
    rangeType?: string;
}

export interface RejectRequestDto {
    rejectedReason: string;
}

export interface ProjectVerifyDetail {
    projectId: number;
    creatorId: number;
    title: string;
    content: string;
    thumbnail: string
    goalAmount: number;
    startDate: Date;
    endDate: Date;
    projectStatus: string;
    requestedAt: Date;

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