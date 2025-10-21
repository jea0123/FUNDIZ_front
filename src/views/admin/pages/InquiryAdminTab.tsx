import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/ui/tabs";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { endpoints, getData, postData } from "@/api/apis";
import { formatDate } from '@/utils/utils';
import type { Inquiry, SearchIqrParams } from "@/types/inquiry";
import type { InquiryReplyDto } from '@/types/reply';
import type { Cursor, CursorPage } from '@/types/community';
import { useNavigate, useSearchParams } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";

// ========= 공용 타입 (DB 스키마 기반) =========

const getByteLen = (s: string) => new TextEncoder().encode(s).length;

export type InquiryCategory = "GENERAL" | "ACCOUNT" | "PAYMENT/REFUNDS" | "SHIPPING/DELIVERY" | "BACKING" | "PROJECT/REWARDS" | "OTHER";

const categoryBadge = (t: InquiryCategory) => (
    <Badge variant="outline" className="rounded-full px-3">
        {t === "GENERAL" ? "일반"
        : (t === "ACCOUNT" ? "회원/계정"
        : (t === "PAYMENT/REFUNDS" ? "결제/환불"
        : (t === "SHIPPING/DELIVERY" ? "배송/수령"
        : (t === "BACKING" ? "후원"
        : (t === "PROJECT/REWARDS" ? "프로젝트/리워드" : "기타")))))}
    </Badge>
);


function useQueryState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "10", 10));
    const perGroup = Math.max(1, parseInt(searchParams.get("perGroup") || "5", 10));
    const keyword = searchParams.get("keyword") || "";

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
    const setKeyword = (k: string) => { setParam({ keyword: k || undefined, page: "1" }); };

    return { page, size, perGroup, keyword, setPage, setSize, setPerGroup, setKeyword, };
}

function useInquiry(params: SearchIqrParams) {
    const { page, size, perGroup, keyword } = params;
    const [items, setItems] = useState<Inquiry[]>([]);
    const [total, setTotal] = useState(0);

    const url = useMemo(() => {
        return endpoints.getInquiries(params);
    }, [page, size, perGroup, keyword]);

    useEffect(() => {( async () => {
                const {status, data} = await getData(url);
                if (status === 200) {
                    setItems(data.items);
                    setTotal(data.totalElements);
                }
            })();
        }, [url]);

    console.log(items);

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


export function InquiryAdminTab() {

    const { page, size, perGroup, keyword, setPage } = useQueryState();
    const { items, total } = useInquiry({ page, size, perGroup, keyword });

    const [openInquiry, setOpenInquiry] = useState<string | undefined>(undefined);

    // 댓글 무한스크롤
    const replySentinelRef = useRef<Record<number, HTMLDivElement | null>>({});
    const replyLoadingLockRef = useRef<Record<number, boolean>>({}); // 중복 호출 방지용 락

    // 댓글
    const [reply, setReply] = useState<Record<number, InquiryReplyDto[]>>({});
    const [replyCursor, setReplyCursor] = useState<Record<number, Cursor | null>>({});
    const [loadingReply, setLoadingReply] = useState<Record<number, boolean>>({});
    const [openReply, setOpenReply] = useState<Record<number, boolean>>({});
    const [postingReply, setPostingReply] = useState<Record<number, boolean>>({});
    const [replyInput, setReplyInput] = useState<Record<number, string>>({});

    //data getcher
    const replyData = useCallback(async (inqId: number, cursor: Cursor | null) => {
            setLoadingReply(prev => ({ ...prev, [inqId]: true }));
            try {
                const params = new URLSearchParams();
                if (cursor) {
                    if (cursor.lastCreatedAt) params.set("lastCreatedAt", cursor.lastCreatedAt);
                    if (cursor.lastId != null) params.set("lastId", String(cursor.lastId));
                }
                params.set("size", "10");
    
                const url = `${endpoints.getInquiryReplyList(inqId)}?${params.toString()}`;
                const { status, data } = await getData(url);
    
                if (status !== 200 || !data) {
                    if (!cursor) setReply(prev => ({ ...prev, [inqId]: [] }));
                    setReplyCursor(prev => ({ ...prev, [inqId]: null }));
                    return;
                }
                const page = data as CursorPage<InquiryReplyDto>;
                const items = Array.isArray(page?.items) ? page.items.filter(Boolean) : [];
                setReply(prev => ({ ...prev, [inqId]: cursor ? ([...(prev[inqId] ?? []), ...items]) : items }));
                setReplyCursor(prev => ({ ...prev, [inqId]: page?.nextCursor ?? null }));
            } finally {
                setLoadingReply(prev => ({ ...prev, [inqId]: false }));
            }
        }, []);

        // 렌더 시 문자열 강제
        const replyText = useCallback((id: number) => {
            const v = replyInput?.[id];
            return typeof v === "string" ? v : "";
        }, [replyInput]);

        // 댓글 패널 토글 (처음 열 때만 로드, 기본값 문자열로 강제)
        const toggleReplies = useCallback((inqId: number) => {
            setOpenReply(prev => ({ ...prev, [inqId]: !prev?.[inqId] }));

            setReply((prev) => ({ ...prev, [inqId]: Array.isArray(prev?.[inqId]) ? prev[inqId] : [] }));
            setReplyInput((prev) => ({ ...prev, [inqId]: typeof prev?.[inqId] === "string" ? prev[inqId] : "" }));
            setLoadingReply((prev) => ({ ...prev, [inqId]: !!prev?.[inqId] }));

            if (!reply?.[inqId]) replyData(inqId, null);
        }, [reply, replyData]);

        //댓글 등록
        const submitReply = useCallback(async (inqId: number) => {
                const content = (replyInput[inqId] ?? "").trim();
                if (content.length === 0) return;
                if (getByteLen(content) > 1000) {
                    alert("최대 (한글 약 330자)까지 입력할 수 있습니다.");
                    return;
                }
        
                setPostingReply(prev => ({ ...prev, [inqId]: true }));
                try {
                    const body = { content };
                    const response = await postData(endpoints.addInquiryReply(inqId), body);
                    if (response.status === 200) {
                        const posted = response.data as InquiryReplyDto;
        
                        if (posted) {
                            setReply(prev => ({ ...prev, [inqId]: [posted, ...(prev[inqId] ?? [])] }));
                        } else {
                            setReplyCursor(prev => ({ ...prev, [inqId]: null }));
                            await replyData(inqId, null);
                        }
        
                        setReplyInput(prev => ({ ...prev, [inqId]: "" }));
                    } else {
                        alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
                    }
                } catch (err) {
                    console.error(err);
                    alert("네트워크 오류가 발생했습니다.");
                } finally {
                    setPostingReply(prev => ({ ...prev, [inqId]: false }));
                }
            }, [replyInput]);

    return (
        <div>
            <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">문의 내역</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible value={openInquiry} onValueChange={setOpenInquiry}>
                                    <div className="grid grid-cols-12 gap-2 w-full items-center">
                                        <div className="col-span-5">제목</div>
                                        <div className="col-span-2">작성자</div>
                                        <div className="col-span-3">유형</div>
                                        <div className="col-span-2">등록일</div>
                                    </div>
                                    {items.map(inq => (
                                        <AccordionItem key={inq.inqId} value={String(inq.inqId)}>
                                            <AccordionTrigger>
                                                <div className="grid grid-cols-12 gap-2 w-full items-center">
                                                    <div className="col-span-5 font-medium truncate">{inq.title}</div>
                                                    <div className="col-span-2 font-medium truncate">{inq.userId}</div>
                                                    <div className="col-span-3">{categoryBadge (inq.ctgr as InquiryCategory)}</div>
                                                    <div className="col-span-2 text-xs text-zinc-500">{formatDate(inq.createdAt)}</div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="rounded-xl border border-zinc-200 p-4 bg-white">
                                                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">{inq.content}</p>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Button variant="ghost" size="sm" onClick={() => toggleReplies(inq.inqId)}>
                                                            <MessageCircle className="h-3 w-3 mr-1" />
                                                                    댓글
                                                                </Button>
                                                            </div>

                                                            {/* 댓글 패널 */}
                                                            {openReply[inq.inqId] && (
                                                                <div className="mt-3 relative rounded-lg border bg-gray-50/70 p-3">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute right-2 top-2 h-7 w-7 text-gray-500 hover:text-gray-700"
                                                                        onClick={() => {
                                                                            setOpenReply((prev) => ({ ...prev, [inq.inqId]: false }))
                                                                            setReplyInput((prev) => ({ ...prev, [inq.inqId]: "" }))
                                                                        }}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                    {/* 목록 */}
                                                                    {(!loadingReply?.[inq.inqId] && (!Array.isArray(reply?.[inq.inqId]) || reply[inq.inqId].length === 0)) ? (
                                                                        <div className="text-xs text-muted-foreground pr-8">아직 답변이 달리지 않았습니다.</div>
                                                                    ) : (
                                                                        <div className="space-y-3">
                                                                            {(reply?.[inq.inqId] ?? []).filter(Boolean).map((rp) => (
                                                                                <div key={rp.replyId} className="flex items-start gap-2">
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-sm font-medium truncate">관리자</span>
                                                                                            <span className="text-[11px] text-gray-500">{formatDate(rp.createdAt)}</span>
                                                                                        </div>
                                                                                        <p className="text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                                                                            {rp.content}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}

                                                                            {loadingReply?.[inq.inqId] && (
                                                                                <div className="space-y-2">
                                                                                    <div className="h-12 animate-pulse rounded-md bg-gray-100" />
                                                                                    <div className="h-12 animate-pulse rounded-md bg-gray-100" />
                                                                                </div>
                                                                            )}

                                                                            {/* 무한스크롤 sentinel */}
                                                                            {replyCursor?.[inq.inqId] && (
                                                                                <div
                                                                                    ref={(el) => {
                                                                                        if (!replySentinelRef.current) replySentinelRef.current = {};
                                                                                        replySentinelRef.current[inq.inqId] = el;
                                                                                    }}
                                                                                    className="h-1 w-full"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* 입력창 */}
                                                                    <div className="mt-3">
                                                                        <div className="rounded-md border bg-white">
                                                                            <Textarea
                                                                                value={replyText(inq.inqId)}
                                                                                onChange={(e) => setReplyInput((prev) => ({ ...prev, [inq.inqId]: e.target.value }))}
                                                                                placeholder="댓글을 입력하세요"
                                                                                className="min-h-[64px] resize-y"
                                                                            />
                                                                        </div>

                                                                        <div className="mt-2 flex items-center justify-between">
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="text-[11px] text-gray-500">
                                                                                    약 {replyText(inq.inqId).length}자
                                                                                </span>
                                                                            </div>

                                                                            <div className="flex items-center gap-3">
                                                                                {replyText(inq.inqId).trim().length > 0 && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setReplyInput((prev) => ({ ...prev, [inq.inqId]: "" }))}
                                                                                        className="text-xs text-gray-500 hover:underline"
                                                                                        disabled={!!postingReply?.[inq.inqId]}
                                                                                    >
                                                                                        지우기
                                                                                    </button>
                                                                                )}
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => submitReply(inq.inqId)}
                                                                                    disabled={!!postingReply?.[inq.inqId] || replyText(inq.inqId).trim().length === 0}
                                                                                >
                                                                                    {postingReply?.[inq.inqId] ? "등록중" : "등록"}
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
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