import React, { useMemo, useState, useEffect } from "react";
import { Megaphone, HelpCircle, MessageCircle, Paperclip } from "lucide-react";
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
import { endpoints, getData } from "@/api/apis";
import type { Notice } from '@/types/notice';
import { formatDate } from '@/utils/utils';
import type { Inquiry } from "@/types/inquiry";

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

export type Report = {
    reportId: number;
    userId: number;
    target: number;
    reason: string;
    reportDate: string;
    reportStatus: 'RECEIVED' | 'PROCESSING' | 'DONE';
    reportType: string;
    files: FileMeta[];
};

export type FileMeta = {
    fileId: number;
    fileName: string;
    filePath: string;
    fileSize: string;
    fileType?: string | null;
    fileExt?: string | null;
    createdAt: string;
    isDeleted: 'Y' | 'N';
    deletedAt?: string | null;
    code: string;
};

export function AdminCS() {
    const [tab, setTab] = useState("notice");

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
        
    const [noticeOpen, setNoticeOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Partial<Notice> | null>(null);
    const openNewNotice = () => { setEditingNotice({ title: '', content: '' }); setNoticeOpen(true); };
    const openEditNotice = (n: Notice) => { setEditingNotice({ ...n }); setNoticeOpen(true); };
    const saveNotice = () => {
        if (!editingNotice || !editingNotice.title?.trim() || !editingNotice.content?.trim()) return;
        if (editingNotice.noticeId) {
            setNotices(prev => prev.map(n => n.noticeId === editingNotice.noticeId ? { ...(n as Notice), ...(editingNotice as Notice) } : n));
        } else {
            const newId = Math.floor(Math.random() * 1e6);
            const now = new Date().toISOString().slice(0, 10);
            setNotices(prev => [{
                noticeId : number,
    adId: number,
    title : string,
    content : string,
    viewCnt : number,
    createdAt : Date
            }, ...prev]);
        }
        setNoticeOpen(false); setEditingNotice(null);
    };

    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    
        const getInquiries = async () => {
            const response = await getData(endpoints.getInquiries);
            if (response.status === 200) {
                setInquiries(response.data);
            }
        };
    
        useEffect(() => {
                getInquiries();
            }, []);

    const pagedinq = inquiries.slice((page - 1) * pageSize, page * pageSize);
    const pageinqCount = Math.ceil(inquiries.length / pageSize);

    const [openInquiry, setOpenInquiry] = useState<string | undefined>(undefined);
    const setInquiryStatus = (inqId: number, answered: 'Y' | 'N') => setInquiries(prev => prev.map(i => i.inqId === inqId ? { ...i, isAnswer: answered } : i));

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
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">관리자 고객센터 콘솔</h1>
                    <div className="hidden md:flex items-center gap-2">
                        <Input placeholder="검색" className="w-64" />
                    </div>
                </div>

                <Tabs value={tab} onValueChange={setTab} className="mt-6">
                    <TabsList className="grid grid-cols-3 w-full md:w-auto">
                        <TabsTrigger value="notice" className="flex items-center gap-1"><Megaphone className="w-4 h-4" /> 공지 관리</TabsTrigger>
                        <TabsTrigger value="inquiry" className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 문의 내역</TabsTrigger>
                        <TabsTrigger value="report" className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 신고 내역</TabsTrigger>
                    </TabsList>

                    <TabsContent value="notice">
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>공지사항</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>제목</TableHead>
                                            <TableHead className="w-40">작성일</TableHead>
                                            <TableHead className="w-48">작업</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paged.map(n => (
                                            <TableRow key={n.noticeId}>
                                                <TableCell className="font-medium"><a href={`/cs/notice/${n.noticeId}`}>{n.title}</a></TableCell>
                                                <TableCell className="text-zinc-500">{formatDate(n.createdAt)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => openEditNotice(n)}>수정</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => setNotices(prev => prev.filter(x => x.noticeId !== n.noticeId))}>삭제</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">{page}/{pageCount} 페이지</span>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>이전</Button>
                                        <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))}>다음</Button>
                                        <Button variant="outline" size="sm" onClick={openNewNotice}>글쓰기</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="inquiry">
                        <Card>
                            <CardHeader><CardTitle>문의 내역</CardTitle></CardHeader>
                            <CardContent>
                                <Table className="grid grid-cols-12 gap-2 w-full items-center">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>사유</TableHead>
                                            <TableHead className="col-span-5">제목</TableHead>
                                            <TableHead className="col-span-2">상태</TableHead>
                                            <TableHead className="col-span-3">등록일</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>
                                <Accordion type="single" collapsible value={openInquiry} onValueChange={setOpenInquiry}>
                                    {pagedinq.map(inq => (
                                        <AccordionItem key={inq.inqId} value={String(inq.inqId)}>
                                            <AccordionTrigger>
                                                <div className="grid grid-cols-12 gap-2 w-full items-center">
                                                    <div className="col-span-5 font-medium truncate">{inq.title}</div>
                                                    <div className="col-span-2"><Badge variant="secondary">{inq.ctgr}</Badge></div>
                                                    <div className="col-span-3 text-xs text-zinc-500">{formatDate(inq.createdAt)}</div>
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
                                    <span className="text-xs text-zinc-500">{page}/{pageinqCount} 페이지</span>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>이전</Button>
                                        <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))}>다음</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="report">
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
                                        <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))}>다음</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingNotice?.noticeId ? '공지 수정' : '공지 등록'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-1 block">제목</Label>
                            <Input value={editingNotice?.title ?? ''} onChange={e => setEditingNotice(p => p ? { ...p, title: e.target.value } : p)} placeholder="제목" />
                        </div>
                        <div>
                            <Label className="mb-1 block">내용</Label>
                            <Textarea value={editingNotice?.content ?? ''} onChange={e => setEditingNotice(p => p ? { ...p, content: e.target.value } : p)} rows={6} placeholder="내용" />
                        </div>
                        <div>
                            <Label className="mb-1 block">첨부파일 (표시용)</Label>
                            <Input placeholder="파일명, 쉼표로 구분" onChange={e => {
                                const names = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                const now = new Date().toISOString().slice(0, 10);
                                const files: FileMeta[] = names.map((name, idx) => ({ fileId: Math.floor(Math.random() * 1e6) + idx, fileName: name, filePath: `/files/${name}`, fileSize: '0KB', createdAt: now, isDeleted: 'N', deletedAt: null, code: 'NTC', fileExt: name.split('.').pop() || null, fileType: null }));
                                setEditingNotice(p => p ? { ...p, files } : p);
                            }} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNoticeOpen(false)}>취소</Button>
                        <Button onClick={saveNotice}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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

export function runAdminCSTests() {
    const cmp = AdminCS();
    return {
        hasComponent: typeof cmp === 'function',
        tabs: ['notice', 'inquiry', 'report']
    };
}