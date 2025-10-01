export interface Reward {
    rewardId: number;
    projectId: number;
    rewardName: string;
    price: number;
    rewardContent: string;
    deliveryDate: Date;
    rewardCnt: number;
    createdAt: Date;
    isPosting: string;
    remain: number;
}

export interface RewardCreateRequestDto {
    rewardName: string;
    price: number;
    rewardContent: string;
    deliveryDate: Date;
    rewardCnt: number;
    isPosting: string;
}

export interface RewardUpdateRequestDto {
    rewardId: number;
    projectId: number;
    rewardName: string;
    price: number;
    rewardContent: string;
    deliveryDate: Date;
    rewardCnt: number;
    isPosting: string;
    remain: number;
}

export interface CartItem {
    rewardId: number;
    rewardName: string;
    price: number;
    remain: number;
}