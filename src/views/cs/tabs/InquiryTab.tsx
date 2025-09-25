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

export function InquiryTab() {
    const [tickets, setTickets] = useState([
        { id: "T-240801", category: "결제/영수증", title: "영수증 재발행 부탁드립니다", status: "답변완료", createdAt: "2025-08-01" },
        { id: "T-240726", category: "배송", title: "주소를 잘못 입력했어요", status: "처리중", createdAt: "2025-07-26" }
    ]);
    const [form, setForm] = useState({ category: "일반", title: "", content: "", files: [] as File[] });

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

    return (
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
                                        </div>
                                        <div>
                                            <Label className="mb-1 block">제목</Label>
                                            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="제목을 입력" />
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
    );
}

