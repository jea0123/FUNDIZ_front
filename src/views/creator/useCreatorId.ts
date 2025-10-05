import { getData } from "@/api/apis";
import { useEffect, useState } from "react";

export function useCreatorId(fallbackId?: number) {
    const [creatorId, setCreatorId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                //서버가 아직 creatorId를 안 주면 폴백(임시값)
                if (fallbackId != null) {
                    if (!mounted) return;
                    setCreatorId(fallbackId);
                    return;
                }

                //폴백이 없을 땐 서버에 물어봄
                const me = await getData("/creator/me");
                if (!mounted) return;
                if (me?.data?.creatorId) {
                    setCreatorId(Number(me.data.creatorId));
                } else {
                    setCreatorId(null);
                }
            } catch {
                if (!mounted) return;
                setCreatorId(fallbackId ?? null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [fallbackId]);

    return { creatorId, loading };
}