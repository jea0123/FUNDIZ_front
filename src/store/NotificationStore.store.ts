import { create } from "zustand";
import type { Notification } from "@/types/notification";

type State = {
    notifications: Notification[];
};

type Actions = {
    setAll: (list: Notification[]) => void;
    addOrUpdate: (n: Notification) => void;
    markReadLocal: (id: number) => void;
    markAllReadLocal: () => void;
    deleteLocal: (id: number) => void;
    clear: () => void;
};

export const useNotificationStore = create<State & Actions>((set, get) => ({
    notifications: [],

    setAll: (list) => set({ notifications: list.slice().sort((a, b) => b.notificationId - a.notificationId) }),

    addOrUpdate: (n) => {
        set(state => {
            const i = state.notifications.findIndex(x => x.notificationId === n.notificationId);
            if (i >= 0) {
                const merged = { ...state.notifications[i], ...n };
                if (state.notifications[i].isRead === "Y" && n.isRead === "N") {
                    merged.isRead = "Y";
                }
                const next = state.notifications.slice();
                next[i] = merged;
                return { notifications: next };
            }
            return { notifications: [n, ...state.notifications] };
        });
    },

    markReadLocal: (id) => {
        set({ notifications: get().notifications.map(n => n.notificationId === id ? { ...n, isRead: "Y" } : n) });
    },

    markAllReadLocal: () => {
        set({ notifications: get().notifications.map(n => ({ ...n, isRead: "Y" })) });
    },

    deleteLocal: (id) => {
        set({ notifications: get().notifications.filter(n => n.notificationId !== id) });
    },

    clear: () => set({ notifications: [] }),
}));

export const useUnreadCount = () =>
    useNotificationStore(s => s.notifications.reduce((acc, n) => acc + (n.isRead === "N" ? 1 : 0), 0));
