export interface Users{
    userId : number;
    email : string;
    pwd : string;
    nickname : string;
    profileImg : string;
    isSuspended : string
    joinedAt : Date;
    lastLoginAt : Date;
    followCnt : number;
    reason : string;
    suspendedAt : Date;
    releasedAt : Date;
    isCreator : string;
    role : string;
}

export interface UsersAddRequest{
    userId : number;
    email : string;
    pwd : string;
    nickname : string;
    profileImg : string;
    isSuspended : string
    joinedAt : Date;
    lastLoginAt : Date;
    followCnt : number;
    reason : string;
    suspendedAt : Date;
    releasedAt : Date;
    isCreator : string;
    role : string;
}

export interface UsersUpdateRequest{
    userId : number;
    nickname : string;
    isSuspended : string
    reason : string;
}

export interface SearchUserParams {
    page: number;
    size: number;
    perGroup: number;
    keyword?: string;
}

export interface PageResult<T> {
    items: T[];
    page: number;
    size: number
    perGroup: number;

    totalElements: number;
    totalPages: number;

    hasPrev: boolean;
    hasNext: boolean;
    prevPage: number;
    nextPage: number;

    groupStart: number;
    groupEnd: number;
};
