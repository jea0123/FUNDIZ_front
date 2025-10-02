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
import { NoticeAddTab } from "./NoticeAddTab";
import { useNavigate } from "react-router-dom";

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

      const navigate = useNavigate();

      const noticeAddNavigate = () => {
        navigate('?tab=noticeadd');
      };



    return (
        <div>
            <div>
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>공지사항 관리</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-20">번호</TableHead>
                                            <TableHead>제목</TableHead>
                                            <TableHead className="w-40">작성일</TableHead>
                                            <TableHead className="w-48">작업</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paged.map(n => (
                                            <TableRow key={n.noticeId}>
                                                <TableCell className="font-medium">{n.noticeId}</TableCell>
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
                                        <Button variant="outline" size="sm" onClick={noticeAddNavigate}>글쓰기</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
            </div>
        </div>
    );
}