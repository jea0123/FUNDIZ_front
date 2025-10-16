import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteData, endpoints, getData, setDevCreatorIdHeader } from "@/api/apis";
import FundingLoader from "@/components/FundingLoader";
import { StatusBadge, type Status } from "@/views/admin/tabs/ProjectsTab";
import type { CreatorProjectListDto } from "@/types/creator";
import { useCreatorId } from "../../../types/useCreatorId";
import { useNavigate } from "react-router-dom";
import { useQueryState } from "@/views/admin/tabs/ApprovalsTab";
import { Pagination } from "@/views/project/ProjectAllPage";
import { formatDate, getDaysLeft } from "@/utils/utils";
import QuickActions from "../components/QuickActions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import NewsSheet from "../components/NewsSheet";
import ReviewsSheet from "../components/ReviewsSheet";

/* --------------------------------- Status --------------------------------- */
const PREP_STATUSES: Status[] = ["DRAFT", "VERIFYING"];
const OPER_STATUSES: Status[] = ["UPCOMING", "OPEN"];
type Bucket = "PREP" | "OPER";

/* ---------------------------------- Page ---------------------------------- */

export default function CreatorProjects() {
    //TODO: 임시용 id (나중에 삭제하기)
    const { creatorId, loading: idLoading } = useCreatorId(26);

    const [projects, setProjects] = useState<CreatorProjectListDto[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [newsOpen, setNewsOpen] = useState(false);
    const [reviewsOpen, setReviewsOpen] = useState(false);
    const [activeProject, setActiveProject] = useState<{ id: number; title: string } | null>(null);

    const navigate = useNavigate();
    const goDetail = (projectId: number) => navigate(`/creator/projects/${projectId}`);
    const goEdit = (projectId: number) => navigate(`/creator/project/${projectId}`);
    const goAddReward = (projectId: number) => navigate(`/creator/projects/${projectId}/reward`)

    const { page, size, projectStatus, rangeType, setPage, setProjectStatus, setRangeType } = useQueryState();

    /* ------------------------------- Bucket state ------------------------------- */

    const initialBucket: Bucket = useMemo(() => {
        const tokens = (projectStatus || "").split(",").map((token) => token.trim());
        const hasOper = tokens.some((st) => OPER_STATUSES.includes(st as Status));
        return hasOper ? "OPER" : "PREP";
    }, [projectStatus]);

    const [bucket, setBucket] = useState<Bucket>(initialBucket);

    //버킷 스위치 시 서버/URL 상태 동기화
    const switchBucket = (b: Bucket) => {
        setBucket(b);
        setPage(1);
        if (b === "PREP") {
            setProjectStatus("DRAFT,VERIFYING");
        } else {
            setProjectStatus("UPCOMING,OPEN");
        }
    }

    useEffect(() => {
        if (!projectStatus || projectStatus.length === 0) {
            switchBucket(initialBucket);
        }
    }, []);

    /* --------------------------------- Quick Filters --------------------------------- */

    // 버킷 기본값
    const bucketDefaultStatuses = bucket === "PREP" ? PREP_STATUSES : OPER_STATUSES;
    const defaultStatusValue = bucketDefaultStatuses.join(",");

    // 순서/공백 무시
    const normalizeStatuses = (v: string) =>
        v.split(",").map(st => st.trim()).filter(Boolean).sort().join(",");

    // 현재가 전체인지 판단
    const isAllStatus = useMemo(() => {
        const current = normalizeStatuses(projectStatus && projectStatus.length ? projectStatus : defaultStatusValue);
        const all = normalizeStatuses(defaultStatusValue);
        return current === all;
    }, [projectStatus, defaultStatusValue]);

    const StatusButton = ({ label, value }: { label: string; value: string; }) => {
        const current = normalizeStatuses(projectStatus && projectStatus.length ? projectStatus : defaultStatusValue);
        const target = normalizeStatuses(value);
        const active = current === target;

        return (
            <Button
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => { setPage(1); setProjectStatus(value); }}
            >
                {label}
            </Button>
        );
    };

    const RangeButton = ({ label, value }: { label: string; value: string }) => {
        const active = rangeType === value;
        return (
            <Button
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => { setPage(1); setRangeType(active ? "" : value); }}
            >
                {label}
            </Button>
        );
    };

    /* ------------------------------------ URL ------------------------------------ */

    useEffect(() => { setDevCreatorIdHeader(creatorId ?? null); }, [creatorId]);

    const url = useMemo(() => {
        if (idLoading) return null;
        if (creatorId != null) {
            return endpoints.getCreatorProjectList({
                page, size, projectStatus: isAllStatus ? undefined : (projectStatus || undefined), rangeType: rangeType || undefined
            });
        }
        return null;
    }, [creatorId, idLoading, page, size, projectStatus, rangeType, isAllStatus]);

    /* -------------------------------- Data fetching -------------------------------- */

    const fetchData = useCallback(async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getData(url);
            if (res.status === 200 && res.data) {
                const { items, totalElements } = res.data;
                setProjects(items ?? []);
                setTotal(totalElements ?? 0);
            } else {
                setProjects([]);
                setTotal(0);
            }
        } catch (e) {
            setError(e);
            setProjects([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* -------------------------------- Handler --------------------------------- */

    const deleteProject = useCallback(async (projectId: number) => {
        if (!confirm("이 프로젝트를 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다.")) return;
        try {
            setDeletingId(projectId);
            await deleteData(endpoints.deleteProject(projectId));
            await fetchData();
        } catch (e) {
            setError(e);
            alert("삭제 실패하였습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setDeletingId(null);
            alert("프로젝트가 삭제되었습니다.");
        }
    }, [fetchData]);

    const openNewsById = useCallback((projectId: number) => {
        const p = projects.find(x => x.projectId === projectId);
        setActiveProject({ id: projectId, title: p?.title ?? "" });
        setNewsOpen(true);
    }, [projects]);

    const openReviewsById = useCallback((projectId: number) => {
        const p = projects.find(x => x.projectId === projectId);
        setActiveProject({ id: projectId, title: p?.title ?? "" });
        setReviewsOpen(true);
    }, [projects]);

    /* -------------------------------- Safe Filtering --------------------------------- */

    // 서버가 콤마 분리 다중 상태를 지원하지 않을 경우를 대비한 클라이언트 필터
    const activeStatuses = useMemo<Status[]>(() => {
        const tokens = (projectStatus || "").split(",").map((token) => token.trim()).filter(Boolean) as Status[];
        if (tokens.length === 0) {
            return bucket === "PREP" ? PREP_STATUSES : OPER_STATUSES;
        }
        const allowed = (bucket === "PREP" ? PREP_STATUSES : OPER_STATUSES);
        return tokens.filter((st) => allowed.includes(st));
    }, [projectStatus, bucket]);

    const visible = useMemo(() =>
        projects.filter((p) => activeStatuses.includes(p.projectStatus as Status))
        , [projects, activeStatuses]
    );

    /* ----------------------------------- Render ----------------------------------- */

    if (idLoading || loading) return <FundingLoader />;
    if (error) return <p className="text-red-600">프로젝트 리스트를 불러오지 못했습니다.</p>;

    const statusFilterChips =
        bucket === "PREP"
            ? [
                { label: "전체", value: PREP_STATUSES.join(",") },
                { label: "작성중", value: "DRAFT" },
                { label: "심사중", value: "VERIFYING" }
            ]
            : [
                { label: "전체", value: OPER_STATUSES.join(",") },
                { label: "오픈예정", value: "UPCOMING" },
                { label: "진행중", value: "OPEN" }
            ];

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                    <CardTitle>프로젝트 목록</CardTitle>
                    <div className="inline-flex rounded-md border p-1 bg-muted">
                        <Button
                            size="sm"
                            variant={bucket === "PREP" ? "default" : "ghost"}
                            onClick={() => switchBucket("PREP")}
                        >
                            사전 준비
                        </Button>
                        <Button
                            size="sm"
                            variant={bucket === "OPER" ? "default" : "ghost"}
                            onClick={() => switchBucket("OPER")}
                        >
                            운영
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground mr-1">상태</span>
                    {statusFilterChips.map((chip) => (
                        <StatusButton key={chip.value} label={chip.label} value={chip.value} />
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground mr-1">기간</span>
                    <RangeButton label="전체" value="" />
                    <RangeButton label="최근 7일" value="7d" />
                    <RangeButton label="최근 30일" value="30d" />
                    <RangeButton label="최근 90일" value="90d" />
                </div>

                <div className="text-xs text-gray-500 mt-2 pl-1">
                    총 {total.toLocaleString()}건 · 표시 {visible.length.toLocaleString()}건
                </div>
            </CardHeader>

            <CardContent>
                {visible.length === 0 ? (
                    <p className="text-gray-500">
                        {bucket === "PREP" ? "작성 중인 프로젝트가 없습니다." : "오픈 예정/진행 중인 프로젝트가 없습니다."}
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {visible.map((p) => {
                            const st = p.projectStatus as Status;

                            return (
                                <li key={p.projectId}>
                                    <Card className="block">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center gap-2 flex-wrap">
                                                <span className="mr-1 truncate">{p.title}</span>
                                                <StatusBadge status={st} />
                                                {OPER_STATUSES.includes(st) && (
                                                    <span>({getDaysLeft(p.endDate)}일 남음)</span>
                                                )}

                                                <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="rounded-full bg-muted px-2 py-0.5">
                                                                    새소식 {p.newsCount ?? 0}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>마지막: {p.lastNewsAt ? formatDate(p.lastNewsAt) : "없음"}</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="rounded-full bg-muted px-2 py-0.5">
                                                                    후기 {p.reviewNewCount ?? 0} / 미답글 {p.reviewPendingCount ?? 0}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>마지막: {p.lastReviewAt ? formatDate(p.lastReviewAt) : "없음"}</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div>기간: {formatDate(p.startDate)} ~ {formatDate(p.endDate)}</div>
                                                <div>카테고리: {p.ctgrName} &gt; {p.subctgrName}</div>
                                                <div>현재/목표금액: {p.currAmount.toLocaleString()} / {p.goalAmount.toLocaleString()} ({p.percentNow}%)</div>
                                                <div>후원자 수: {p.backerCnt.toLocaleString()}</div>
                                                {st === "VERIFYING" && p.requestedAt && (
                                                    <div>심사요청일: {formatDate(p.requestedAt)}</div>
                                                )}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="justify-end gap-2 pt-5">
                                            <QuickActions
                                                project={p}
                                                deletingId={deletingId}
                                                onDetail={goDetail}
                                                onEdit={goEdit}
                                                onDelete={deleteProject}
                                                onAddReward={goAddReward}
                                                onWriteNews={openNewsById}
                                                onManageReviews={openReviewsById}
                                            />
                                        </CardFooter>
                                    </Card>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <Pagination
                    key={`${projectStatus || 'ALL'}-${rangeType || 'ALL'}-${size}`}
                    page={page} size={size} total={total} onPage={setPage}
                />
            </CardContent>

            {/* === 새소식 등록 시트 === */}
            {activeProject && (
                <Sheet
                    open={newsOpen}
                    onOpenChange={(open) => {
                        setNewsOpen(open);
                        if (!open) setActiveProject(null); // 닫히면 초기화
                    }}
                >
                    <SheetContent className="w-[860px] max-w-full">
                        <SheetHeader>
                            <SheetTitle>새소식 등록</SheetTitle>
                            <SheetDescription>{activeProject.title}</SheetDescription>
                        </SheetHeader>

                        <NewsSheet
                            open={newsOpen}
                            projectId={activeProject.id}
                            projectTitle={activeProject.title}
                            onClose={() => {
                                setNewsOpen(false);
                                setActiveProject(null);
                            }}
                            onPosted={fetchData}
                        />
                    </SheetContent>
                </Sheet>
            )}

            {/* === 후기 관리 시트 === */}
            {activeProject && (
                <Sheet
                    open={reviewsOpen}
                    onOpenChange={(open) => {
                        setReviewsOpen(open);
                        if (!open) setActiveProject(null); // 닫히면 초기화
                    }}
                >
                    <SheetContent className="w-[860px] max-w-full overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>후기 관리</SheetTitle>
                            <SheetDescription>{activeProject.title}</SheetDescription>
                        </SheetHeader>

                        <ReviewsSheet
                            open={reviewsOpen}
                            projectId={activeProject.id}
                            projectTitle={activeProject.title}
                            onClose={() => {
                                setReviewsOpen(false);
                                setActiveProject(null);
                            }}
                            onReplied={fetchData}
                        />
                    </SheetContent>
                </Sheet>
            )}
        </Card >
    );
}