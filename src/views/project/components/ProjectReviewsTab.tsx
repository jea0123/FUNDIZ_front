import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { endpoints, getData } from "@/api/apis";
import { getDaysBefore } from "@/utils/utils";
import type { Cursor, CursorPage, ReviewDto } from "@/types/community";

type Props = {
    projectId: number;
    active?: boolean;
};

export default function ProjectReviewsTab({ projectId, active = false }: Props) {
    /* ----------------------------- Refs ----------------------------- */
    const reviewSentinelRef = useRef<HTMLDivElement | null>(null);
    const reviewLoadingLockRef = useRef(false);

    /* ----------------------------- State ---------------------------- */
    const [review, setReview] = useState<ReviewDto[]>([]);
    const [reviewCursor, setReviewCursor] = useState<Cursor | null>(null);
    const [loadingReview, setLoadingReview] = useState(false);

    /* --------------------------- Fetchers --------------------------- */
    const reviewData = useCallback(
        async (cursor: Cursor | null) => {
            if (!projectId) return;
            setLoadingReview(true);
            try {
                const params = new URLSearchParams();
                if (cursor) {
                    if (cursor.lastCreatedAt) params.set("lastCreatedAt", cursor.lastCreatedAt);
                    if (cursor.lastId != null) params.set("lastId", String(cursor.lastId));
                }
                params.set("size", "10");

                const url = `${endpoints.getReviewList(projectId)}?${params.toString()}`;
                const { status, data } = await getData(url);

                if (status !== 200 || !data) {
                    if (!cursor) setReview([]); // 첫 로드 실패 시 초기화
                    setReviewCursor(null);
                    return;
                }
                const page = data as CursorPage<ReviewDto>;
                const items = Array.isArray(page?.items) ? page.items : [];
                setReview((prev) => (cursor ? [...prev, ...items] : items));
                setReviewCursor(page?.nextCursor ?? null);
            } finally {
                setLoadingReview(false);
            }
        },
        [projectId]
    );

    /* ---------------------------- Effects --------------------------- */
    // 최초/프로젝트 변경 시 초기 로드
    useEffect(() => {
        setReview([]);
        setReviewCursor(null);
        reviewData(null);
    }, [projectId, reviewData]);

    // 후기 무한스크롤
    useEffect(() => {
        if (!active) return; // 탭이 활성일 때만
        const el = reviewSentinelRef.current;
        if (!el || !reviewCursor || loadingReview) return;

        const io = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && !reviewLoadingLockRef.current) {
                    reviewLoadingLockRef.current = true;
                    reviewData(reviewCursor).finally(() => {
                        reviewLoadingLockRef.current = false;
                    });
                }
            },
            { root: null, rootMargin: "300px", threshold: 0.01 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [active, reviewCursor, loadingReview, reviewData]);

    /* ---------------------------- Render ---------------------------- */
    return (
        <>
            {review.length === 0 ? (
                <div className="mt-4 rounded-lg border p-6 text-center">
                    <p className="text-sm text-muted-foreground">게시글이 존재하지 않습니다.</p>
                </div>
            ) : (
                <>
                    {review.map((rv) => (
                        <div key={rv.cmId} className="space-y-4 mt-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start space-x-3">
                                        <Avatar className="w-8 h-8">
                                            {rv.profileImg ? <AvatarImage src={rv.profileImg} /> : null}
                                            <AvatarFallback>{(rv.nickname ?? "U").slice(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium">{rv.nickname}</span>
                                                <div className="flex items-center">
                                                    {Array.from({ length: rv.rating }).map((_, i) => (
                                                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-500">{getDaysBefore(rv.createdAt)} 전</span>
                                            </div>
                                            <p className="text-sm">{rv.cmContent}</p>
                                            {/* 필요시 댓글 버튼 유지(현재 동작 없음) */}
                                            {/* <div className="flex items-center space-x-2 mt-2">
                                                <Button variant="ghost" size="sm">
                                                <MessageCircle className="h-3 w-3 mr-1" /> 댓글
                                                </Button>
                                            </div> */}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}

                    {loadingReview && (
                        <div className="mt-4 space-y-2">
                            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                        </div>
                    )}

                    {/* 무한스크롤 sentinel */}
                    {reviewCursor && <div ref={reviewSentinelRef} className="h-1 w-full" />}
                </>
            )}
        </>
    );
}
