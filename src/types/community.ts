export interface CommunityDto {
    cmId: number;
    cmContent: string;
    createdAt: Date;
    code: "CM";
    nickname: string;
    profileImg: string;
    replyCnt: number;
}

export interface ReviewDto {
    cmId: number;
    cmContent: string;
    createdAt: Date;
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

export interface SearchReviewsParams {
    lastId?: number | null;
    lastCreatedAt?: Date | null;
    projectId?: number | null;
    photoOnly?: boolean;
    size: number;
}

export interface ReviewItem {
    cmId: number;
    cmContent: string;
    createdAt: string;
    user: { userId: number | null; nickname: string; profileImg?: string };
    project: { projectId: number; title: string; thumbnail?: string };
    images: string[];
}

export interface ReviewCursor {
    lastId?: number;
    lastCreatedAt?: string;
}