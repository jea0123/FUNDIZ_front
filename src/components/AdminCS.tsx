import React, { useMemo, useState } from "react";
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

// ========= 공용 타입 (DB 스키마 기반) =========
export type Notice = {
    noticeId: number;
    adId: number;
    title: string;
    content: string;
    viewCnt: number;
    createdAt: string;
    updatedAt: string;
    isDeleted: 'Y' | 'N';
    deletedAt?: string | null;
    files: FileMeta[];
};

export type Inquiry = {
    inqId: number;
    userId: number;
    adId: number;
    title: string;
    content: string;
    createdAt: string;
    isCanceled: 'Y' | 'N';
    canceledAt?: string | null;
    ctgr: 'NORMAL' | 'PAYMENT' | 'DELIVERY' | 'ACCOUNT';
    isAnswer: 'Y' | 'N';
    files: FileMeta[];
    replies: Reply[];
};

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

    const [notices, setNotices] = useState<Notice[]>([
        {
            noticeId: 1001, adId: 1, title: '정기 점검 안내', content: '8/30 02:00~04:00',
            viewCnt: 23, createdAt: '2025-08-20', updatedAt: '2025-08-20', isDeleted: 'N', deletedAt: null,
            files: [
                { fileId: 9001, fileName: '점검상세.pdf', filePath: '/files/9001', fileSize: '120KB', fileType: 'application/pdf', fileExt: 'pdf', createdAt: '2025-08-20', isDeleted: 'N', deletedAt: null, code: 'NTC' }
            ]
        },
        {
            noticeId: 1002, adId: 1, title: '카테고리 오픈', content: '테크 · 리빙',
            viewCnt: 5, createdAt: '2025-08-18', updatedAt: '2025-08-18', isDeleted: 'N', deletedAt: null,
            files: []
        }
    ]);

    const [noticeOpen, setNoticeOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Partial<Notice> | null>(null);
    const openNewNotice = () => { setEditingNotice({ title: '', content: '', files: [] }); setNoticeOpen(true); };
    const openEditNotice = (n: Notice) => { setEditingNotice({ ...n }); setNoticeOpen(true); };
    const saveNotice = () => {
        if (!editingNotice || !editingNotice.title?.trim() || !editingNotice.content?.trim()) return;
        if (editingNotice.noticeId) {
            setNotices(prev => prev.map(n => n.noticeId === editingNotice.noticeId ? { ...(n as Notice), ...(editingNotice as Notice) } : n));
        } else {
            const newId = Math.floor(Math.random() * 1e6);
            const now = new Date().toISOString().slice(0, 10);
            setNotices(prev => [{
                noticeId: newId, adId: 1, title: editingNotice.title!, content: editingNotice.content!, viewCnt: 0,
                createdAt: now, updatedAt: now, isDeleted: 'N', deletedAt: null, files: (editingNotice.files as FileMeta[]) ?? []
            }, ...prev]);
        }
        setNoticeOpen(false); setEditingNotice(null);
    };

    type Faq = { faqId: number; adId: number; title: string; content: string; createdAt: string; updateAt: string; isDeleted: 'Y' | 'N'; deletedAt?: string | null };
    const [faqs, setFaqs] = useState<Faq[]>([
        { faqId: 1, adId: 1, title: '환불 규정은?', content: '종료 전 취소 가능, 종료 후 정책에 따름', createdAt: '2025-08-10', updateAt: '2025-08-10', isDeleted: 'N' },
        { faqId: 2, adId: 1, title: '배송 조회는?', content: '마이페이지 > 주문/결제에서 확인', createdAt: '2025-08-11', updateAt: '2025-08-11', isDeleted: 'N' }
    ]);
    const [faqOpen, setFaqOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<Partial<Faq> | null>(null);
    const openNewFaq = () => { setEditingFaq({ title: '', content: '' }); setFaqOpen(true); };
    const openEditFaq = (f: Faq) => { setEditingFaq({ ...f }); setFaqOpen(true); };
    const saveFaq = () => {
        if (!editingFaq || !editingFaq.title?.trim() || !editingFaq.content?.trim()) return;
        if (editingFaq.faqId) {
            const now = new Date().toISOString().slice(0, 10);
            setFaqs(prev => prev.map(f => f.faqId === editingFaq.faqId ? { ...(f as Faq), title: editingFaq.title!, content: editingFaq.content!, updateAt: now } : f));
        } else {
            const id = Math.floor(Math.random() * 1e6);
            const now = new Date().toISOString().slice(0, 10);
            setFaqs(prev => [{ faqId: id, adId: 1, title: editingFaq.title!, content: editingFaq.content!, createdAt: now, updateAt: now, isDeleted: 'N' }, ...prev]);
        }
        setFaqOpen(false); setEditingFaq(null);
    };

    const [inquiries, setInquiries] = useState<Inquiry[]>([
        {
            inqId: 7001, userId: 11, adId: 1, title: '영수증 재발행 부탁드립니다', content: '세부 내역 포함해서 부탁드립니다',
            createdAt: '2025-08-01', isCanceled: 'N', canceledAt: null, ctgr: 'PAYMENT', isAnswer: 'N',
            files: [{ fileId: 9101, fileName: '영수증.jpg', filePath: '/files/9101', fileSize: '340KB', fileExt: 'jpg', createdAt: '2025-08-01', isDeleted: 'N', deletedAt: null, code: 'INQ' }],
            replies: []
        },
        {
            inqId: 7002, userId: 12, adId: 1, title: '주소를 잘못 입력했어요', content: '배송지 변경 가능할까요?',
            createdAt: '2025-07-26', isCanceled: 'N', canceledAt: null, ctgr: 'DELIVERY', isAnswer: 'Y',
            files: [],
            replies: [{ replyId: 5001, userId: 1, content: '배송 시작 전에는 변경 가능합니다.', isSecret: 'N', createdAt: '2025-07-26', updatedAt: null, isDeleted: 'N', deletedAt: null }]
        }
    ]);
    const [openInquiry, setOpenInquiry] = useState<string | undefined>(undefined);
    const addReply = (inqId: number, reply: Omit<Reply, 'replyId' | 'createdAt' | 'isDeleted'>) => {
        setInquiries(prev => prev.map(i => i.inqId === inqId ? {
            ...i,
            isAnswer: 'Y',
            replies: [{ replyId: Math.floor(Math.random() * 1e6), createdAt: new Date().toISOString().slice(0, 10), isDeleted: 'N', ...reply }, ...i.replies]
        } : i));
    };
    const setInquiryStatus = (inqId: number, answered: 'Y' | 'N') => setInquiries(prev => prev.map(i => i.inqId === inqId ? { ...i, isAnswer: answered } : i));

    const [reports, setReports] = useState<Report[]>([
        { reportId: 3001, userId: 21, target: 900, reason: '허위 배송정보 의심', reportDate: '2025-08-12', reportStatus: 'RECEIVED', reportType: '사기 의심', files: [{ fileId: 9301, fileName: '증빙.png', filePath: '/files/9301', fileSize: '220KB', fileExt: 'png', createdAt: '2025-08-12', isDeleted: 'N', deletedAt: null, code: 'RPT' }] }
    ]);
    const [reportFilter, setReportFilter] = useState<'전체' | 'RECEIVED' | 'PROCESSING' | 'DONE'>('전체');
    const filteredReports = useMemo(() => reports.filter(r => reportFilter === '전체' ? true : r.reportStatus === reportFilter), [reports, reportFilter]);
    const updateReportStatus = (id: number, status: Report['reportStatus']) => setReports(prev => prev.map(r => r.reportId === id ? { ...r, reportStatus: status } : r));

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
                    <TabsList className="grid grid-cols-4 w-full md:w-auto">
                        <TabsTrigger value="notice" className="flex items-center gap-1"><Megaphone className="w-4 h-4" /> 공지 관리</TabsTrigger>
                        <TabsTrigger value="faq" className="flex items-center gap-1"><HelpCircle className="w-4 h-4" /> FAQ 관리</TabsTrigger>
                        <TabsTrigger value="inquiry" className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 문의 내역</TabsTrigger>
                        <TabsTrigger value="report" className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 신고 내역</TabsTrigger>
                    </TabsList>

                    <TabsContent value="notice">
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>공지사항</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" onClick={openNewNotice}>등록</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>제목</TableHead>
                                            <TableHead className="w-24">첨부</TableHead>
                                            <TableHead className="w-40">작성일</TableHead>
                                            <TableHead className="w-48">작업</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {notices.map(n => (
                                            <TableRow key={n.noticeId}>
                                                <TableCell className="font-medium">{n.title}</TableCell>
                                                <TableCell>
                                                    {n.files.length > 0 ? (
                                                        <span className="inline-flex items-center gap-1 text-zinc-700"><Paperclip className="w-4 h-4" /> {n.files.length}</span>
                                                    ) : <span className="text-zinc-400">-</span>}
                                                </TableCell>
                                                <TableCell className="text-zinc-500">{n.createdAt}</TableCell>
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
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="faq">
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>자주하는질문</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" onClick={openNewFaq}>등록</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>제목</TableHead>
                                            <TableHead>내용</TableHead>
                                            <TableHead className="w-48">작업</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {faqs.map(f => (
                                            <TableRow key={f.faqId}>
                                                <TableCell className="font-medium">{f.title}</TableCell>
                                                <TableCell className="text-zinc-600">{f.content}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => openEditFaq(f)}>수정</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => setFaqs(prev => prev.filter(x => x.faqId !== f.faqId))}>삭제</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="inquiry">
                        <Card>
                            <CardHeader><CardTitle>문의 내역</CardTitle></CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible value={openInquiry} onValueChange={setOpenInquiry}>
                                    {inquiries.map(inq => (
                                        <AccordionItem key={inq.inqId} value={String(inq.inqId)}>
                                            <AccordionTrigger>
                                                <div className="grid grid-cols-12 gap-2 w-full items-center">
                                                    <div className="col-span-5 font-medium truncate">{inq.title}</div>
                                                    <div className="col-span-2"><Badge variant={inq.isAnswer === 'Y' ? "default" : "secondary"}>{inq.isAnswer === 'Y' ? "답변완료" : "미답변"}</Badge></div>
                                                    <div className="col-span-2"><Badge variant="secondary">{inq.ctgr}</Badge></div>
                                                    <div className="col-span-3 text-xs text-zinc-500">{inq.createdAt}</div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="rounded-xl border border-zinc-200 p-4 bg-white">
                                                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">{inq.content}</p>
                                                    {inq.files.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {inq.files.map(f => (
                                                                <div key={f.fileId} className="border rounded p-2">
                                                                    <img src={f.filePath} alt={f.fileName} className="max-h-40 object-contain" />
                                                                    <p className="text-xs text-zinc-500 mt-1">{f.fileName}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="mt-4">
                                                        <p className="font-medium">댓글 {inq.replies.length}개</p>
                                                        <ul className="mt-2 space-y-2">
                                                            {inq.replies.map(r => (
                                                                <li key={r.replyId} className="rounded-lg border p-2">
                                                                    <p className="text-sm text-zinc-800">{r.content}</p>
                                                                    <p className="text-[11px] text-zinc-500 mt-1">{r.createdAt} {r.isSecret === 'Y' && '(비밀)'}</p>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <ReplyComposer onSubmit={(payload) => addReply(inq.inqId, payload)} />
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
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
                                            <SelectItem value="RECEIVED">RECEIVED</SelectItem>
                                            <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                                            <SelectItem value="DONE">DONE</SelectItem>
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
                                            <TableHead className="w-24">첨부</TableHead>
                                            <TableHead className="w-40">상태</TableHead>
                                            <TableHead className="w-32">신고일</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredReports.map(r => (
                                            <TableRow key={r.reportId}>
                                                <TableCell className="font-medium">{r.reason}</TableCell>
                                                <TableCell>{r.reportType}</TableCell>
                                                <TableCell>UID {r.userId}</TableCell>
                                                <TableCell>TID {r.target}</TableCell>
                                                <TableCell>
                                                    {r.files.length > 0 ? (
                                                        <span className="inline-flex items-center gap-1 text-zinc-700"><Paperclip className="w-4 h-4" /> {r.files.length}</span>
                                                    ) : <span className="text-zinc-400">-</span>}
                                                </TableCell>
                                                <TableCell>
                                                    <Select value={r.reportStatus} onValueChange={(v) => updateReportStatus(r.reportId, v as Report['reportStatus'])}>
                                                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="RECEIVED">RECEIVED</SelectItem>
                                                            <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                                                            <SelectItem value="DONE">DONE</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-zinc-500">{r.reportDate}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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

            <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFaq?.faqId ? 'FAQ 수정' : 'FAQ 등록'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-1 block">제목</Label>
                            <Input value={editingFaq?.title ?? ''} onChange={e => setEditingFaq(p => p ? { ...p, title: e.target.value } : p)} placeholder="제목" />
                        </div>
                        <div>
                            <Label className="mb-1 block">내용</Label>
                            <Textarea value={editingFaq?.content ?? ''} onChange={e => setEditingFaq(p => p ? { ...p, content: e.target.value } : p)} rows={6} placeholder="내용" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFaqOpen(false)}>취소</Button>
                        <Button onClick={saveFaq}>저장</Button>
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
        tabs: ['notice', 'faq', 'inquiry', 'report']
    };
}
