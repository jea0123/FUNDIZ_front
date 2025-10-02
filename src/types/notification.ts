export interface Notification {
    notificationId: number;
    userId: number;
    type: string;
    targetId: number;
    message: string;
    isRead: string;
    createdAt: Date;
}