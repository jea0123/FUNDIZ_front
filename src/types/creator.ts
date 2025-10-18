import type { DailyCount, MonthCount } from './backing';
import type { Reward, RewardCreateRequestDto } from './reward';

export interface CreatorProjectListDto {
    projectId: number;
    title: string;
    goalAmount: number;
    currAmount: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    projectStatus: string;
    backerCnt: number;
    likeCnt: number;
    viewCnt: number;
    requestedAt?: string;
    rejectedReason?: string;
    subctgrName: string;
    ctgrName: string;
    percentNow?: number;

    newsCount?: number; // 새 새소식 수
    lastNewsAt?: string | null; // 마지막 작성일
    reviewNewCount?: number; // 새 후기 수
    reviewPendingCount?: number; // 미답글 수
    lastReviewAt?: string | null; // 마지막 작성일
}

export interface SearchCreatorProjectDto {
    page: number;
    size: number;

    projectStatus?: string;
    rangeType?: string;
}

export type ContentBlocks = {
    time?: number;
    version?: string;
    blocks: Array<
        | { id?: string; type: "paragraph"; data: { text: string } }
        | {
            id?: string; type: "image"; data: {
                caption?: string;
                withBorder?: boolean;
                withBackground?: boolean;
                stretched?: boolean;
                file: { url: string };
            }
        }
        | { id?: string; type: string; data: any } // 다른 플러그인 대비
    >;
};

export interface CreatorProjectDetailDto {
    projectId: number;
    creatorId: number;
    title: string;
    goalAmount: number;
    currAmount: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    projectStatus: string;
    content: string;
    contentBlocks: ContentBlocks; // EditorJS JSON
    thumbnail: string;
    businessDoc?: string;
    subctgrName: string;
    ctgrName: string;

    creatorName: string;
    businessNum: string;
    email: string;
    phone: string;

    tagList: string[];
    rewardList: Reward[];
}

export interface ProjectCreateRequestDto {
    projectId: number;
    creatorId: number;
    ctgrId: number; //프론트에서만 사용
    subctgrId: number;

    title: string;
    goalAmount: number;
    startDate: Date;
    endDate: Date;
    content: string;
    contentBlocks: ContentBlocks; // EditorJS JSON
    thumbnail: File | null;
    businessDoc?: File | null;

    tagList: string[];
    rewardList: RewardCreateRequestDto[];
}

export interface ProjectSummaryDto {
    projectId: number;
    title: string;
    endDate: Date;
    projectStatus: string;
}

export interface CreatorDashboardRanking {
    projectId: number;
    title: string;
    backerCnt: number;
    likeCnt: number;
    viewCnt: number;
}

export interface CreatorDashboard {
    creatorId: number;

    projectTotal: number;
    totalAmount: number;
    totalBackingCnt: number;
    totalVerifyingCnt: number;

    totalProjectCnt: number;
    projectFailedCnt: number;
    projectFailedPercentage: number;
    projectSuccessPercentage: number;

    top3BackerCnt: CreatorDashboardRanking[];
    top3LikeCnt: CreatorDashboardRanking[];
    top3ViewCnt: CreatorDashboardRanking[];

    dailyStatus: DailyCount[];
    monthStatus: MonthCount[];
}

export interface CreatorUpdateRequest {
    creatorId: number;
    creatorName: string;
    creatorType: string;
    email: string;
    phone: string;
    bank: string;
    account: string;
    businessNum: string;
    profileImg: string;
    profileImgUrl: string;
}

export interface CreatorInfo {
  creatorId: number;
    creatorName: string;
    creatorType: string;
    email: string;
    phone: string;
    bank: string;
    account: string;
    businessNum: string;
    profileImg: string;
}