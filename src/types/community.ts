import type { Reply } from "./reply";

export interface Community {
    cmId: number;
    nickname: string;
    profileImg: string;
    content: string;
    rating: number;
    createdAt: Date;
    code: string;

    replyList: Reply[];
}