export interface Liked{
    userId :number;
    projectId : number;
    createdAt : Date;
}

export interface LikedDetail{
    userId: number;
    projectId: number;
    createdAt : Date;

    creatorName: string;

    title: string;
    goalAmount: number;
    currAmount: number;
    thumbnail: string;
    endDate: Date;
}