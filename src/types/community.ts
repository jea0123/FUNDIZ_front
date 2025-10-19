export interface CommunityDto {
    cmId: number;
    cmContent: string;
    createdAt: string;
    code: "CM";
    nickname: string;
    profileImg: string | null;
    replyCnt: number;
}

export interface ReviewDto {
    cmId: number;
    cmContent: string;
    createdAt: string;
    code: "RV";
    rating: number;
    nickname: string;
    profileImg: string | null;
    replyCnt: number;
}

export interface Cursor {
    lastCreatedAt: string;
    lastId: number | null;
}

export interface CursorPage<T> {
    items: T[];
    nextCursor: Cursor | null;
}