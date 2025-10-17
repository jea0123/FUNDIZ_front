import type { Address, AddressResponse } from './address';
import type { BackingPagePayment, Payment } from './payment';

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
  count: number;
}
// 후원하기페이지용
export interface BackingCreate {
  backingId: number;
  backing: Backing;
  backingDetail: BackingDetail;
  payment: Payment;
  address: Address;

  rewards: RewardBackingRequest[];
}

export interface RewardBackingRequest {
  rewardId: number;
  rewardName: string;
  price: number;
  rewardContent: string;
  quantity: number;
}

export interface Backing {
  backingId: number;
  userId: number;
  amount: number;
  createdAt: Date;
  backingStatus: string;
}
export interface BackingDetail {
  backingId: number;
  rewardId: number;
  price: number; // => = reward.price * quantity
  quantity: number;
}
//여기까지

//user - 후원리스트 (신규) TODO: 작동시 다른내용 중복제거
//리스트 페이지에서 보여줄내용
export interface MyPageBacking_Reward {
  projectId: number;
  rewardName: string;
  price: number;
  deliveryDate: Date;

  quantity: number;
  backingId: number;
  userId: number;
}

//상세 페이지에서 보여줄내용
export interface MyPageBackingDetail {
  backingId: number;
  userId: number;
  amount: number;
  createdAt: Date;
  backingStatus: string;

  rewardList: MyPageBacking_Reward[];

  method: string;
  cardCompany: string;

  shippingStatus: string;
  trackingNum: number;
  shippedAt: Date;
  deliveredAt: Date;

  title: string;
  thumbnail: string;

  addrName: string;
  recipient: string;
  postalCode: string;
  roadAddr: string;
  detailAddr: string;
  recipientPhone: string;
}
//공통으로 쓸 리워드 리스트화
export interface MyPgaeBackingList {
  projectId: number;
  title: string;
  goalAmount: number;
  currAmount: number;
  thumbnail: string;

  rewardList: MyPageBacking_Reward[];

  userId: number;
  backingId: number;

  amount: number;
  createdAt: Date;
  backingStatus: string;
  shippingStatus: string;
  creatorName: string;
}
