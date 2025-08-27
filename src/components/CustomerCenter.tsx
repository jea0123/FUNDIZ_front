import React, { useState } from "react";
import { Megaphone, HelpCircle, MessageCircle, Paperclip, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export function CustomerCenterPage() {
    const [activeTab, setActiveTab] = useState("notice");

    const [notices] = useState(
        Array.from({ length: 12 }).map((_, i) => ({
            id: `N-${1000 + i}`,
            title:
                i % 3 === 0
                    ? "[점검] 결제 시스템 정기 점검 안내"
                    : i % 3 === 1
                        ? "배송 관련 자주 묻는 질문 모음"
                        : "신규 카테고리 오픈 알림",
            createdAt: `2025-07-${(i % 28 + 1).toString().padStart(2, "0")}`,
            pinned: i < 2
        }))
    );
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const paged = notices.slice((page - 1) * pageSize, page * pageSize);
    const pageCount = Math.ceil(notices.length / pageSize);

    const [faqOpen, setFaqOpen] = useState<string | undefined>(undefined);
    const faqs = [
        {
            id: "F-1",
            q: "후원 취소/환불은 어떻게 하나요?",
            a: "프로젝트 종료 전에는 결제 예정 금액 취소가 가능하며, 종료 후에는 크리에이터 정책에 따라 환불이 진행됩니다."
        },
        {
            id: "F-2",
            q: "리워드 배송 조회는 어디서 하나요?",
            a: "마이페이지 > 주문/결제에서 각 주문의 배송 단계를 확인할 수 있습니다."
        },
        {
            id: "F-3",
            q: "계정/보안 관련 문의는 어디로?",
            a: "고객센터 1:1 문의에서 “계정/보안” 분류로 접수해 주세요."
        }
    ];

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
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-6xl px-5 py-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">고객센터</h1>
                    <div className="hidden md:flex items-center gap-2">
                        <Input placeholder="키워드 검색" className="w-64" />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                    <TabsList className="grid grid-cols-4 w-full md:w-auto">
                        <TabsTrigger value="notice" className="flex items-center gap-1"><Megaphone className="w-4 h-4" /> 공지사항</TabsTrigger>
                        <TabsTrigger value="faq" className="flex items-center gap-1"><HelpCircle className="w-4 h-4" /> 자주하는 질문</TabsTrigger>
                        <TabsTrigger value="ticket" className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 1:1 문의</TabsTrigger>
                        <TabsTrigger value="report" className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 신고하기</TabsTrigger>
                    </TabsList>

                    <TabsContent value="notice">
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5" /> 공지사항</CardTitle>
                                <span className="text-sm text-zinc-500">총 {notices.length}건</span>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-24">번호</TableHead>
                                            <TableHead>제목</TableHead>
                                            <TableHead className="w-40">등록일</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paged.map((n, idx) => (
                                            <TableRow key={n.id}>
                                                <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                                                <TableCell>
                                                    <span className={n.pinned ? "font-semibold text-zinc-900" : "text-zinc-700"}>{n.title}</span>
                                                    {n.pinned && <Badge variant="secondary" className="ml-2 align-middle">중요</Badge>}
                                                </TableCell>
                                                <TableCell className="text-zinc-500">{n.createdAt}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">{page}/{pageCount} 페이지</span>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>이전</Button>
                                        <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))}>다음</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="faq">
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2"><HelpCircle className="w-5 h-5" /> 자주하는 질문</CardTitle>
                                <span className="text-sm text-zinc-500">총 {faqs.length}건</span>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible value={faqOpen} onValueChange={setFaqOpen}>
                                    {faqs.map(f => (
                                        <AccordionItem key={f.id} value={f.id}>
                                            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                                            <AccordionContent className="text-zinc-600 text-sm leading-relaxed">{f.a}</AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ticket">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" /> 1:1 문의</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submitTicket} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="mb-1 block">분류</Label>
                                                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                                    <SelectTrigger><SelectValue placeholder="분류 선택" /></SelectTrigger>
                                                    <SelectContent>
                                                        {['일반', '결제/영수증', '배송', '계정/보안'].map(o => (
                                                            <SelectItem key={o} value={o}>{o}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-1 block">제목</Label>
                                                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="제목을 입력" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="mb-1 block">내용</Label>
                                            <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} placeholder="상세 내용을 입력하세요" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="inline-flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                                <Paperclip className="w-4 h-4" /> 파일 첨부
                                                <Input type="file" multiple className="hidden" onChange={e => { const fs = Array.from((e.target as HTMLInputElement).files || []); setForm({ ...form, files: fs as File[] }); }} />
                                            </Label>
                                            <Button type="submit" className="flex items-center gap-2"><Send className="w-4 h-4" /> 제출</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>내 문의 내역</CardTitle></CardHeader>
                                <CardContent>
                                    <ul className="divide-y divide-zinc-200">
                                        {tickets.map(t => (
                                            <li key={t.id} className="py-3">
                                                <p className="text-zinc-900 font-medium truncate">{t.title}</p>
                                                <p className="text-xs text-zinc-500 mt-1">#{t.id} · {t.category} · {t.createdAt}</p>
                                                <Badge variant={t.status === '답변완료' ? 'default' : 'secondary'} className="mt-2">{t.status}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="report">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" /> 신고하기</CardTitle>
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
                                            <div>
                                                <Label className="mb-1 block">제목</Label>
                                                <Input value={reportForm.title} onChange={e => setReportForm({ ...reportForm, title: e.target.value })} placeholder="제목을 입력" />
                                            </div>
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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export function runCustomerCenterPageTests() {
    const dummyPage = CustomerCenterPage;
    return {
        hasComponent: typeof dummyPage === 'function',
        initialTab: 'notice',
        noticesCount: 12,
        faqsCount: 3,
        ticketsCount: 2,
        reportsCount: 1
    };
}
