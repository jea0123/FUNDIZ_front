import { useEffect, useMemo, useState } from "react";
import { getData } from "@/api/apis";

type Source = "query" | "dev" | "jwt" | "me" | "default";

export function useCreatorId(defaultId?: number) {
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);

  const fromQuery = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    const v = sp.get("creatorId");
    return v ? Number(v) : null;
  }, []);

  const fromLocal = useMemo(() => {
    const keys = ["devCreatorId", "X-Dev-Creator-Id", "creatorId"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw && !Number.isNaN(Number(raw))) return Number(raw);
    }
    return null;
  }, []);

  const fromJwt = useMemo(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      const v = payload?.creatorId;
      return typeof v === "number" ? v : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // 1) 쿼리
      if (fromQuery) { if (mounted) { setCreatorId(fromQuery); setSource("query"); setLoading(false);} return; }

      // 2) dev override(localStorage)
      if (fromLocal) { if (mounted) { setCreatorId(fromLocal); setSource("dev"); setLoading(false);} return; }

      // 3) JWT
      if (fromJwt) { if (mounted) { setCreatorId(fromJwt); setSource("jwt"); setLoading(false);} return; }

      // 4) /me
      try {
        const res = await getData("/api/v1/me");
        const v = res?.data?.creatorId;
        if (mounted && typeof v === "number") {
          setCreatorId(v); setSource("me"); setLoading(false); return;
        }
      } catch { /* ignore */ }

      // 5) fallback
      if (mounted) {
        setCreatorId(defaultId ?? null);
        setSource("default");
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [fromQuery, fromLocal, fromJwt, defaultId]);

  // 디버깅 시 편리
  useEffect(() => {
    if (!loading) {
      console.log(`creatorId=${creatorId} (source=${source})`);
    }
  }, [creatorId, source, loading]);

  return { creatorId, source, loading };
}
