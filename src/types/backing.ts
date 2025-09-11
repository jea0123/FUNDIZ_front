export interface Backing{
    backingId :number;
    userId : number;
    amount : number;
    createdAt : Date;
    backingStatus : string;
}

export interface Backingdetail{
    backingReward:BackingReward;
    price : number;
    quantity: number;
    backing: Backing;
}

export interface BackingReward{
    rewardId :number;
    rewardName : string;
    deliveryDate : Date | null;
    backingProject : BackingProject;
}

export interface BackingProject{
    projectId: number;
    thumbnail: string;
    title: string;
    goalAmount: number |null;
    currAmount: number |null;
    endDate: Date;
    projectStatus: string;
}