export type LoginUser = {
    userId: number;
    email: string;
    nickname: string;
    profileImg: string;
    joinedAt: Date;
    followCnt: number;
    isCreator: string;
    creatorId: number | null;
    role: 'user' | 'creator' | 'admin';
};
