import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Pencil, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { endpoints, getData, postData } from "@/api/apis";
import { useNavigate } from "react-router-dom";
import FundingLoader from "@/components/FundingLoader";
import { useQueryState } from "./VerificationQueue";
import { formatDate, getDaysLeft } from "@/utils/utils";
import type { AdminProjectList } from "@/types/admin";
import { ProjectStatusChip, type ProjectStatus } from "../components/ProjectStatusChip";
import { Pagination } from "@/views/project/ProjectsBrowsePage";

function ProjectCard({ p, onChanged }: { p: AdminProjectList; onChanged: () => void }) {
    const canVerify = p.projectStatus === "VERIFYING";
    const canCancel = ["VERIFYING", "UPCOMING", "OPEN"].includes(p.projectStatus);
    const [cancel, setCancel] = useState(false);

    const navigate = useNavigate();

    const goEdit = () => navigate(`/admin/project/${p.projectId}`);
    const goVerifyDetail = () => {
        if (!canVerify) return;
        navigate(`/admin/verify/${p.projectId}`);
    }
    const goCancel = async () => {
        if (!confirm(`[${p.title}]\n프로젝트를 취소하시겠습니까?`)) return;
        try {
            setCancel(true);
            await postData(endpoints.cancelProject(p.projectId));
            alert(`[${p.title}]\n취소되었습니다.`);
            onChanged();
        } finally {
            setCancel(false);
        }
    }

    return (
        <Card className="block">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 flex-wrap">
                    <span className="mr-1 truncate">{p.title}</span>
                    <ProjectStatusChip status={p.projectStatus as ProjectStatus} />
                    {["UPCOMING", "OPEN"].includes(p.projectStatus) && (
                        <span>({getDaysLeft(p.endDate)}일 남음)</span>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>기간: {formatDate(p.startDate)} ~ {formatDate(p.endDate)}</div>
                    <div>카테고리: {p.ctgrName} &gt; {p.subctgrName}</div>
                    <div>현재/목표금액: {p.currAmount.toLocaleString()} / {p.goalAmount.toLocaleString()} ({p.percentNow}%)</div>
                    <div>후원자 수: {p.backerCnt.toLocaleString()}</div>
                    <div>창작자: {p.creatorName}</div>
                    <div>마지막 수정일: {formatDate(p.updatedAt)}</div>
                </div>
            </CardContent>

            <CardFooter className="justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={goEdit}>
                    <Pencil className="h-4 w-4 mr-1" /> 수정
                </Button>

                {canCancel && (
                    <Button variant="destructive" size="sm" onClick={goCancel} disabled={cancel}>
                        <XCircle className="h-4 w-4 mr-1" /> {cancel ? "취소중" : "취소"}
                    </Button>
                )}

                {canVerify && (
                    <Button variant="default" size="sm" onClick={goVerifyDetail}>
                        심사
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

/* --------------------------------- Page --------------------------------- */

export function AdminProjectListPage() {
    const [items, setItems] = useState<AdminProjectList[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const { page, size, projectStatus, rangeType, setPage, setProjectStatus, setRangeType } = useQueryState();

    const url = useMemo(() => {
        return endpoints.getAdminProjectList({ page, size, projectStatus: projectStatus || undefined, rangeType: rangeType || undefined });
    }, [page, size, projectStatus, rangeType]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getData(url);
            if (res.status === 200 && res.data) {
                const { items, totalElements } = res.data;
                setItems(items ?? []);
                setTotal(totalElements ?? 0);
            } else {
                setItems([]);
                setTotal(0);
            }
        } catch (e) {
            setError(e);
            setItems([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* --------------------------------- Quick Filters --------------------------------- */

    const StatusButton = ({ label, value }: { label: string; value: string }) => {
        const active = projectStatus === value;
        return (
            <Button variant={active ? "default" : "outline"} size="sm" onClick={() => setProjectStatus(active ? "" : value)}>
                {label}
            </Button>
        );
    };
    const RangeButton = ({ label, value }: { label: string; value: string }) => {
        const active = rangeType === value;
        return (
            <Button variant={active ? "default" : "outline"} size="sm" onClick={() => setRangeType(active ? "" : value)}>
                {label}
            </Button>
        );
    };

    /* --------------------------- Render --------------------------- */

    if (loading) return <FundingLoader />;
    if (error) return <p className="text-red-600">프로젝트 목록을 불러오지 못했습니다.</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>프로젝트 목록</CardTitle>
                <CardDescription>운영 중인 프로젝트를 조회하고 상세/심사로 이동합니다.</CardDescription>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground mr-1">상태</span>
                    <StatusButton label="전체" value="" />
                    <StatusButton label="심사중" value="VERIFYING" />
                    <StatusButton label="오픈예정" value="UPCOMING" />
                    <StatusButton label="진행중" value="OPEN" />
                    <StatusButton label="성공" value="SUCCESS" />
                    <StatusButton label="실패" value="FAILED" />
                    <StatusButton label="반려" value="REJECTED" />
                    <StatusButton label="취소" value="CANCELED" />
                    <StatusButton label="정산완료" value="SETTLED" />
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground mr-1">기간</span>
                    <RangeButton label="전체" value="" />
                    <RangeButton label="최근 7일" value="7d" />
                    <RangeButton label="최근 30일" value="30d" />
                    <RangeButton label="최근 90일" value="90d" />
                </div>

                <div className="text-xs text-gray-500 mt-2 pl-1">
                    총 {total.toLocaleString()}건
                </div>
            </CardHeader>

            <CardContent>
                {items.length === 0 ? (
                    <p>조건에 맞는 프로젝트가 없습니다.</p>
                ) : (
                    <div className="space-y-4">
                        {items.map(p => <ProjectCard key={p.projectId} p={p} onChanged={fetchData} />)}
                        <Pagination
                            key={`${projectStatus || 'ALL'}-${rangeType || 'ALL'}-${size}`}
                            page={page} size={size} total={total} onPage={setPage}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}