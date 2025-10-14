import type { AddressResponse } from './address';
import type { BackingPagePayment } from './payment';

export interface MyPageBacking {
  backingId: number;
  userId: number;
  amount: number;
  createdAt: Date;
  backingStatus: string;
}

export interface BackingMyPageDetail {
  backingReward: BackingMyPageReward;
  price: number;
  quantity: number;
  backing: MyPageBacking;
}

export interface BackingMyPageReward {
  rewardId: number;
  rewardName: string;
  deliveryDate: Date | null;
  backingProject: BackingMyPageProject;
}

export interface BackingMyPageProject {
  projectId: number;
  thumbnail: string;
  title: string;
  goalAmount: number | null;
  currAmount: number | null;
  endDate: Date;
  projectStatus: string;
}

export interface BackingRewardList {
  rewardId: number;
  rewardName: string;
  price: number;
  quantity: number;
  deliveryDate: Date | null;
}

export interface BackingPrepare {
  userId: number;
  nickname: string;
  email: string;

  addressList: AddressResponse[];

  creatorId: number;
  creatorName: string;
  profileImg: string;

  projectId: number;
  title: string;
  thumbnail: string;

  rewardList: BackingRewardList[];

  paymentList: BackingPagePayment[];
}

export interface BackingCreatorBackerList {
  //유저
  userid: number;
  nickname: string;

  //후원
  amount: number;
  createdAt: Date;

  projectId: number;
}

export interface BackingCreatorProjectList {
  creatorId: number;
  projectId: number;
  title: string;
  goalAmount: number;
  currAmount: number;
  thumbnail: string;
  backerCnt: number;

  backerList: BackingCreatorBackerList[];

  //달성률
  completionRate: number;
}
export type ShippingStatus = 'PENDING' | 'COMPLETED' | 'CANCELED' | 'FAILED' | 'REFUNDED';

export interface BackingRequest {
  backing: {
    userId?: number;
    amount: number;
    createdAt?: string;
    backingStatus: string;
  };

  backingDetail: {
    rewardId: number;
    price: number;
    quantity: number;
  };

  shipping: {
    shippingStatus: ShippingStatus;
    trackingNum: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    addrId?: number | null;
  };

  payment: {
    method: string;
    amount: number;
    status: string;
    paidAt: string;
  };
  
}

export interface DailyCount {
  createdAt: Date;
  count: number;
}

export interface MonthCount {
  createdAt: Date;
  count: number
}
