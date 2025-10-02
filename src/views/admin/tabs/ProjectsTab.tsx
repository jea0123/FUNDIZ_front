import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Eye } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { endpoints, getData } from "@/api/apis";
import { useNavigate } from "react-router-dom";
import FundingLoader from "@/components/FundingLoader";
import { useQueryState } from "./ApprovalsTab";
import { formatDate, getDaysLeft } from "@/utils/utils";
import { Pagination } from "@/views/project/ProjectAllPage";
import type { AdminProjectList } from "@/types/admin";

/* -------------------------------- Types -------------------------------- */

export type Status = "DRAFT" | "VERIFYING" | "UPCOMING" | "OPEN" | "SUCCESS" | "FAILED" | "REJECTED" | "CANCELED" | "SETTLED";

/* ------------------------------ UI helpers ------------------------------ */

function cls(...xs: (string | false | undefined)[]) { return xs.filter(Boolean).join(" "); }

function StatusBadge({ status }: { status: Status }) {
    const map: Record<Status, string> = {
        DRAFT: "bg-slate-100 text-slate-700",
        VERIFYING: "bg-blue-100 text-blue-700",
        UPCOMING: "bg-slate-100 text-slate-700",
        OPEN: "bg-emerald-100 text-emerald-700",
        SUCCESS: "bg-green-100 text-green-700",
        FAILED: "bg-rose-100 text-rose-700",
        REJECTED: "bg-rose-100 text-rose-700",
        CANCELED: "bg-rose-100 text-rose-700",
        SETTLED: "bg-yellow-100 text-yellow-800",
    };
    return <span className={cls("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", map[status])}>{status}</span>;
}

/* ------------------------------ Row (Card) ------------------------------ */

function Project({ p }: { p: AdminProjectList }) {
    const navigate = useNavigate();

    return (
        <Card className="pb-3">
            <CardContent className="pt-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-semibold leading-tight line-clamp-2 mr-2">{p.title}</h4>
                    <StatusBadge status={p.projectStatus} />
                    <span className="font-semibold">{getDaysLeft(p.endDate)}</span>
                    {/* TODO: 프로젝트ID ?? */}
                    <span className="text-xs text-muted-foreground">#{p.projectId}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm text-muted-foreground">
                    <div><span className="text-gray-600">창작자</span>: {p.creatorName}</div>

                    <div className="md:text-right">
                        <span className="text-gray-600">달성률</span>: <span className="font-semibold text-gray-900">{p.percentNow}%</span>
                    </div>

                    <div className="md:text-right">
                        <span className="text-gray-600">현재/목표 금액</span>: <span className="font-medium text-gray-900">
                            {p.currAmount.toLocaleString()} / {p.goalAmount.toLocaleString()}
                        </span>
                    </div>

                    <div className="md:text-right">
                        <span className="text-gray-600">후원자 수</span>: <span className="font-medium text-gray-900">{p.backerCnt.toLocaleString()}</span>
                    </div>

                    <div className="md:text-right">
                        <span className="text-gray-600">마지막 수정일</span>: {p.updatedAt ? formatDate(p.updatedAt) : "-"}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/projects/${p.projectId}`)}
                    title="상세보기"
                >
                    <Eye className="h-4 w-4 mr-1" />상세
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/admin/verify/${p.projectId}`)}
                    title="심사 페이지로 이동"
                >
                    심사
                </Button>
            </CardFooter>
        </Card>
    );
}

/* --------------------------------- Page --------------------------------- */

export function ProjectsTab() {
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

    if (loading) return <FundingLoader />;
    if (error) return <p className="text-red-600">프로젝트 목록을 불러오지 못했습니다.</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>프로젝트 목록</CardTitle>
                <CardDescription>운영 중인 프로젝트를 조회하고 상세/심사로 이동합니다.</CardDescription>

                <div className="flex flex-wrap items-center gap-2 mt-3">
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
                        {items.map(p => <Project key={p.projectId} p={p} />)}
                        <Pagination page={page} size={size} total={total} onPage={setPage} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}