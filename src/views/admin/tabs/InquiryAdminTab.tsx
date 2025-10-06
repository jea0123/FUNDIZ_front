import React, { useMemo, useState, useEffect } from "react";
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
import { useNavigate, useSearchParams } from "react-router-dom";

// ========= 공용 타입 (DB 스키마 기반) =========


export type Reply = {
    replyId: number;
    userId?: number;
    content: string;
    isSecret: 'Y' | 'N';
    createdAt: string;
    updatedAt?: string | null;
    isDeleted: 'Y' | 'N';
    deletedAt?: string | null;
};


function useQueryState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "10", 10));
    const perGroup = Math.max(1, parseInt(searchParams.get("perGroup") || "10", 10));
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

    return (
        <div>
            <div>
                        <Card>
                            <CardHeader><CardTitle>문의 내역</CardTitle></CardHeader>
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
                                                    <div className="col-span-3"><Badge variant="secondary">{inq.ctgr}</Badge></div>
                                                    <div className="col-span-2 text-xs text-zinc-500">{formatDate(inq.createdAt)}</div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="rounded-xl border border-zinc-200 p-4 bg-white">
                                                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">{inq.content}</p>
                            
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

function ReplyComposer({ onSubmit }: { onSubmit: (payload: { userId?: number; content: string; isSecret: 'Y' | 'N' }) => void }) {
    const [content, setContent] = useState("");
    const [secret, setSecret] = useState<'Y' | 'N'>('N');
    return (
        <div className="mt-3 border-t pt-3">
            <Label className="mb-1 block">댓글 작성</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="댓글 내용을 입력" />
            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    <Checkbox id="isSecret" checked={secret === 'Y'} onCheckedChange={(v) => setSecret(v ? 'Y' : 'N')} />
                    <Label htmlFor="isSecret">비밀댓글</Label>
                </div>
                <Button size="sm" onClick={() => { if (!content.trim()) return; onSubmit({ userId: 1, content, isSecret: secret }); setContent(""); }}>등록</Button>
            </div>
        </div>
    );
}