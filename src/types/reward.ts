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
    projectId: number;
    rewardName: string;
    price: number;
    rewardContent: string;
    deliveryDate?: Date;
    rewardCnt?: number | null;
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
}

export interface CartItem {
    rewardId: number;
    rewardName: string;
    price: number;
    remain: number;
}

export type RewardDraft = {
    rewardName: string;
    price: number;
    rewardContent: string;
    deliveryDate: Date;
    rewardCnt: number;
    isPosting: "Y" | "N";
};

export type RewardForm = RewardDraft & { tempId: string; rewardId?: number };