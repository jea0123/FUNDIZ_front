import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { endpoints, getData } from "@/api/apis";
import { formatDate } from '@/utils/utils';
import type { Qna, SearchQnaParams } from "@/types/qna";
import type { QnaReplyDto } from "@/types/reply";
import type { Cursor, CursorPage } from "@/types/community";
import { useSearchParams } from "react-router-dom";
import { MessageCircle, SquareArrowOutUpRight, X } from "lucide-react";
import { useCookies } from "react-cookie";

function useQueryState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "10", 10));
    const perGroup = Math.max(1, parseInt(searchParams.get("perGroup") || "5", 10));

    const setParam = (patch: Record<string, string | undefined>) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(patch).forEach(([k, v]) => {
            if (v && v.length) next.set(k, v);
            else next.delete(k);
        });
        setSearchParams(next, { replace: true });
    };

    const setPage = (p: number) => setParam({ page: String(p) });
    const setSize = (s: number) => setParam({ size: String(s) });
    const setPerGroup = (g: number) => setParam({ size: String(g) });

    return { page, size, perGroup, setPage, setSize, setPerGroup };
}

function useQna(params: SearchQnaParams) {
    const { page, size, perGroup } = params;
    const [items, setItems] = useState<Qna[]>([]);
    const [total, setTotal] = useState(0);
    const [cookie] = useCookies();

    const url = useMemo(() => {
        return endpoints.getQnAListOfUser(params);
    }, [page, size, perGroup]);

    useEffect(() => {
        (async () => {
            const { status, data } = await getData(url, cookie.accessToken);
            if (status === 200) {
                setItems(data.items);
                setTotal(data.totalElements);
            }
        })();
    }, [url]);
    return { items, total };
}

export function Pagination({ page, size, perGroup, total, onPage }: { page: number; size: number; perGroup: number; total: number; onPage: (p: number) => void }) {
    const lastPage = Math.max(1, Math.ceil(total / size));

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>이전</Button>
            <span className="text-sm text-gray-600">{page} / {lastPage}</span>
            <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>다음</Button>
        </div>
    );
}

export function MyQnATab() {

    const { page, size, perGroup, setPage } = useQueryState();
    const { items, total } = useQna({ page, size, perGroup });

    const [openQna, setOpenQna] = useState<string | undefined>(undefined);

    // 댓글 무한스크롤
        const replySentinelRef = useRef<Record<number, HTMLDivElement | null>>({});
        const replyLoadingLockRef = useRef<Record<number, boolean>>({}); // 중복 호출 방지용 락
    
        // 댓글
        const [reply, setReply] = useState<Record<number, QnaReplyDto[]>>({});
        const [replyCursor, setReplyCursor] = useState<Record<number, Cursor | null>>({});
        const [loadingReply, setLoadingReply] = useState<Record<number, boolean>>({});
        const [openReply, setOpenReply] = useState<Record<number, boolean>>({});
        const [postingReply, setPostingReply] = useState<Record<number, boolean>>({});
        const [replyInput, setReplyInput] = useState<Record<number, string>>({});
    
        //data getcher
        const replyData = useCallback(async (qnaId: number, cursor: Cursor | null) => {
                setLoadingReply(prev => ({ ...prev, [qnaId]: true }));
                try {
                    const params = new URLSearchParams();
                    if (cursor) {
                        if (cursor.lastCreatedAt) params.set("lastCreatedAt", cursor.lastCreatedAt);
                        if (cursor.lastId != null) params.set("lastId", String(cursor.lastId));
                    }
                    params.set("size", "10");
        
                    const url = `${endpoints.getQnaReplyList(qnaId)}?${params.toString()}`;
                    const { status, data } = await getData(url);
        
                    if (status !== 200 || !data) {
                        if (!cursor) setReply(prev => ({ ...prev, [qnaId]: [] }));
                        setReplyCursor(prev => ({ ...prev, [qnaId]: null }));
                        return;
                    }
                    const page = data as CursorPage<QnaReplyDto>;
                    const items = Array.isArray(page?.items) ? page.items.filter(Boolean) : [];
                    setReply(prev => ({ ...prev, [qnaId]: cursor ? ([...(prev[qnaId] ?? []), ...items]) : items }));
                    setReplyCursor(prev => ({ ...prev, [qnaId]: page?.nextCursor ?? null }));
                } finally {
                    setLoadingReply(prev => ({ ...prev, [qnaId]: false }));
                }
            }, []);
    
            // 렌더 시 문자열 강제
            const replyText = useCallback((id: number) => {
                const v = replyInput?.[id];
                return typeof v === "string" ? v : "";
            }, [replyInput]);
    
            // 댓글 패널 토글 (처음 열 때만 로드, 기본값 문자열로 강제)
            const toggleReplies = useCallback((qnaId: number) => {
                setOpenReply(prev => ({ ...prev, [qnaId]: !prev?.[qnaId] }));
    
                setReply((prev) => ({ ...prev, [qnaId]: Array.isArray(prev?.[qnaId]) ? prev[qnaId] : [] }));
                setReplyInput((prev) => ({ ...prev, [qnaId]: typeof prev?.[qnaId] === "string" ? prev[qnaId] : "" }));
                setLoadingReply((prev) => ({ ...prev, [qnaId]: !!prev?.[qnaId] }));
    
                if (!reply?.[qnaId]) replyData(qnaId, null);
            }, [reply, replyData]);

    return (
        <div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl">
                            내 Q&A 내역
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible value={openQna} onValueChange={setOpenQna}>
                            <div className="grid grid-cols-12 gap-2 w-full items-center">
                                <div className="col-span-5">프로젝트명</div>
                                <div className="col-span-5">내용</div>
                                <div className="col-span-2">등록일</div>

                            </div>
                            {items.map(q => (
                                <AccordionItem key={q.qnaId} value={String(q.qnaId)}>
                                    <AccordionTrigger>
                                        <div className="grid grid-cols-12 gap-2 w-full items-center">
                                            <div className="col-span-4 font-medium truncate">
                                                {q.title}</div>
                                            <div className="col-span-1"><a href={`/project/${q.projectId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"><SquareArrowOutUpRight className="w-4 h-4"/></a></div>
                                            <div className="col-span-5 font-medium truncate">{q.content}</div>
                                            <div className="col-span-2 text-xs text-zinc-500">{formatDate(q.createdAt)}</div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="rounded-xl border border-zinc-200 p-4 bg-white">
                                            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{q.content}</p>
                                                <div className="flex items-center gap-2 mt-3">
                                                        <Button variant="ghost" size="sm" onClick={() => toggleReplies(q.qnaId)}>
                                                            <MessageCircle className="h-3 w-3 mr-1" />
                                                                    댓글
                                                                </Button>
                                                            </div>

                                                            {/* 댓글 패널 */}
                                                            {openReply[q.qnaId] && (
                                                                <div className="mt-3 relative rounded-lg border bg-gray-50/70 p-3">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute right-2 top-2 h-7 w-7 text-gray-500 hover:text-gray-700"
                                                                        onClick={() => {
                                                                            setOpenReply((prev) => ({ ...prev, [q.qnaId]: false }))
                                                                            setReplyInput((prev) => ({ ...prev, [q.qnaId]: "" }))
                                                                        }}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                    {/* 목록 */}
                                                                    {(!loadingReply?.[q.qnaId] && (!Array.isArray(reply?.[q.qnaId]) || reply[q.qnaId].length === 0)) ? (
                                                                        <div className="text-xs text-muted-foreground pr-8">아직 답변이 달리지 않았습니다.</div>
                                                                    ) : (
                                                                        <div className="space-y-3">
                                                                            {(reply?.[q.qnaId] ?? []).filter(Boolean).map((rp) => (
                                                                                <div key={rp.replyId} className="flex items-start gap-2">
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-sm font-medium truncate">{rp.creatorId}</span>
                                                                                            <span className="text-[11px] text-gray-500">{formatDate(rp.createdAt)}</span>
                                                                                        </div>
                                                                                        <p className="text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                                                                            {rp.content}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}

                                                                            {loadingReply?.[q.qnaId] && (
                                                                                <div className="space-y-2">
                                                                                    <div className="h-12 animate-pulse rounded-md bg-gray-100" />
                                                                                    <div className="h-12 animate-pulse rounded-md bg-gray-100" />
                                                                                </div>
                                                                            )}

                                                                            {/* 무한스크롤 sentinel */}
                                                                            {replyCursor?.[q.qnaId] && (
                                                                                <div
                                                                                    ref={(el) => {
                                                                                        if (!replySentinelRef.current) replySentinelRef.current = {};
                                                                                        replySentinelRef.current[q.qnaId] = el;
                                                                                    }}
                                                                                    className="h-1 w-full"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                            )}        
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Pagination page={page} size={size} perGroup={perGroup} total={total} onPage={setPage} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
