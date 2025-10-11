import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { getData, postData, deleteData } from "@/api/apis";
import { endpoints } from "@/api/apis";
import { formatDate } from "@/utils/utils";
import { Badge } from "@/components/ui/badge";
import FundingLoader from "@/components/FundingLoader";
import { Textarea } from "@/components/ui/textarea";

type Props = {
    open: boolean;
    projectId: number;
    projectTitle?: string;
    onClose: () => void;
    onReplied?: () => void; // 답글 저장/삭제 후 부모 카운트 갱신 등
};

type ReviewItem = {
    reviewId: number;
    rating: number;               // 1~5
    content: string;
    createdAt: string;            // ISO
    hasPhoto?: boolean;
    images?: string[];            // 선택
    reply?: string | null;        // 기존 답글
    // 클라이언트 전용
    _draft?: string;              // 편집 중 답글
};

type SortKey = "recent" | "oldest" | "rating_desc" | "rating_asc";

export default function ReviewsSheet({ open, projectId, projectTitle, onClose, onReplied }: Props) {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ReviewItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    // 필터
    const [rating, setRating] = useState<string>("");
    const [hasPhoto, setHasPhoto] = useState<string>("");
    const [pendingOnly, setPendingOnly] = useState<string>("");
    const [sort, setSort] = useState<SortKey>("recent");

    // const fetchReviews = useCallback(async () => {
    //     if (!open) return;
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const params = {
    //             rating: rating || undefined,
    //             hasPhoto: hasPhoto || undefined,
    //             pending: pendingOnly || undefined,
    //             sort,
    //             page: 1,
    //             size: 20,
    //         };
    //         const res = await getData(endpoints.getCreatorReviews(projectId, params));
    //         const list: ReviewItem[] = res?.data?.items ?? [];
    //         // draft 초기값 동기화
    //         setItems(list.map(r => ({ ...r, _draft: r.reply ?? "" })));
    //     } catch (e: any) {
    //         setError(e?.message ?? "후기를 불러오지 못했습니다.");
    //         setItems([]);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [open, projectId, rating, hasPhoto, pendingOnly, sort]);

    // useEffect(() => {
    //     fetchReviews();
    // }, [fetchReviews]);

    // const updateDraft = useCallback((id: number, v: string) => {
    //     setItems(prev => prev.map(r => (r.reviewId === id ? { ...r, _draft: v } : r)));
    // }, []);

    // const saveReply = useCallback(async (id: number) => {
    //     const r = items.find(x => x.reviewId === id);
    //     if (!r) return;
    //     const text = (r._draft ?? "").trim();
    //     try {
    //         // upsert
    //         await postData(endpoints.upsertReviewReply(id), { reply: text });
    //         // 낙관적 업데이트
    //         setItems(prev => prev.map(x => (x.reviewId === id ? { ...x, reply: text } : x)));
    //         onReplied?.();
    //     } catch (e: any) {
    //         alert(e?.message ?? "답글 저장에 실패했습니다.");
    //     }
    // }, [items, onReplied]);

    // const deleteReply = useCallback(async (id: number) => {
    //     if (!confirm("답글을 삭제하시겠습니까?")) return;
    //     try {
    //         await deleteData(endpoints.deleteReviewReply(id));
    //         setItems(prev => prev.map(x => (x.reviewId === id ? { ...x, reply: null, _draft: "" } : x)));
    //         onReplied?.();
    //     } catch (e: any) {
    //         alert(e?.message ?? "답글 삭제에 실패했습니다.");
    //     }
    // }, [onReplied]);

    const headerInfo = useMemo(() => {
        const total = items.length;
        const pending = items.filter(i => !i.reply || i.reply.trim() === "").length;
        return { total, pending };
    }, [items]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{projectTitle}</div>
                <div className="text-xs text-muted-foreground">
                    총 {headerInfo.total}건 · 미답글 {headerInfo.pending}건
                </div>
            </div>

            {/* 필터 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                    <Label>별점</Label>
                    <Select value={rating} onValueChange={setRating}>
                        <SelectTrigger><SelectValue placeholder="전체" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">전체</SelectItem>
                            <SelectItem value="5">★5</SelectItem>
                            <SelectItem value="4">★4</SelectItem>
                            <SelectItem value="3">★3</SelectItem>
                            <SelectItem value="2">★2</SelectItem>
                            <SelectItem value="1">★1</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label>사진</Label>
                    <Select value={hasPhoto} onValueChange={setHasPhoto}>
                        <SelectTrigger><SelectValue placeholder="전체" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">전체</SelectItem>
                            <SelectItem value="Y">있음</SelectItem>
                            <SelectItem value="N">없음</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label>미답글</Label>
                    <Select value={pendingOnly} onValueChange={setPendingOnly}>
                        <SelectTrigger><SelectValue placeholder="전체" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">전체</SelectItem>
                            <SelectItem value="Y">미답글만</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label>정렬</Label>
                    <Select value={sort} onValueChange={(v: SortKey) => setSort(v)}>
                        <SelectTrigger><SelectValue placeholder="최신순" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">최신순</SelectItem>
                            <SelectItem value="oldest">오래된순</SelectItem>
                            <SelectItem value="rating_desc">별점 높은순</SelectItem>
                            <SelectItem value="rating_asc">별점 낮은순</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 리스트 */}
            {loading ? (
                <FundingLoader />
            ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground">후기가 없습니다.</p>
            ) : (
                <div className="space-y-3">
                    {items.map(r => (
                        <Card key={r.reviewId}>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <span>★{r.rating}</span>
                                        <span className="ml-2 text-muted-foreground">{formatDate(r.createdAt)}</span>
                                        {r.hasPhoto && <Badge className="ml-2" variant="secondary">사진</Badge>}
                                        {!r.reply && <Badge className="ml-2" variant="outline">미답글</Badge>}
                                    </div>
                                </div>

                                <p className="text-sm whitespace-pre-wrap">{r.content}</p>

                                {/* 이미지 썸네일 (선택) */}
                                {!!r.images?.length && (
                                    <div className="flex gap-2 flex-wrap">
                                        {r.images.map((src, idx) => (
                                            <img key={idx} src={src} alt="" className="h-16 w-16 object-cover rounded-md border" />
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-xs">답글</Label>
                                    <Textarea
                                        rows={3}
                                        // value={replyDraft}
                                        // onChange={(e) => setReplyDraft(e.target.value)}
                                        placeholder="답글을 입력하세요"
                                    />
                                    <div className="flex justify-end gap-2">
                                        {!!r.reply && (
                                            <Button variant="outline" size="sm"
                                            // onClick={() => deleteReply(r.reviewId)}

                                            >
                                                삭제
                                            </Button>
                                        )}
                                        <Button size="sm"
                                        // onClick={() => saveReply(r.reviewId)}
                                        >
                                            {r.reply ? "수정" : "작성"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="flex justify-end pt-1">
                <Button variant="outline" onClick={onClose}>닫기</Button>
            </div>
        </div>
    );
}
