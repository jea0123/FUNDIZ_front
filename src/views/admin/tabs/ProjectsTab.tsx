import React, { useEffect, useState } from "react";
import { LayoutList } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Project } from '@/types/projects';
import { formatDate } from '@/utils/utils';
import { endpoints, getData } from "@/api/apis";

export function ProjectsTab() {
        const [projects, setProjects] = useState<Project[]>([]);

    const getProjects = async () => {
        const response = await getData(endpoints.getProjects);
        if (response.status === 200) {
            setProjects(response.data);
        }
    };

    useEffect(() => {
            getProjects();
        }, []);

    const [page, setPage] = useState(1);
    const pageSize = 10;
    const paged = projects.slice((page - 1) * pageSize, page * pageSize);
    const pageCount = Math.ceil(projects.length / pageSize);

    return (
        <div>
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2"><LayoutList className="w-5 h-5" /> 프로젝트 목록</CardTitle>
                                <span className="text-sm text-zinc-500">총 {projects.length}건</span>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-24">번호</TableHead>
                                            <TableHead>프로젝트명</TableHead>
                                            <TableHead className="w-24">조회수</TableHead>
                                            <TableHead className="w-40">등록일</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projects.length == 0 ? (
                                            <TableRow>
                                                <TableCell>프로젝트가 존재하지 않습니다.</TableCell>
                                            </TableRow>
                                        ) : (<>
                                        {paged.map((pj) => (
                                            <TableRow key={pj.projectId}>
                                                <TableCell>{pj.projectId}</TableCell>
                                                <TableCell><a href={`/project/${pj.projectId}`}>{pj.title}</a></TableCell>
                                                <TableCell>{pj.viewCnt}</TableCell>
                                                <TableCell className="text-zinc-500">{formatDate(pj.createdAt)}</TableCell>
                                            </TableRow>
                                        ))}
                                        </>)}
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
                        </div>
    );
}
