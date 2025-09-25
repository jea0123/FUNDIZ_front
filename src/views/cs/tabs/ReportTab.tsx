import React, { useEffect, useState } from "react";
import { Megaphone, MessageCircle, Paperclip, Send, Siren } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Notice } from '@/types/notice';
import { formatDate } from '@/utils/utils';
import { endpoints, getData } from "@/api/apis";

export function ReportTab() {
    const [activeTab, setActiveTab] = useState("notice");

    const [notices, setNotices] = useState<Notice[]>([]);

    const getNotices = async () => {
        const response = await getData(endpoints.getNotices);
        if (response.status === 200) {
            setNotices(response.data);
        }
    };

    useEffect(() => {
            getNotices();
        }, []);

    const [page, setPage] = useState(1);
    const pageSize = 10;
    const paged = notices.slice((page - 1) * pageSize, page * pageSize);
    const pageCount = Math.ceil(notices.length / pageSize);

    const [tickets, setTickets] = useState([
        { id: "T-240801", category: "결제/영수증", title: "영수증 재발행 부탁드립니다", status: "답변완료", createdAt: "2025-08-01" },
        { id: "T-240726", category: "배송", title: "주소를 잘못 입력했어요", status: "처리중", createdAt: "2025-07-26" }
    ]);
    const [form, setForm] = useState({ category: "일반", title: "", content: "", files: [] as File[] });

    const [reports, setReports] = useState([
        { id: "R-240812", category: "사기 의심", title: "허위 배송정보 의심", status: "접수", createdAt: "2025-08-12" }
    ]);
    const [reportForm, setReportForm] = useState({ category: "사기 의심", title: "", content: "", files: [] as File[] });

    const submitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return alert("제목/내용을 입력해 주세요");
        const newId = `T-${Date.now().toString().slice(-6)}`;
        setTickets(prev => [
            { id: newId, category: form.category, title: form.title, status: "접수", createdAt: new Date().toISOString().slice(0, 10) },
            ...prev
        ]);
        setForm({ category: "일반", title: "", content: "", files: [] });
        alert("문의가 접수되었습니다.");
    };

    const submitReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportForm.title.trim() || !reportForm.content.trim()) return alert("제목/내용을 입력해 주세요");
        const newId = `R-${Date.now().toString().slice(-6)}`;
        setReports(prev => [
            { id: newId, category: reportForm.category, title: reportForm.title, status: "접수", createdAt: new Date().toISOString().slice(0, 10) },
            ...prev
        ]);
        setReportForm({ category: "사기 의심", title: "", content: "", files: [] });
        alert("신고가 접수되었습니다.");
    };

    return (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Siren className="w-5 h-5" /> 신고하기</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submitReport} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="mb-1 block">분류</Label>
                                                <Select value={reportForm.category} onValueChange={(v) => setReportForm({ ...reportForm, category: v })}>
                                                    <SelectTrigger><SelectValue placeholder="분류 선택" /></SelectTrigger>
                                                    <SelectContent>
                                                        {['사기 의심', '허위/과장 광고', '지식재산권 침해', '기타'].map(o => (
                                                            <SelectItem key={o} value={o}>{o}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="mb-1 block">제목</Label>
                                            <Input value={reportForm.title} onChange={e => setReportForm({ ...reportForm, title: e.target.value })} placeholder="제목을 입력" />
                                        </div>
                                        <div>
                                            <Label className="mb-1 block">내용</Label>
                                            <Textarea value={reportForm.content} onChange={e => setReportForm({ ...reportForm, content: e.target.value })} rows={6} placeholder="신고 사유를 자세히 입력하세요" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="inline-flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                                <Paperclip className="w-4 h-4" /> 파일 첨부
                                                <Input type="file" multiple className="hidden" onChange={e => { const fs = Array.from((e.target as HTMLInputElement).files || []); setReportForm({ ...reportForm, files: fs as File[] }); }} />
                                            </Label>
                                            <Button type="submit" className="flex items-center gap-2"><Send className="w-4 h-4" /> 제출</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>내 신고 내역</CardTitle></CardHeader>
                                <CardContent>
                                    <ul className="divide-y divide-zinc-200">
                                        {reports.map(r => (
                                            <li key={r.id} className="py-3">
                                                <p className="text-zinc-900 font-medium truncate">{r.title}</p>
                                                <p className="text-xs text-zinc-500 mt-1">#{r.id} · {r.category} · {r.createdAt}</p>
                                                <Badge variant={r.status === '접수' ? 'secondary' : 'default'} className="mt-2">{r.status}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
    );
}
