import type { ReplyDto } from "./reply";

export interface CommunityDto {
    cmId: number;
    projectId: number;
    cmContent: string;
    createdAt: string;
    code: "CM";

    nickname: string;
    profileImg: string | null;
}

export interface ReviewDto {
    cmId: number;
    projectId: number;
    cmContent: string;
    createdAt: string;
    code: "RV";
    rating: number;

    nickname: string;
    profileImg: string | null;

    replyList: ReplyDto[];
}

export interface Cursor {
    lastCreatedAt: string;
    lastId: number | null;
}

export interface CursorPage<T> {
    items: T[];
    nextCursor: Cursor | null;
}