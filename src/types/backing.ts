import type { AddrAddRequest } from "./address";

export interface MyPageBacking{
    backingId :number;
    userId : number;
    amount : number;
    createdAt : Date;
    backingStatus : string;
}

export interface BackingMyPageDetail{
    backingReward:BackingMyPageReward;
    price : number;
    quantity: number;
    backing: MyPageBacking;
}

export interface BackingMyPageReward{
    rewardId :number;
    rewardName : string;
    deliveryDate : Date | null;
    backingProject : BackingMyPageProject;
}

export interface BackingMyPageProject{
    projectId: number;
    thumbnail: string;
    title: string;
    goalAmount: number |null;
    currAmount: number |null;
    endDate: Date;
    projectStatus: string;
}

export interface BackingRequest{
    userId : number;
    backingRewardList: BackingRewardList[];
    addrId : number;
    newAddress?: AddrAddRequest;
}

export interface BackingRewardList{
    rewardId : number;
    rewardName : string;
    price : number;
    quantity : number;
    deliveryDate : Date | null;
}

export interface BackingPrepare {
  userId: number;
  nickname: string;
  email: string;

  creatorId: number;
  creatorName: string;
  profileImg: string;

  projectId: number;
  title: string;
  thumbnail: string;

  addrId: number;
  addrName: string;
  recipient: string;
  postalCode: string;
  roadAddr: string;
  detailAddr: string;
  recipientPhone: string;
  isDefault: string;

  rewardId: number;
  rewardName: string;
  price: number;
  deliveryDate: string;
}
