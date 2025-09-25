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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { endpoints, getData, postData, deleteData } from "@/api/apis";
import type { Notice, NoticeAddRequest, NoticeUpdateRequest } from '@/types/notice';
import { formatDate } from '@/utils/utils';

export function NoticeAdminTab() {
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

    const noticeAdd = async (newNotice: NoticeAddRequest) => {
        const response = await postData(endpoints.addNotice, newNotice);
        if (response.status === 200) {
          alert("공지사항이 등록되었습니다.");
    
          const response = await getData(endpoints.getNotices);
          if (response.status === 200) {
            setNotices(response.data);
          }
        } else {
          alert("공지사항 등록 실패");
          return false;
        }
      };
    
      const noticeUpdate = async (
        noticeId: number,
        updateNotice: NoticeUpdateRequest
      ) => {
        const response = await postData(
          endpoints.updateNotice(noticeId),
          updateNotice
        );
        if (response.status === 200) {
          alert("공지사항이 수정되었습니다.");
    
          const notices = await getData(endpoints.getNotices);
          if (notices.status === 200) {
            setNotices(notices.data);
          }
        } else {
          alert("공지사항 수정 실패");
          return false;
        }
      };

      const noticeDelete = async (noticeId: number) => {
        const response = await deleteData(endpoints.deleteNotice(noticeId));
        if (response.status === 200) {
          alert("공지사항이 삭제되었습니다.");
    
          const response = await getData(endpoints.getNotices);
          if (response.status === 200) {
            setNotices(response.data);
          }  
        } else {
          alert("공지사항 삭제 실패");
          return false;
        }
      };
        
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

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-7xl px-5 py-8">
                <Tabs value={tab} onValueChange={setTab} className="mt-6">
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
                </Tabs>
            </div>

            <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>공지사항 등록</DialogTitle>
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
                        <Button onClick={noticeAdd}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>공지사항 수정</DialogTitle>
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
                        <Button onClick={noticeUpdate}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}