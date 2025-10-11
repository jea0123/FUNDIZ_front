import type { Notification } from "@/types/notification";
import { useEffect, useRef } from "react";

export function useNotificationSSE(userId: number, onMessage: (noti: Notification) => void) {
    const esRef = useRef<EventSource | null>(null);
    useEffect(() => {
        if (!userId) return;
        const evtSource = new EventSource('http://localhost:9099/api/v1/notifications/stream?userId=' + userId);
        esRef.current = evtSource;

        const onNoti = (e: MessageEvent) => {
            try {
                const parsed: Notification = JSON.parse(e.data);
                onMessage(parsed);
            } catch {
                
            }
        };

        evtSource.addEventListener('NOTIFICATION', onNoti);

        evtSource.onopen = () => {
            console.log('EventSource opened');
        };
        evtSource.onmessage = onNoti;

        evtSource.onerror = () => {
            evtSource.close();
            esRef.current = null;
        };

        return () => {
            evtSource.removeEventListener('NOTIFICATION', onNoti);
            evtSource.close();
            esRef.current = null;
        };
    }, [userId, onMessage]);
}
