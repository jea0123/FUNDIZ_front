import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import { endpoints, getData, deleteData } from "@/api/apis";
import type { Notice, SearchNoticeParams } from '@/types/notice';
import { formatDate } from '@/utils/utils';
import { useNavigate, useSearchParams } from "react-router-dom";

function useQueryState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "10", 10));
    const perGroup = Math.max(1, parseInt(searchParams.get("perGroup") || "10", 10));
    const keyword = searchParams.get("keyword") || "";

    const setParam = (patch: Record<string, string | undefined>) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(patch).forEach(([k, v]) => {
            if (v && v.length) next.set(k, v);
            else next.delete(k);
        });
        setSearchParams(next, { replace: true });
    };

    const setPage = (p: number) => setParam({ page: String(p) });
    const setSize = (s: number) => setParam({ size: String(s) });
    const setPerGroup = (g: number) => setParam({ size: String(g) });
    const setKeyword = (k: string) => { setParam({ keyword: k || undefined, page: "1" }); };

    return { page, size, perGroup, keyword, setPage, setSize, setPerGroup, setKeyword, };
}

function useNotice(params: SearchNoticeParams) {
    const { page, size, perGroup, keyword } = params;
    const [items, setItems] = useState<Notice[]>([]);
    const [total, setTotal] = useState(0);

    const url = useMemo(() => {
        return endpoints.getNotices(params);
    }, [page, size, perGroup, keyword]);

    useEffect(() => {( async () => {
                const {status, data} = await getData(url);
                if (status === 200) {
                    setItems(data.items);
                    setTotal(data.totalElements);
                }
            })();
        }, [url]);

    console.log(items);

    return { items, total };
}

export function Pagination({ page, size, perGroup, total, onPage }: { page: number; size: number; perGroup: number; total: number; onPage: (p: number) => void }) {
    const lastPage = Math.max(1, Math.ceil(total / size));

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>이전</Button>
        <span className="text-sm text-gray-600">{page} / {lastPage}</span>
        <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>다음</Button>
        </div>
    );
}


export function NoticeAdminTab() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const { page, size, perGroup, keyword, setPage } = useQueryState();
    const { items, total } = useNotice({ page, size, perGroup, keyword });

    const noticeDelete = async (noticeId: number) => {
        const response = await deleteData(endpoints.deleteNotice(noticeId));
        if (response.status === 200) {
          alert("공지사항이 삭제되었습니다.");
          setNotices((prev) => prev.filter((ntc) => ntc.noticeId !== noticeId));
        } else {
          alert("공지사항 삭제 실패");
        }

        window.location.reload();
      };

      const navigate = useNavigate();
      const noticeAddNavigate = () => {
        navigate('../noticeadd');
      };
      
    return (
        <div>
            <div>
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle className="text-2xl">공지사항 관리</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>제목</TableHead>
                                            <TableHead className="w-30">조회수</TableHead>
                                            <TableHead className="w-45">작성일</TableHead>
                                            <TableHead className="w-45">작업</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map(n => (
                                            <TableRow key={n.noticeId}>
                                                <TableCell className="font-medium">
                                                    <a href={`/cs/notice/${n.noticeId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer">{n.title}</a></TableCell>
                                                <TableCell className="font-medium">{n.viewCnt}</TableCell>
                                                <TableCell className="text-zinc-500">{formatDate(n.createdAt)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => navigate(`../noticeupdate?id=${n.noticeId}`)}>수정</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => noticeDelete(n.noticeId)}>삭제</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="mt-4 flex items-center justify-between">
                                    <Pagination page={page} size={size} perGroup={perGroup} total={total} onPage={setPage} />
                                    <div className="flex items-center justify-center gap-2 mt-6">
                                        <Button variant="outline" size="sm" onClick={noticeAddNavigate}>글쓰기</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
            </div>
        </div>
    );
}