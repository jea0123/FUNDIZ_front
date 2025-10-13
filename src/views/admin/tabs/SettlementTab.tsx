import React, { useEffect, useState } from "react";
import { Loader2, Search, CheckCircle2, Clock, ChevronsUpDown, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SettlementItem, SettlementSummary } from "@/types/settlement";
import { endpoints, getData, postData } from "@/api/apis";
import type { PageResult } from "@/types/admin";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatNumber, formatPrice } from "@/utils/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type SettlementStatus = "WAITING" | "PAID";

const statusBadge = (s: SettlementStatus) => (
    <Badge variant={s === "PAID" ? "default" : "secondary"} className="rounded-full px-3">
        {s === "PAID" ? "지급완료" : "지급대기"}
    </Badge>
);

const SettlementTab: React.FC = () => {
    const [q, setQ] = useState("");
    const [status, setStatus] = useState<SettlementStatus | "ALL">("ALL");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(1);  // 1-based
    const [size, setSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState<PageResult<SettlementItem> | null>(null);
    const [summary, setSummary] = useState<SettlementSummary>({ waitingAmount: 0, completedAmount: 0, settledCount: 0, bank: null, account: null });

    const [selected, setSelected] = useState<SettlementItem | null>(null);

    const getSettlements = async () => {
        const res = await getData(endpoints.getSettlements({ q, status, from, to, page, size }));
        if (res?.status === 200 && res.data) {
            setList(res.data as PageResult<SettlementItem>);
        } else {
            console.error("Failed to fetch settlements:", res);
            setList(null);
        }
    };

    const getSettlementSummary = async () => {
        const res = await getData(endpoints.getSettlementSummary);
        if (res?.status === 200 && res.data) {
            setSummary(res.data as SettlementSummary);
        } else {
            console.error("Failed to fetch settlement summary:", res);
        }
    };

    useEffect(() => {
        setLoading(true);
        getSettlementSummary().finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setLoading(true);
        getSettlements().finally(() => setLoading(false));
    }, [page, size, status, q, from, to]);

    const onSearch = () => setPage(1);

    const updateSettlementStatus = async (settlementId: number, projectId: number, creatorId: number, settlementStatus: SettlementStatus) => {
        const res = await postData(endpoints.updateStatus, { settlementId, projectId, creatorId, settlementStatus });
        if (res?.status === 200) {
            getSettlements();
        }
        console.log(`Updating settlement ${settlementId} to ${status}`);
    };

    const downloadStatement = async (settlementId: number) => {
        try {
            const response = await fetch(endpoints.downloadSettlementStatement(settlementId));
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `정산서_${settlementId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Failed to download statement');
            }
        } catch (error) {
            console.error('Error downloading statement:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-3">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                    <Input
                        placeholder="프로젝트, 크리에이터 검색"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="grid gap-1">
                        <label htmlFor="from" className="text-sm text-muted-foreground">시작일</label>
                        <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                    </div>
                    <div className="grid gap-1">
                        <label htmlFor="to" className="text-sm text-muted-foreground">종료일</label>
                        <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                    </div>
                </div>

                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="상태" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">전체</SelectItem>
                        <SelectItem value="WAITING">지급대기</SelectItem>
                        <SelectItem value="PAID">지급완료</SelectItem>
                    </SelectContent>
                </Select>

                <Button onClick={onSearch}>검색</Button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base font-medium"><Clock className="h-4 w-4" />지급 대기</CardTitle></CardHeader>
                    <CardContent className="text-2xl font-semibold">{formatPrice(summary.waitingAmount)}</CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base font-medium"><CheckCircle2 className="h-4 w-4" />지급 완료</CardTitle></CardHeader>
                    <CardContent className="text-2xl font-semibold">{formatPrice(summary.completedAmount)}</CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-base font-medium">완료 건수</CardTitle></CardHeader>
                    <CardContent className="text-2xl font-semibold">{formatNumber(summary.settledCount)}건</CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-base">정산 목록</CardTitle></CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[110px]">정산일</TableHead>
                                    <TableHead>프로젝트</TableHead>
                                    <TableHead>창작자</TableHead>
                                    <TableHead className="text-right">총 금액</TableHead>
                                    <TableHead className="text-right">수수료</TableHead>
                                    <TableHead className="text-right">정산액</TableHead>
                                    <TableHead className="text-center">상태</TableHead>
                                    <TableHead className="text-center">보기</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10">
                                            <Loader2 className="h-4 w-4 inline-block mr-2 animate-spin" /> 불러오는 중…
                                        </TableCell>
                                    </TableRow>
                                ) : list && list.items.length ? (
                                    list.items.map((s) => (
                                        <TableRow key={s.settlementId}>
                                            <TableCell>{formatDate(s.settlementDate as any)}</TableCell>
                                            <TableCell className="max-w-[240px] truncate" title={s.projectTitle ?? String(s.projectId)}>
                                                {s.projectTitle ?? `#${s.projectId}`}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={s.creatorName ?? String(s.creatorId)}>
                                                {s.creatorName ?? `#${s.creatorId}`}
                                            </TableCell>
                                            <TableCell className="text-right">{formatPrice(s.totalAmount)}</TableCell>
                                            <TableCell className="text-right">{formatPrice(s.fee)}</TableCell>
                                            <TableCell className="text-right font-medium flex items-center justify-end gap-2">
                                                {formatPrice(s.settlementAmount)}
                                            </TableCell>
                                            <TableCell className="text-center">{statusBadge(s.settlementStatus as SettlementStatus)}</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="outline" size="sm" onClick={() => setSelected(s)}>상세보기</Button>
                                            </TableCell>
                                            <TableCell className="text-right font-medium flex items-center justify-end gap-2">
                                                {formatPrice(s.settlementAmount)}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="inline-flex items-center">
                                                            {statusBadge(s.settlementStatus as any)}
                                                            <ChevronsUpDown className="ml-1 h-3 w-3 opacity-60" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32">
                                                        <DropdownMenuItem
                                                            disabled={s.settlementStatus === "WAITING"}
                                                            onClick={() => updateSettlementStatus(s.settlementId, s.projectId, s.creatorId, "WAITING")}
                                                        >
                                                            지급대기
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            disabled={s.settlementStatus === "PAID"}
                                                            onClick={() => updateSettlementStatus(s.settlementId, s.projectId, s.creatorId, "PAID")}
                                                        >
                                                            지급완료
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={7} className="text-center py-10">정산 내역이 없습니다.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {list && (
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                            <div className="text-sm text-muted-foreground">
                                총 {formatNumber(list.totalElements)}건 • {list.page}/{list.totalPages || 1} 페이지
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={!list.hasPrev} onClick={() => setPage(list.prevPage)}>
                                    이전
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.max(0, list.groupEnd - list.groupStart + 1) }).map((_, i) => {
                                        const p = (list.groupStart ?? 1) + i;
                                        const active = p === list.page;
                                        return (
                                            <Button
                                                key={p}
                                                variant={active ? "default" : "outline"}
                                                size="sm"
                                                className={active ? "" : "bg-background"}
                                                onClick={() => setPage(p)}
                                            >
                                                {p}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button variant="outline" size="sm" disabled={!list.hasNext} onClick={() => setPage(list.nextPage)}>
                                    다음
                                </Button>
                                <Select value={String(size)} onValueChange={(v) => { setSize(Number(v)); setPage(1); }}>
                                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[10, 20, 50].map((n) => (<SelectItem key={n} value={String(n)}>{n}/페이지</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>정산 상세</DialogTitle>
                    </DialogHeader>

                    {selected && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-sm text-muted-foreground">정산 ID</div>
                                <div className="text-sm">{selected.settlementId}</div>

                                <div className="text-sm text-muted-foreground">프로젝트</div>
                                <div className="text-sm">{selected.projectTitle ?? `#${selected.projectId}`}</div>

                                <div className="text-sm text-muted-foreground">창작자</div>
                                <div className="text-sm">{selected.creatorName ?? `#${selected.creatorId}`}</div>

                                <div className="text-sm text-muted-foreground">정산일</div>
                                <div className="text-sm">{formatDate(selected.settlementDate as any)}</div>

                                <div className="text-sm text-muted-foreground">상태</div>
                                <div>{statusBadge(selected.settlementStatus as SettlementStatus)}</div>
                            </div>

                            <div className="rounded-md border p-3 grid grid-cols-2 gap-2 bg-muted/30">
                                <div className="text-sm text-muted-foreground">총 금액</div>
                                <div className="text-right font-medium">{formatPrice(selected.totalAmount)}</div>

                                <div className="text-sm text-muted-foreground">수수료</div>
                                <div className="text-right">{formatPrice(selected.fee)}</div>

                                <div className="text-sm text-muted-foreground">정산액</div>
                                <div className="text-right text-base font-semibold">{formatPrice(selected.settlementAmount)}</div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        {selected?.settlementStatus === "WAITING" ? (
                            <Button
                                onClick={async () => {
                                    await updateSettlementStatus(selected!.settlementId, selected!.projectId, selected!.creatorId, "PAID");
                                    setSelected(null);
                                    getSettlements();
                                }}
                            >
                                지급완료 처리
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    await updateSettlementStatus(selected!.settlementId, selected!.projectId, selected!.creatorId, "WAITING");
                                    setSelected(null);
                                    getSettlements();
                                }}
                            >
                                지급대기로 되돌리기
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => downloadStatement(selected!.settlementId)}>
                            <Download className="h-4 w-4 mr-2" /> 정산서 다운로드
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SettlementTab;
