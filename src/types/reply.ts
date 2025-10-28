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

export interface ReplyDto {
    replyId: number;
    cmId: number;
    userId: number;
    content: string;
    isSecret: string;
    createdAt: Date;

    nickname: string;
    profileImg: string;
}

export interface InquiryReplyDto {
    replyId: number;
    inqId: number;
    content: string;
    createdAt: Date;
}

export interface QnaReplyDto {
    replyId: number;
    qnaId: number;
    content: string;
    createdAt: Date;
    creatorId: number;
}