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
import type { Qna, SearchQnaParams } from "@/types/qna";
import { useNavigate, useSearchParams } from "react-router-dom";

// ========= 공용 타입 (DB 스키마 기반) =========

//TODO: 임시용 폴백 id (나중에 삭제하기)
const tempUserId = 24;


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

    const url = useMemo(() => {
        return endpoints.getQnAListOfUser(tempUserId, params);
    }, [page, size, perGroup]);

    useEffect(() => {( async () => {
                const {status, data} = await getData(url);
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

    return (
        <div>
            <div>
                        <Card>
                            <CardHeader><CardTitle>내 Q&A 내역</CardTitle></CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible value={openQna} onValueChange={setOpenQna}>
                                    <div className="grid grid-cols-12 gap-2 w-full items-center">
                                        <div className="col-span-4">프로젝트명</div>
                                        <div className="col-span-6">내용</div>
                                        <div className="col-span-2">등록일</div>
                                    </div>
                                    {items.map(inq => (
                                        <AccordionItem key={inq.qnaId} value={String(inq.qnaId)}>
                                            <AccordionTrigger>
                                                <div className="grid grid-cols-12 gap-2 w-full items-center">
                                                    <div className="col-span-4 font-medium truncate">
                                                        <a href={`/project/${inq.projectId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer">{inq.title}</a></div>
                                                    <div className="col-span-6 font-medium truncate">{inq.content}</div>
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
