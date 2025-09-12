import type { Reply } from "./reply";

export interface Community {
    cmId: number;
    nickname: string;
    profileImg: string;
    cmContent: string;
    rating: number;
    createdAt: Date;
    code: string;

    replyList: Reply[];
}