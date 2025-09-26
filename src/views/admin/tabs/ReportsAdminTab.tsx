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

// ========= 공용 타입 (DB 스키마 기반) =========


export type Report = {
    reportId: number;
    userId: number;
    target: number;
    reason: string;
    reportDate: string;
    reportStatus: 'RECEIVED' | 'PROCESSING' | 'DONE';
    reportType: string;
};

export function ReportsAdminTab() {
    
    const [page, setPage] = useState(1);
    const pageSize = 10;
    
    const [reports, setReports] = useState<Report[]>([]);
    
        const getReports = async () => {
            const response = await getData(endpoints.getReports);
            if (response.status === 200) {
                setReports(response.data);
            }
        };
    
        useEffect(() => {
                getReports();
            }, []);


    const [reportFilter, setReportFilter] = useState<'전체' | 'RECEIVED' | 'UNDER_REVIEW' | 'COMPLETED'>('전체');
    const filteredReports = useMemo(() => reports.filter(r => reportFilter === '전체' ? true : r.reportStatus === reportFilter), [reports, reportFilter]);
    const updateReportStatus = (id: number, status: Report['reportStatus']) => setReports(prev => prev.map(r => r.reportId === id ? { ...r, reportStatus: status } : r));

    const pagedrpt = filteredReports.slice((page - 1) * pageSize, page * pageSize);
    const pagerptCount = Math.ceil(filteredReports.length / pageSize);

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-7xl px-5 py-8">
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
                                        {pagedrpt.map(r => (
                                            <TableRow key={r.reportId}>
                                                <TableCell className="font-medium">{r.reason}</TableCell>
                                                <TableCell>{r.reportType}</TableCell>
                                                <TableCell>UID {r.userId}</TableCell>
                                                <TableCell>TID {r.target}</TableCell>
                                                <TableCell>
                                                    <Select value={r.reportStatus} onValueChange={(v) => updateReportStatus(r.reportId, v as Report['reportStatus'])}>
                                                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="RECEIVED">접수</SelectItem>
                                                            <SelectItem value="UNDER_REVIEW">검토중</SelectItem>
                                                            <SelectItem value="COMPLETED">완료</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-zinc-500">{r.reportDate}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">{page}/{pagerptCount} 페이지</span>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>이전</Button>
                                        <Button variant="outline" size="sm" disabled={page === pagerptCount} onClick={() => setPage(p => Math.min(pagerptCount, p + 1))}>다음</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
            </div>
        </div>
    );
}