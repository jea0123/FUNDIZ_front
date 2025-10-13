import { useEffect, useMemo, useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, CreditCard, Truck, Package, MessageCircle, CheckCircle2, X, Trash2 } from "lucide-react";
import { endpoints, getData, putData, deleteData } from "@/api/apis";
import { useCookies } from "react-cookie";
import type { Notification } from "@/types/notification";
import { getElapsedTime, toastError, toastSuccess } from "@/utils/utils";

export const typeIcon: Record<string, JSX.Element> = {
    BACKING_SUCCESS: <CreditCard className="h-4 w-4 text-blue-500" />,
    BACKING_FAIL: <CreditCard className="h-4 w-4 text-red-500" />,
    SHIPPING_SENT: <Truck className="h-4 w-4 text-purple-500" />,
    SHIPPING_DELIVERED: <Truck className="h-4 w-4 text-green-500" />,
    PROJECT_UPDATE: <Package className="h-4 w-4 text-emerald-500" />,
    QNA_REPLY: <MessageCircle className="h-4 w-4 text-indigo-500" />,
    COMMENT_REPLY: <MessageCircle className="h-4 w-4 text-indigo-500" />,
};

export default function NotificationsPage() {
    const [cookie] = useCookies();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    /** 읽지 않은 알림 개수 */
    const unreadCount = useMemo(
        () => notifications.filter(n => n.isRead === "N").length,
        [notifications]
    );

    /**
     * @description 알림 목록 불러오기
     * @example
     * fetchNotifications();
     */
    const fetchNotifications = async () => {
        setLoading(true);
        const res = await getData(endpoints.getNotifications, cookie.accessToken);
        if (res && res.status === 200) {
            setNotifications(res.data);
        }
        setLoading(false);
    };

    /**
     * @description 특정 알림을 읽음 처리
     * @param {number} id 알림 ID
     * @example
     * markRead(1);
     */
    const markRead = async (id: number) => {
        const res = await putData(endpoints.markAsRead(id), cookie.accessToken);
        if (res && res.status === 200) {
            setNotifications(prev =>
                prev.map(n => n.notificationId === id ? { ...n, isRead: "Y" } : n)
            );
            toastSuccess("알림을 읽음 처리했습니다");
        } else {
            toastError("알림 읽음 처리에 실패했습니다");
        }
    };

    /**
     * @description 모든 알림을 읽음 처리
     * @example
     * markAllRead();
     */
    const markAllRead = async () => {
        if (unreadCount === 0) return;
        const res = await putData(endpoints.markAllAsRead, cookie.accessToken);
        if (res && res.status === 200) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: "Y" })));
            toastSuccess("모든 알림을 읽음 처리했습니다");
        } else {
            toastError("알림 읽음 처리에 실패했습니다");
        }
    };

    /**
     * @description 특정 알림을 삭제
     * @param {number} id 알림 ID
     * @example
     * deleteOne(1);
     */
    const deleteOne = async (id: number) => {
        const res = await deleteData(endpoints.deleteNotification(id), cookie.accessToken);
        if (res && res.status === 200) {
            setNotifications(prev => prev.filter(n => n.notificationId !== id));
            toastSuccess("알림을 삭제했습니다");
        } else {
            toastError("알림 삭제에 실패했습니다");
        }
    };

    /**
     * @description 모든 알림을 삭제
     * @example
     * deleteAll();
     */
    const deleteAll = async () => {
        const res = await deleteData(endpoints.deleteAllNotifications, cookie.accessToken);
        if (res && res.status === 200) {
            setNotifications([]);
            toastSuccess("모든 알림을 삭제했습니다");
        } else {
            toastError("알림 삭제에 실패했습니다");
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [cookie.accessToken]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">알림</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
                        모두 읽음 처리
                    </Button>
                    <Button variant="destructive" size="sm" onClick={deleteAll}>
                        <Trash2 className="h-4 w-4 mr-1" /> 전체 삭제
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10 text-gray-500">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" /> 불러오는 중…
                </div>
            ) : notifications.length === 0 ? (
                <div className="py-10 text-center text-gray-500">새 알림이 없습니다</div>
            ) : (
                <ul className="divide-y rounded-xl border">
                    {notifications.map(n => (
                        <li
                            key={n.notificationId}
                            className={`px-4 py-3 flex items-start gap-3 group ${n.isRead === "N" ? "bg-blue-50" : "bg-white"}`}
                        >
                            {/* 아이콘 */}
                            <div className="pt-0.5 shrink-0">
                                {typeIcon[n.type] ?? <Bell className="h-4 w-4 text-gray-400" />}
                            </div>

                            {/* 본문 */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    {n.isRead === "N" && <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />}
                                    <span className="text-sm truncate">{n.message}</span>
                                </div>
                                <span className="text-xs text-gray-500">{getElapsedTime(n.createdAt)}</span>
                            </div>

                            {/* 우측 액션 */}
                            <div className="flex items-center gap-2">
                                {n.isRead === "N" && (
                                    <button
                                        className="opacity-100 text-gray-400 hover:text-green-600 transition"
                                        onClick={() => markRead(n.notificationId)}
                                        aria-label="읽음 처리"
                                        title="읽음 처리"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    className="opacity-100 text-gray-400 hover:text-red-500 transition"
                                    onClick={() => deleteOne(n.notificationId)}
                                    aria-label="삭제"
                                    title="삭제"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
