import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Eye, Pencil } from "lucide-react";
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

/* ------------------------------ Card ------------------------------ */

function Project({ p }: { p: AdminProjectList }) {
    const navigate = useNavigate();
    const verify = p.projectStatus === "VERIFYING";

    const goEdit = () => navigate(`/admin/project/${p.projectId}`);
    const goVerifyDetail = () => {
        if (!verify) return;
        navigate(`/admin/verify/${p.projectId}`);
    }

    return (
        <Card className="pb-3">
            <CardContent>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-semibold leading-tight line-clamp-2 mr-2">{p.title}</h4>
                    <StatusBadge status={p.projectStatus} />
                    <span className="font-semibold">({getDaysLeft(p.endDate)}일 남음)</span>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <div className="min-w-0">
                            <span className="text-muted-foreground">기간</span>
                            <span className="mx-1">:</span>
                            <span className="text-foreground font-medium tabular-nums">
                                {formatDate(p.startDate)} ~ {formatDate(p.endDate)}
                            </span>
                        </div>

                        <div className="md:text-right">
                            <span className="text-muted-foreground">현재/목표 금액</span>
                            <span className="mx-1">:</span>
                            <span className="text-foreground font-medium tabular-nums">
                                {p.currAmount.toLocaleString()} / {p.goalAmount.toLocaleString()} ({p.percentNow}%)
                            </span>
                        </div>
                    </div>

                    {/* 2줄차: 창작자 / 후원자 수 / 마지막 수정일 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-center">
                        <div className="min-w-0">
                            <span className="text-muted-foreground">창작자</span>
                            <span className="mx-1">:</span>
                            <span className="text-foreground truncate" title={p.creatorName}>
                                {p.creatorName}
                            </span>
                        </div>

                        <div className="text-right md:text-center">
                            <span className="text-muted-foreground">후원자 수</span>
                            <span className="mx-1">:</span>
                            <span className="text-foreground font-medium tabular-nums">
                                {p.backerCnt.toLocaleString()}
                            </span>
                        </div>

                        <div className="col-span-2 md:col-span-1 md:text-right">
                            <span className="text-muted-foreground">마지막 수정일</span>
                            <span className="mx-1">:</span>
                            <span className="text-foreground">
                                {p.updatedAt ? formatDate(p.updatedAt) : "-"}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="justify-end gap-2">
                <Button variant="outline" size="sm" onClick={goEdit} title="관리자 프로젝트 수정으로 이동">
                    <Pencil className="h-4 w-4 mr-1" /> 수정
                </Button>

                {verify && (
                    <Button variant="default" size="sm" onClick={goVerifyDetail} title="심사 상세 화면으로 이동">
                        심사
                    </Button>   
                )}
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

    /* --------------------------- Render --------------------------- */

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