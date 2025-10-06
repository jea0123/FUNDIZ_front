import { axiosInstance, getData } from "@/api/apis";
import { useEffect, useState } from "react";

export function useCreatorId(fallbackId?: number) {
    const [creatorId, setCreatorId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                // DEV 우선순위 : ?devCreatorId= -> localStorage -> .env -> fallbackId
                const qs = new URLSearchParams(window.location.search);
                const fromQuery = qs.get("devCreatorId") ?? undefined;
                const fromStorage = localStorage.getItem("devCreatorId") ?? undefined;
                const fromEnv = (import.meta.env.VITE_DEV_CREATOR_ID as string | undefined) ?? undefined;

                let id: number | null = null;

                const devCandidate = fromQuery ?? fromStorage ?? (fallbackId != null ? String(fallbackId) : undefined) ?? fromEnv;
                if (devCandidate != null) {
                    const parsed = Number(devCandidate);
                    if (Number.isFinite(parsed) && parsed > 0) {
                        id = parsed;
                    }
                } else {
                    // 폴백 없으면 서버에 현재 사용자 물어봄
                    const me = await getData("/creator/me");
                    const serverId = me?.data?.creatorId;
                    const parsed = Number(serverId);
                    if (Number.isFinite(parsed) && parsed > 0) {
                        id = parsed;
                    }
                }

                if (!alive) return;

                setCreatorId(id);

                // DEV에서만 헤더로 주입
                if (import.meta.env.DEV) {
                    if (id != null) {
                        axiosInstance.defaults.headers.common["X-Dev-Creator-Id"] = String(id);
                        if (fromQuery) {
                            localStorage.setItem("devCreatorId", String(id));
                        }
                    } else {
                        delete axiosInstance.defaults.headers.common["X-Dev-Creator-Id"];
                        localStorage.removeItem("devCreatorId");
                    }
                }
                console.debug("[useCreatorId] devCandidate=", devCandidate, "resolved id=", id, "DEV=", import.meta.env.DEV);
            } catch (e) {
                    if (!alive) return;

                    //실패 시 폴백 id 사용
                    const id = fallbackId ?? null;
                    setCreatorId(id);

                    if (import.meta.env.DEV) {
                        if (id != null) {
                            axiosInstance.defaults.headers.common["X-Dev-Creator-Id"] = String(id);
                        } else {
                            delete axiosInstance.defaults.headers.common["X-Dev-Creator-Id"];
                        }
                    }
                    console.warn("[useCreatorId] fallback due to error:", e);
                } finally {
                    if (alive) setLoading(false);
                }
            })();

        return () => { alive = false; };
    }, [fallbackId]);

    return { creatorId, loading };
}