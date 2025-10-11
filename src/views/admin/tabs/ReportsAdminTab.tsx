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
import { endpoints, getData, postData } from "@/api/apis";
import type { Report, SearchRptParams } from "@/types/report";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDate } from '@/utils/utils';

// ========= 공용 타입 (DB 스키마 기반) =========


export type ReportStatus = {
    reportStatus: 'RECEIVED' | 'PROCESSING' | 'DONE';
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

function useReport(params: SearchRptParams) {
    const { page, size, perGroup, keyword } = params;
    const [items, setItems] = useState<Report[]>([]);
    const [total, setTotal] = useState(0);

    const url = useMemo(() => {
        return endpoints.getReports(params);
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

    return { items, total, setItems };
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

export function ReportsAdminTab() {

    const { page, size, perGroup, keyword, setPage } = useQueryState();
    const { items, total, setItems } = useReport({ page, size, perGroup, keyword });

    return (
        <div>
            <div>
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>신고 내역</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Select value={reportFilter} onValueChange={(v) => setReportFilter(v as any)}>
                                        <SelectTrigger className="w-40"><SelectValue placeholder="상태 필터" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="전체">전체</SelectItem>
                                            <SelectItem value="RECEIVED">접수</SelectItem>
                                            <SelectItem value="UNDER_REVIEW">검토중</SelectItem>
                                            <SelectItem value="COMPLETED">완료</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>사유</TableHead>
                                            <TableHead className="w-36">유형</TableHead>
                                            <TableHead className="w-28">신고자</TableHead>
                                            <TableHead className="w-28">대상</TableHead>
                                            <TableHead className="w-40">상태</TableHead>
                                            <TableHead className="w-32">신고일</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map(r => (
                                            <TableRow key={r.reportId}>
                                                <TableCell className="font-medium">{r.reason}</TableCell>
                                                <TableCell>{r.reportType}</TableCell>
                                                <TableCell>UID {r.userId}</TableCell>
                                                <TableCell>TID {r.target}</TableCell>
                                                <TableCell>
                                                    <Select value={r.reportStatus} onValueChange={(v) => updateReportStatus(r.reportId, v as ReportStatus['reportStatus'])}>
                                                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="RECEIVED">접수</SelectItem>
                                                            <SelectItem value="UNDER_REVIEW">검토중</SelectItem>
                                                            <SelectItem value="COMPLETED">완료</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-zinc-500">{formatDate(r.reportDate)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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