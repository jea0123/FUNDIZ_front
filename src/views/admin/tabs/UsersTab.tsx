import { useState, useEffect, useMemo } from "react";
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
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { endpoints, getData, deleteData } from "@/api/apis";
import type { Users, SearchUserParams } from '@/types/admin';
import { formatDate } from '@/utils/utils';
import { useNavigate, useSearchParams } from "react-router-dom";



function useQueryState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "10", 10));
    const perGroup = Math.max(1, parseInt(searchParams.get("perGroup") || "5    ", 10));
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

function useUsers(params: SearchUserParams) {
    const { page, size, perGroup, keyword } = params;
    const [items, setItems] = useState<Users[]>([]);
    const [total, setTotal] = useState(0);

    const url = useMemo(() => {
        return endpoints.getUsers(params);
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


export function UsersTab() {
    const { page, size, perGroup, keyword, setPage } = useQueryState();
    const { items, total } = useUsers({ page, size, perGroup, keyword });

    return (
        <div>
            <div>
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>회원 관리</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex space-x-2">
                            <Input placeholder="회원 검색 (이름, 이메일)" className="max-w-sm" />
                            <Select>
                                <SelectTrigger className="w-40"><SelectValue placeholder="계정 상태" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">전체</SelectItem>
                                    <SelectItem value="active">활성</SelectItem>
                                    <SelectItem value="suspended">정지</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button>검색</Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">ID</TableHead>
                                    <TableHead>이메일</TableHead>
                                    <TableHead className="w-30">닉네임</TableHead>
                                    <TableHead className="w-30">권한</TableHead>
                                    <TableHead className="w-30">가입일</TableHead>
                                    <TableHead className="w-30">최종접속일</TableHead>
                                    <TableHead className="w-30">정지여부</TableHead>
                                    <TableHead className="w-45">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map(u => (
                                    <TableRow key={u.userId}>
                                        <TableCell className="font-medium">{u.userId}</TableCell>
                                        <TableCell className="font-medium">{u.email}</TableCell>
                                        <TableCell className="font-medium">{u.nickname}</TableCell>
                                        <TableCell className="font-medium">{u.role}</TableCell>
                                        <TableCell className="text-zinc-500">{formatDate(u.joinedAt)}</TableCell>
                                        <TableCell className="text-zinc-500">{formatDate(u.lastLoginAt)}</TableCell>
                                        <TableCell className="font-medium">{u.isSuspended}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" >수정</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-4 flex items-center justify-between">
                            <Pagination page={page} size={size} perGroup={perGroup} total={total} onPage={setPage} />
                            <div className="flex items-center justify-center gap-2 mt-6">
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}