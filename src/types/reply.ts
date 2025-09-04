export interface Reply {
    replyId: number;
    userId: number;
    qnaId: number;
    cmId: number;
    inqId: number;

    content: string;
    isSecret: string;
    createdAt: Date;
    deletedAt: Date;
    code: string;
}