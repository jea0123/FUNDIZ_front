import { useEffect, useState } from "react";
import { endpoints, getData } from "@/api/apis";
import type { Featured } from "@/types/projects";

export function useFeaturedProjects(limit = 8) {
    const [data, setData] = useState<Featured[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const res = await getData(endpoints.getFeatured);
                if (mounted && res?.status === 200) setData(res.data as Featured[]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [limit]);

    return { data, loading };
}
