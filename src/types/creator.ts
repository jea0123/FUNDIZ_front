import type { M } from 'node_modules/framer-motion/dist/types.d-Cjd591yU';
import type { DailyCount, MonthCount } from './backing';
import type { Reward, RewardCreateRequestDto } from './reward';
import type { Tag } from './tag';

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

  newsCount?: number;
  lastNewsAt?: string | null;
  reviewNewCount?: number; // 새 후기 수
  reviewPendingCount?: number; // 미답글 수
  lastReviewAt?: string | null;
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

export interface ProjectCreateRequestDto {
  projectId: number;
  ctgrId: number; //프론트에서만 사용
  subctgrId: number;
  creatorId: number;

  title: string;
  content: string;
  thumbnail: File | null;
  goalAmount: number;
  startDate: Date;
  endDate: Date;

  tagList: string[];
  rewardList: RewardCreateRequestDto[];

  creatorName: string;
  businessNum: string;
  email: string;
  phone: string;

  businessDoc: File | null;

  contentBlocks: M; // EditorJS JSON
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
