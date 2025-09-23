export interface Liked{
    userId :number;
    projectId : number;
    createdAt : Date;
}

export interface LikedDetail{
    userId: number;
    projectId: number;
    createdAt : Date;

    creatorId : number;
    creatorName: string;

    title: string;
    goalAmount: number;
    currAmount: number;
    thumbnail: string;
    endDate: Date;
}