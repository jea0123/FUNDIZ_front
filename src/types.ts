export type LoginUser = {
    userId: number;
    email: string;
    nickname: string;
    profileImg: string | null;
    joinedAt: Date;
    followCnt: number;
    isCreator: string;
    creatorId: number | null;
    role: 'user' | 'creator' | 'admin';
};
