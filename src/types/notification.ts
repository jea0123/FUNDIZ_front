export interface Notification {
    notificationId: number;
    userId: number;
    type: NotificationType;
    targetId?: number | null;
    message: string;
    isRead: "Y" | "N";
    createdAt: Date; // ISO
}

export type NotificationType =
    | "FUNDING_UPCOMING"
    | "FUNDING_REJECTED"
    | "FUNDING_OPEN"
    | "FUNDING_SUCCESS"
    | "FUNDING_FAILURE"
    | "FUNDING_SETTLED"
    | "SHIPPING_SENT"
    | "SHIPPING_DELIVERED"
    | "BACKING_SUCCESS"
    | "BACKING_FAIL"
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAIL"
    | "NEW_FOLLOWER"
    | "COMMUNITY_REPLY"
    | "QNA_REPLY"
    | "QNA_NEW"
    | "INQUIRY_ANSWERED"
    | "REPORT_RECEIVED"
    | "REPORT_RESOLVED"
    | "REFUND_COMPLETED"
    | "REWARD_OUT_OF_STOCK"
    | "DEFAULT";