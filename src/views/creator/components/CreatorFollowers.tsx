import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PageResult } from "@/types/projects";
import { deleteData, endpoints, getData, postData } from "@/api/apis";
import { toastError, toastSuccess } from "@/utils/utils";
import type { FollowerItem } from "@/types/creator";
import { useCookies } from "react-cookie";
import defaultProfile from '@/lib/default-profile.png'

type Props = { creatorId: number };

export default function CreatorFollowers({ creatorId }: Props) {
    const [cookie] = useCookies();
    const [result, setResult] = useState<PageResult<FollowerItem> | null>(null);
    const [page, setPage] = useState(1);
    const size = 20;

    const total = result?.totalElements ?? 0;
    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

    const [loading, setLoading] = useState(false);
    const [rowLoading, setRowLoading] = useState<Record<number, boolean>>({});

    const navigate = useNavigate();

    const fetchPage = useCallback(async () => {
        setLoading(true);
        const res = await getData(endpoints.getCreatorFollowers(creatorId, page, size), cookie.accessToken);
        if (res.status !== 200) return;
        setResult(res.data as PageResult<FollowerItem>);
        setLoading(false);
    }, [creatorId, page, size]);

    const refreshFollowerCount = useCallback(async () => {
        const res = await getData(endpoints.getFollowerCnt(creatorId));
        if (res.status === 200) {
            setResult(prev => (prev ? { ...prev, totalElements: res.data } : prev));
        }
    }, [creatorId]);

    useEffect(() => {
        fetchPage();
    }, [fetchPage]);

    const follow = useCallback(async (item: FollowerItem) => {
        if (!item.canFollow || !item.creatorId) return;
        if (!cookie.accessToken) {
            toastError("로그인 후 이용해 주세요.");
            return;
        }
        setRowLoading(prev => ({ ...prev, [item.userId]: true }));
        try {
            const res = await postData(endpoints.followCreator(item.creatorId), {}, cookie.accessToken);
            if (res.status === 200) {
                setResult(prev => {
                    if (!prev) return prev;
                    const updated = prev.items.map(it => it.userId === item.userId ? { ...it, following: true } : it);
                    return { ...prev, items: updated };
                });
                toastSuccess("팔로우를 추가했어요.");
                await refreshFollowerCount();
            }
        } finally {
            setRowLoading(prev => ({ ...prev, [item.userId]: false }));
        }
    }, [refreshFollowerCount]);

    const unfollow = useCallback(async (item: FollowerItem) => {
        if (!item.canFollow || !item.creatorId) return;
        if (!cookie.accessToken) {
            toastError("로그인 후 이용해 주세요.");
            return;
        }
        setRowLoading(prev => ({ ...prev, [item.userId]: true }));
        try {
            const res = await deleteData(endpoints.unfollowCreator(item.creatorId), cookie.accessToken);
            if (res.status === 200) {
                setResult(prev => {
                    if (!prev) return prev;
                    const updated = prev.items.map(it => it.userId === item.userId ? { ...it, following: false } : it);
                    return { ...prev, items: updated };
                });
                toastSuccess("팔로우를 취소했어요.");
                await refreshFollowerCount();
            }
        } finally {
            setRowLoading(prev => ({ ...prev, [item.userId]: false }));
        }
    }, [refreshFollowerCount]);

    return (
        <div className="space-y-4">
            {loading && <div className="flex items-center justify-center py-14 text-muted-foreground">불러오는 중...</div>}
            <div className="text-sm text-muted-foreground">총 {total}명</div>

            <Card className="divide-y">
                {result?.items.length ? (
                    result.items.map((u) => {
                        const isCreator = u.creator === true;
                        const displayName = isCreator ? (u.creatorName ?? u.nickname) : u.nickname;
                        const img = isCreator ? (u.creatorProfileImg ?? defaultProfile) : (u.userProfileImg ?? defaultProfile);
                        const initials = (displayName || "").slice(0, 2);
                        const loading = !!rowLoading[u.userId];

                        return (
                            <div key={`${u.userId}`} className="flex items-center justify-between p-3">
                                <div
                                    className="flex items-center gap-3"
                                    onClick={() => {
                                        if (isCreator && u.creatorId) navigate(`/creator/${u.creatorId}`);
                                    }}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={img} />
                                        <AvatarFallback>{initials}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col">
                                        <div className="text-sm font-medium">
                                            {displayName}
                                            {isCreator && <span className="ml-2 text-xs text-primary/80">크리에이터</span>}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            팔로우일: {u.followDate}
                                        </div>
                                    </div>
                                </div>

                                {/* 크리에이터가 아니면 버튼 숨김 */}
                                {u.canFollow && (
                                    <div className="flex items-center gap-2">
                                        {!u.following ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={loading}
                                                onClick={() => follow(u)}
                                                className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                                            >
                                                팔로우
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={loading}
                                                onClick={() => unfollow(u)}
                                                className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                            >
                                                언팔로우
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="p-6 text-sm text-center text-muted-foreground">팔로워가 없어요.</div>
                )}
            </Card>

            <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                    이전
                </Button>
                <span className="text-xs text-muted-foreground">페이지 {page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    다음
                </Button>
            </div>
        </div>
    );
}
