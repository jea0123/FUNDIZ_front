import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { endpoints, getData, postData } from "@/api/apis";
import type { Report, ReportStatusUpdateRequest, SearchRptParams } from "@/types/report";
import { useSearchParams, useLocation } from "react-router-dom";
import { formatDate } from '@/utils/utils';


const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

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

function useReport(params: SearchRptParams) {
    const { page, size, perGroup, keyword } = params;
    const [items, setItems] = useState<Report[]>([]);
    const [total, setTotal] = useState(0);

    const url = useMemo(() => {
        return endpoints.getReports(params);
    }, [page, size, perGroup, keyword]);

    useEffect(() => {
        (async () => {
            const { status, data } = await getData(url);
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
                        <CardTitle className="text-2xl">신고 관리</CardTitle>
                        <div className="flex items-center gap-2">
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">상태</TableHead>
                                    <TableHead className="w-20">사유</TableHead>
                                    <TableHead className="w-36">유형</TableHead>
                                    <TableHead className="w-28">신고자</TableHead>
                                    <TableHead className="w-28">대상</TableHead>
                                    <TableHead className="w-32">신고일</TableHead>
                                    <TableHead>수정</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map(r => (
                                    <TableRow key={r.reportId}>
                                        <TableCell>{statusBadge(r.reportStatus as ReportStatus)}</TableCell>
                                        <TableCell className="font-medium truncate">{r.reason}</TableCell>
                                        <TableCell>{typeBadge(r.reportType as ReportType)}</TableCell>
                                        <TableCell>UID {r.userId}</TableCell>
                                        <TableCell>TID {r.target}</TableCell>
                                        <TableCell className="text-zinc-500">{formatDate(r.reportDate)}</TableCell>
                                        <TableCell>
                                            {r.reportStatus === "COMPLETED" ? <Button variant="outline" size="sm" disabled className="text-gray-950 bg-gray-100">완료</Button> : <ReportStatusEditModal reportId={r.reportId} />}
                                        </TableCell>
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

interface ReportStatusEditModalProps {
    reportId: number;
}

export function ReportStatusEditModal({ reportId }: ReportStatusEditModalProps) {

    const [isOpen, setIsOpen] = useState(false);
    const [rptStatusUpdt, setRptStatusUpdt] = useState<ReportStatusUpdateRequest>({
        reportId: Number(reportId),
        reason: "",
        reportStatus: "",
    });

    const fetchRptStatus = async () => {
        const response = await getData(endpoints.getReportDetail(Number(reportId)));
        if (response.status === 200) {
            setRptStatusUpdt(response.data);
        }
        console.log(response.data);
    };

    useEffect(() => {
        fetchRptStatus();
    }, [reportId]);

    const handleRptUpdt = async () => {
        const url = endpoints.updateReportStatus(Number(reportId));
        const response = await postData(url, rptStatusUpdt);
        if (response.status === 200) {
            alert("신고 내역 상태가 수정되었습니다.");
            setIsOpen(false);
            window.location.reload();
        } else {
            alert("신고 내역 상태 수정 실패");
            return false;
        }
    };


    return (
        <div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">수정</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>신고내역 페이지</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        관리자용 신고내역 내용 & 상태 변경 페이지입니다.
                    </DialogDescription>
                    <div className="space-y-3">
                        <Label className="mb-1 block">내용</Label>
                        <div>{rptStatusUpdt.reason}</div>
                        <Label className="mb-1 block">접수 상태</Label>
                        <Select value={rptStatusUpdt.reportStatus} onValueChange={e => setRptStatusUpdt({ ...rptStatusUpdt, reportStatus: e })}>
                            <SelectTrigger><SelectValue placeholder="분류 선택" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RECEIVED">접수</SelectItem>
                                <SelectItem value="UNDER_REVIEW">검토중</SelectItem>
                                <SelectItem value="COMPLETED">완료</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">취소</Button>
                        </DialogClose>
                        <Button onClick={handleRptUpdt}>수정</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
