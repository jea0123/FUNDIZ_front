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
import ReviewsSheet from "../components/ReviewsSheet";
import NewsModal from "../components/NewsModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* --------------------------------- Status --------------------------------- */
const HIDE_BADGE_STATUSES: Status[] = ["DRAFT", "VERIFYING", "REJECTED", "UPCOMING"];

const STAGE_STATUS_MAP = {
    draft: ["DRAFT"],
    verifying: ["VERIFYING"],
    upcoming: ["UPCOMING"],
    open: ["OPEN"],
    closed: ["SUCCESS", "FAILED", "CANCELED"],
    rejected: ["REJECTED"],
    settled: ["SETTLED"],
} as const;

type Stage = keyof typeof STAGE_STATUS_MAP;
type ClosedResult = "" | "SUCCESS" | "FAILED" | "CANCELED";

/* ---------------------------------- Page ---------------------------------- */

export default function CreatorProjects() {
    //TODO: 임시용 id (나중에 삭제하기)
    const { creatorId, loading: idLoading } = useCreatorId(2);

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
    const goCreate = () => navigate('creator/project/new');

    const { page, size, projectStatus, rangeType, setPage, setProjectStatus, setRangeType } = useQueryState();

    /* ----------------------------- Stage & Result ----------------------------- */

    const initialStage: Stage = useMemo(() => {
        const tokens = (projectStatus || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean) as Status[];

        const has = (s: Status | Status[]) =>
            (Array.isArray(s) ? s : [s]).some((x) => tokens.includes(x));

        if (has("REJECTED")) return "rejected";
        if (has("SETTLED")) return "settled";
        if (has(["SUCCESS", "FAILED", "CANCELED"])) return "closed";
        if (has("OPEN")) return "open";
        if (has("UPCOMING")) return "upcoming";
        if (has("VERIFYING")) return "verifying";
        return "draft";
    }, [projectStatus]);

    const [stage, setStage] = useState<Stage>(initialStage);
    const [closedResult, setClosedResult] = useState<ClosedResult>("");

    // stage 변경 시 서버/URL 동기화
    const applyStageToQuery = (next: Stage, nextClosedResult: ClosedResult = "") => {
        setStage(next);
        setClosedResult(next === "closed" ? nextClosedResult : "");
        setPage(1);
        setRangeType("");

        const base = STAGE_STATUS_MAP[next];
        const statusCsv =
            next === "closed" && nextClosedResult
                ? nextClosedResult
                : base.join(",");

        setProjectStatus(statusCsv);
    };

    useEffect(() => {
        if (!projectStatus || projectStatus.length === 0) {
            applyStageToQuery(initialStage);
        }
    }, []);

    /* ------------------------------------ URL ------------------------------------ */

    useEffect(() => {
        setDevCreatorIdHeader(creatorId ?? null);
    }, [creatorId]);

    // 현재 상태 CSV
    const currentStatusCsv = useMemo(() => {
        if (stage === "closed") {
            return closedResult ? closedResult : STAGE_STATUS_MAP.closed.join(",");
        }
        return STAGE_STATUS_MAP[stage].join(",");
    }, [stage, closedResult]);

    const url = useMemo(() => {
        if (idLoading) return null;
        if (creatorId != null) {
            return endpoints.getCreatorProjectList({
                page,
                size,
                projectStatus: currentStatusCsv,
                rangeType: rangeType || undefined,
            });
        }
        return null;
    }, [creatorId, idLoading, page, size, currentStatusCsv, rangeType]);

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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /* -------------------------------- Handler --------------------------------- */

    const deleteProject = useCallback(async (projectId: number) => {
        if (!confirm("이 프로젝트를 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다.")) return;
        try {
            setDeletingId(projectId);
            await deleteData(endpoints.deleteProject(projectId));
            await fetchData();
            alert("프로젝트가 삭제되었습니다.");
        } catch (e) {
            setError(e);
            alert("삭제 실패하였습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setDeletingId(null);
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
        return currentStatusCsv.split(",").map((st) => st.trim()).filter(Boolean) as Status[];
    }, [currentStatusCsv]);

    const visible = useMemo(() => {
        return projects.filter(p => activeStatuses.includes(p.projectStatus as Status))
    }, [projects, activeStatuses]);

    /* ----------------------------------- Render ----------------------------------- */

    if (idLoading || loading) return <FundingLoader />;
    if (error) return <p className="text-red-600">프로젝트를 불러오지 못했습니다.</p>;

    const closedChips = [
        { label: "전체", value: "" as ClosedResult },
        { label: "성공", value: "SUCCESS" as ClosedResult },
        { label: "실패", value: "FAILED" as ClosedResult },
        { label: "취소", value: "CANCELED" as ClosedResult },
    ];

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                    <CardTitle>프로젝트 목록</CardTitle>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* 상단 탭 */}
                    <Tabs value={stage} onValueChange={(v) => applyStageToQuery(v as Stage)} className="mt-2">
                        <TabsList className="flex flex-wrap gap-1">
                            <TabsTrigger value="draft">작성중</TabsTrigger>
                            <TabsTrigger value="verifying">심사중</TabsTrigger>
                            <TabsTrigger value="upcoming">오픈예정</TabsTrigger>
                            <TabsTrigger value="open">진행중</TabsTrigger>
                            <TabsTrigger value="closed">종료</TabsTrigger>
                            <TabsTrigger value="rejected">반려</TabsTrigger>
                            <TabsTrigger value="settled">정산</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* 기간 Select */}
                    <div className="flex items-center gap-2">
                        <Select
                            value={rangeType || ""}
                            onValueChange={(v) => {
                                setPage(1);
                                setRangeType(v === "ALL" ? "" : v);
                            }}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="전체" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">전체</SelectItem>
                                <SelectItem value="7d">최근 7일</SelectItem>
                                <SelectItem value="30d">최근 30일</SelectItem>
                                <SelectItem value="90d">최근 90일</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 종료 탭 전용 하위 칩 */}
                {stage === "closed" && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-xs text-muted-foreground mr-1">종료 결과</span>
                        {closedChips.map((chip) => {
                            const active = closedResult === chip.value;
                            return (
                                <Button
                                    key={chip.label}
                                    size="sm"
                                    variant={active ? "default" : "outline"}
                                    onClick={() => applyStageToQuery("closed", chip.value)}
                                >
                                    {chip.label}
                                </Button>
                            );
                        })}
                    </div>
                )}

                <div className="text-xs text-gray-500 mt-2 pl-1">
                    총 {total.toLocaleString()}건 · 표시 {visible.length.toLocaleString()}건
                </div>
            </CardHeader>

            <CardContent>
                {visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-gray-600 mb-4">새 프로젝트를 준비해보세요.</p>
                        <Button onClick={goCreate}>프로젝트 만들기</Button>
                    </div>
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
                                                {st === "OPEN" && <span>({getDaysLeft(p.endDate)}일 남음)</span>}

                                                {!HIDE_BADGE_STATUSES.includes(st) && (
                                                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="rounded-full bg-muted px-2 py-0.5">
                                                                        새소식 {p.newsCount ?? 0}
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    마지막: {p.lastNewsAt ? formatDate(p.lastNewsAt) : "없음"}
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="rounded-full bg-muted px-2 py-0.5">
                                                                        후기 {p.reviewNewCount ?? 0} / 미답글 {p.reviewPendingCount ?? 0}
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    마지막: {p.lastReviewAt ? formatDate(p.lastReviewAt) : "없음"}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </span>
                                                )}
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
                    key={`${stage}-${closedResult || "ALL"}-${rangeType || "ALL"}-${size}`}
                    page={page}
                    size={size}
                    total={total}
                    onPage={setPage}
                />
            </CardContent>

            {/* === 새소식 등록 모달 === */}
            {activeProject && (
                <NewsModal
                    open={newsOpen}
                    projectId={activeProject.id}
                    projectTitle={activeProject.title}
                    onClose={() => {
                        setNewsOpen(false);
                        setActiveProject(null);
                    }}
                    onPosted={fetchData}
                />
            )}

            {/* === 후기 관리 시트 === */}
            {activeProject && (
                <Sheet
                    open={reviewsOpen}
                    onOpenChange={(open) => {
                        setReviewsOpen(open);
                        if (!open) setActiveProject(null);
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