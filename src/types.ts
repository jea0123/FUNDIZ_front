export type LoginUser = {
    userId: number;
    email: string;
    nickname: string;
    profileImg: string;
    joinedAt: Date;
    followCnt: number;
    isCreator: String;
    role: 'user' | 'creator' | 'admin';
};
