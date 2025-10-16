import { useNotificationStore } from "@/store/NotificationStore.store";
import type { Notification } from "@/types/notification";
import { useEffect, useRef } from "react";

/**
 * @description 서버-발송 이벤트(SSE)를 사용하여 실시간 알림 수신
 * @param {number} userId 사용자 ID
 * @param {function} onMessage 실시간 알림 수신 이벤트 핸들러
 */
export function useNotificationSSE(userId: number) {
    const esRef = useRef<EventSource | null>(null);
    const addOrUpdate = useNotificationStore(s => s.addOrUpdate);

    useEffect(() => {
        if (!userId) return;
        const evtSource = new EventSource('http://localhost:9099/api/v1/notifications/stream?userId=' + userId);
        esRef.current = evtSource;

        /**
         * @description 알림 수신 이벤트 핸들러
         * @param {MessageEvent} e 메시지 이벤트
         */
        const onNoti = (e: MessageEvent) => {
            try {
                const parsed: Notification = JSON.parse(e.data);
                addOrUpdate(parsed);
            } catch {

            }
        };

        evtSource.addEventListener('NOTIFICATION', onNoti);

        /**
         * @description SSE 연결이 열렸을 때 호출되는 이벤트 핸들러
         */
        evtSource.onopen = () => {
            console.log('EventSource opened');
        };
        evtSource.onmessage = onNoti;

        /**
         * @description SSE 연결이 끊겼을 때 호출되는 이벤트 핸들러
         */
        evtSource.onerror = () => {
            evtSource.close();
            esRef.current = null;
        };

        return () => {
            evtSource.removeEventListener('NOTIFICATION', onNoti);
            evtSource.close();
            esRef.current = null;
        };
    }, [userId, addOrUpdate]);
}
