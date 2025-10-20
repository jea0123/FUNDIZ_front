import type { Reward } from "./reward";
import type { Tag } from "./tag";
import type { AdminStatus } from "@/views/admin/pages/AdminProjectEditPage";
import type { ProjectStatus } from "@/views/admin/components/ProjectStatusChip";
import type { ContentBlocks } from "./creator";

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

export interface SearchAdminProjectDto {
    page: number;
    size: number;
    perGroup: number;
    projectStatus?: string[];
    rangeType?: string;
}

export interface RejectProjectDto {
    rejectedReason: string;
}

export interface ProjectVerifyDetail {
    projectId: number;
    title: string;
    goalAmount: number;
    startDate: Date;
    endDate: Date;
    content: string;
    contentBlocks: ContentBlocks; // EditorJS JSON
    thumbnail: string
    businessDoc?: string;
    projectStatus: ProjectStatus;
    requestedAt: Date;
    subctgrName: string;
    ctgrName: string;

    creatorName: string;
    businessNum: string;
    email: string;
    phone: string;

    tagList: Tag[];
    rewardList: Reward[];
}

export interface AdminProjectList {
    projectId: number;
    title: string;
    goalAmount: number;
    currAmount: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date
    projectStatus: ProjectStatus;
    backerCnt: number;
    likeCnt: number;
    viewCnt: number;
    subctgrName: string;
    ctgrName: string;
    creatorName: string;
    percentNow: number;
}

export interface AdminProjectUpdateDto {
    projectId: number;
    subctgrId: number;
    title: string;
    thumbnail: string;
    projectStatus: AdminStatus;
}
