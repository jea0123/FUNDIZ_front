import React, { useMemo, useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Notice, SearchNoticeParams } from '@/types/notice';
import { formatDate } from '@/utils/utils';
import { endpoints, getData } from "@/api/apis";
import { useNavigate, useSearchParams } from "react-router-dom";

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

function useNotice(params: SearchNoticeParams) {
    const { page, size, perGroup, keyword } = params;
    const [items, setItems] = useState<Notice[]>([]);
    const [total, setTotal] = useState(0);

    const url = useMemo(() => {
        return endpoints.getNotices(params);
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

export function NoticeTab() {
    
    const [notices, setNotices] = useState<Notice[]>([]);
    const { page, size, perGroup, keyword, setPage } = useQueryState();
    const { items, total } = useNotice({ page, size, perGroup, keyword });

    return (
        <div>
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-xl"><Megaphone className="w-5 h-5" /> 공지사항</CardTitle>
                                <span className="text-sm text-zinc-500">총 {total}건</span>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>제목</TableHead>
                                            <TableHead className="w-40">조회수</TableHead>
                                            <TableHead className="w-40">등록일</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {total == 0 ? (
                                            <TableRow>
                                                <TableCell>게시글이 존재하지 않습니다.</TableCell>
                                            </TableRow>
                                        ) : (<>
                                        {items.map((ntc) => (
                                            <TableRow key={ntc.noticeId}>
                                                <TableCell><a href={`/cs/notice/${ntc.noticeId}`}>{ntc.title}</a></TableCell>
                                                <TableCell>{ntc.viewCnt}</TableCell>
                                                <TableCell className="text-zinc-500">{formatDate(ntc.createdAt)}</TableCell>
                                            </TableRow>
                                        ))}
                                        </>)}
                                    </TableBody>
                                </Table>
                                <div className="mt-4 flex items-center justify-between">
                                    <Pagination page={page} size={size} perGroup={perGroup} total={total} onPage={setPage} />
                                </div>
                            </CardContent>
                        </Card>
                        </div>
    );
}
