import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { endpoints, getData, postData } from "@/api/apis";
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

export function MyInquiryTab() {
    const tempUserId = 4;

    const [page, setPage] = useState(1);
    const pageSize = 10;
    
    const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
    
    const getMyInquiries = async () => {
        const response = await getData(endpoints.getMyInquiries(tempUserId));
        if (response.status === 200) {
            setMyInquiries(response.data);
        }
    };

    console.log(myInquiries);
    
        useEffect(() => {
                getMyInquiries();
            }, []);

    const pagedinq = myInquiries.slice((page - 1) * pageSize, page * pageSize);
    const pageinqCount = Math.ceil(myInquiries.length / pageSize);

    const [openInquiry, setOpenInquiry] = useState<string | undefined>(undefined);
    const setMyInquiryStatus = (inqId: number, answered: 'Y' | 'N') => setMyInquiries(prev => prev.map(i => i.inqId === inqId ? { ...i, isAnswer: answered } : i));

    return (
        <div>
            <div>
                        <Card>
                            <CardHeader><CardTitle>내 문의 내역</CardTitle></CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible value={openInquiry} onValueChange={setOpenInquiry}>
                                    <div className="grid grid-cols-12 gap-2 w-full items-center">
                                        <div className="col-span-5">제목</div>
                                        <div className="col-span-3">유형</div>
                                        <div className="col-span-2">등록일</div>
                                    </div>
                                    {pagedinq.map(inq => (
                                        <AccordionItem key={inq.inqId} value={String(inq.inqId)}>
                                            <AccordionTrigger>
                                                <div className="grid grid-cols-12 gap-2 w-full items-center">
                                                    <div className="col-span-5 font-medium truncate">{inq.title}</div>
                                                    <div className="col-span-3"><Badge variant="secondary">{inq.ctgr}</Badge></div>
                                                    <div className="col-span-2 text-xs text-zinc-500">{formatDate(inq.createdAt)}</div>
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
                                        <Button variant="outline" size="sm" disabled={page === pageinqCount} onClick={() => setPage(p => Math.min(pageinqCount, p + 1))}>다음</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
            </div>
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