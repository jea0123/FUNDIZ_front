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