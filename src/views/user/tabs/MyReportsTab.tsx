import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { endpoints, getData } from "@/api/apis";
import type { Report, SearchRptParams } from "@/types/report";
import { useSearchParams } from "react-router-dom";
import { formatDate } from '@/utils/utils';
import { useCookies } from "react-cookie";

export type ReportType = "FRAUD" | "COPYRIGHT" | "ILLEGAL" | "OBSCENE" | "PRIVACY" | "DUPLICATE" | "UNCONTACTABLE" | "POLICY" | "OTHER";

export type ReportStatus = "RECEIVED" | "UNDER_REVIEW" | "COMPLETED";

const typeBadge = (t: ReportType) => (
    <Badge variant="outline" className="rounded-full px-3">
        {t === "FRAUD" ? "사기/허위정보"
            : (t === "COPYRIGHT" ? "지식재산권 침해"
                : (t === "ILLEGAL" ? "불법/금지된 상품"
                    : (t === "OBSCENE" ? "음란/선정적/폭력적 컨텐츠"
                        : (t === "PRIVACY" ? "개인정보 침해"
                            : (t === "DUPLICATE" ? "타 플랫폼 동시 판매"
                                : (t === "UNCONTACTABLE" ? "연락 두절"
                                    : (t === "POLICY" ? "정책 위반" : "기타")))))))}
    </Badge>
);

const statusBadge = (r: ReportStatus) => (
    <Badge variant={r === "RECEIVED" ? "default" : (r === "UNDER_REVIEW" ? "secondary" : "outline")} className="rounded-full px-3">
        {r === "RECEIVED" ? "접수" : (r === "UNDER_REVIEW" ? "검토중" : "완료")}
    </Badge>
);

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

function useMyReport(params: SearchRptParams) {
    const [cookie] = useCookies();
    const { page, size, perGroup, keyword } = params;
    const [items, setItems] = useState<Report[]>([]);
    const [total, setTotal] = useState(0);

    const url = useMemo(() => {
        return endpoints.getMyReports(params);
    }, [page, size, perGroup, keyword]);

    useEffect(() => {
        (async () => {
            const { status, data } = await getData(url, cookie.accessToken);
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

export function MyReportsTab() {
    const { page, size, perGroup, keyword, setPage } = useQueryState();
    const { items, total, setItems } = useMyReport({ page, size, perGroup, keyword });

    return (
        <div>
            <div>
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-2xl">
                            내 신고 내역
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">상태</TableHead>
                                    <TableHead className="w-20">사유</TableHead>
                                    <TableHead className="w-36">유형</TableHead>
                                    <TableHead className="w-28">대상</TableHead>
                                    <TableHead className="w-32">신고일</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map(r => (
                                    <TableRow key={r.reportId}>
                                        <TableCell className="py-3">{statusBadge(r.reportStatus as ReportStatus)}</TableCell>
                                        <TableCell className="py-3 font-medium">{r.reason}</TableCell>
                                        <TableCell className="py-3">{typeBadge(r.reportType as ReportType)}</TableCell>
                                        <TableCell className="py-3">TID {r.target}</TableCell>
                                        <TableCell className="py-3 text-zinc-500">{formatDate(r.reportDate)}</TableCell>
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