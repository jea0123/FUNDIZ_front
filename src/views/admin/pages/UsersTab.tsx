import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Input } from "../../../components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { endpoints, getData, postData } from "@/api/apis";
import type { Users, UsersUpdateRequest, SearchUserParams } from '@/types/users';
import { formatDate } from '@/utils/utils';
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export type Role = "USER" | "CREATOR";
export type IsSuspended = "N" | "Y";

const roleBadge = (r: Role) => (
    <Badge variant="outline" className="rounded-full px-3">
        {r === "USER" ? "후원자" : "창작자"}
    </Badge>
);

const statusBadge = (s: IsSuspended) => (
    <Badge variant={s === "N" ? "secondary" : "default"} className="rounded-full px-3">
        {s === "N" ? "활성화" : "정지"}
    </Badge>
);


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

    useEffect(() => {
        (async () => {
            const { status, data } = await getData(url);
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
                        <CardTitle className="text-2xl">회원 관리</CardTitle>
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
                                        <TableCell className="font-medium">{roleBadge(u.role as Role)}</TableCell>
                                        <TableCell className="text-zinc-500">{formatDate(u.joinedAt)}</TableCell>
                                        <TableCell className="text-zinc-500">{formatDate(u.lastLoginAt)}</TableCell>
                                        <TableCell className="font-medium">{statusBadge(u.isSuspended as IsSuspended)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <UserEditModal userId={u.userId} />
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

interface UserEditModalProps {
    userId: number;
}

export function UserEditModal({ userId }: UserEditModalProps) {

    const [isOpen, setIsOpen] = useState(false);
    const [userUpdt, setUserUpdt] = useState<UsersUpdateRequest>({
        userId: Number(userId),
        nickname: "",
        isSuspended: "",
        reason: "",
    });

    const fetchUser = async () => {
        const response = await getData(endpoints.getUserInfo(Number(userId)));
        if (response.status === 200) {
            setUserUpdt(response.data);
        }
        console.log(response.data);
    };

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const handleUserUpdt = async () => {
        const response = await postData(endpoints.updateUser(Number(userId)), userUpdt);
        if (response.status === 200) {
            alert("회원 정보가 수정되었습니다.");
            setIsOpen(false);
            window.location.reload();
        } else {
            alert("회원 정보 수정 실패");
            return false;
        }
    };


    return (
        <div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">수정</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>회원 정보 수정</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        관리자용 회원 정보 수정 페이지입니다.
                    </DialogDescription>
                    <div className="space-y-3">
                        <Label className="mb-1 block">닉네임</Label>
                        <div>{userUpdt.nickname}</div>
                        <Label className="mb-1 block">정지 여부</Label>
                        <Select value={userUpdt.isSuspended} onValueChange={e => setUserUpdt({ ...userUpdt, isSuspended: e })}>
                            <SelectTrigger><SelectValue placeholder="분류 선택" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="N">활성화</SelectItem>
                                <SelectItem value="Y">정지</SelectItem>
                            </SelectContent>
                        </Select>
                        <Label className="mb-1 block">정지 사유</Label>
                        <Textarea
                            className="w-full border p-2 rounded"
                            value={userUpdt.reason}
                            onChange={(e) =>
                                setUserUpdt({ ...userUpdt, reason: e.target.value })
                            }
                            rows={20}
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">취소</Button>
                        </DialogClose>
                        <Button onClick={handleUserUpdt}>수정</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}