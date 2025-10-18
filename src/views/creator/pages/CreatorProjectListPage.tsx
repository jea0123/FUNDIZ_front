import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteData, endpoints, getData, setDevCreatorIdHeader } from "@/api/apis";
import FundingLoader from "@/components/FundingLoader";
import type { CreatorProjectListDto } from "@/types/creator";
import { useCreatorId } from "../../../types/useCreatorId";
import { useNavigate } from "react-router-dom";
import { useQueryState } from "@/views/admin/pages/VerificationQueue";
import { formatDate, formatPrice } from "@/utils/utils";
import CreatorProjectRowActions from "../components/CreatorProjectRowActions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import CreatorReviewReplySheet from "../components/CreatorReviewReplySheet";
import CreatorCreateNewsModal from "../components/CreatorCreateNewsModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eye, Heart, Users, type LucideIcon } from "lucide-react";
import { ProjectStatusChip, type ProjectStatus } from "@/views/admin/components/ProjectStatusChip";
import clsx from "clsx";
import { Pagination } from "@/views/project/ProjectsBrowsePage";

/* --------------------------------- Status --------------------------------- */

type Stage = keyof typeof STAGE_STATUS_MAP;
type ClosedResult = "ALL" | "SUCCESS" | "FAILED" | "CANCELED";

const HIDE_BADGE_STATUSES: ProjectStatus[] = ["DRAFT", "VERIFYING", "REJECTED", "UPCOMING"];

const STAGE_STATUS_MAP = {
    all: ["DRAFT", "VERIFYING", "UPCOMING", "OPEN", "SUCCESS", "FAILED", "CANCELED", "REJECTED", "SETTLED"],
    draft: ["DRAFT"],
    verifying: ["VERIFYING"],
    upcoming: ["UPCOMING"],
    open: ["OPEN"],
    closed: ["SUCCESS", "FAILED", "CANCELED"],
    rejected: ["REJECTED"],
    settled: ["SETTLED"],
} as const;


const STAGES: { key: Stage; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "draft", label: "작성중" },
    { key: "verifying", label: "심사중" },
    { key: "upcoming", label: "오픈예정" },
    { key: "open", label: "진행중" },
    { key: "closed", label: "종료" },
    { key: "rejected", label: "반려" },
    { key: "settled", label: "정산" },
];

const CLOSED_RESULTS: { label: string; value: ClosedResult }[] = [
    { label: "전체", value: "ALL" },
    { label: "성공", value: "SUCCESS" },
    { label: "실패", value: "FAILED" },
    { label: "취소", value: "CANCELED" },
];

const stageLabel = (s: Stage) => STAGES.find(x => x.key === s)?.label ?? "상태";

/* ---------------------------------- Page ---------------------------------- */

export default function CreatorProjectListPage() {
    //TODO: dev id
    const { creatorId, loading: idLoading } = useCreatorId(2);

    const [projects, setProjects] = useState<CreatorProjectListDto[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            .filter(Boolean) as ProjectStatus[];

        if (tokens.length === 0) return "all";

        const has = (s: ProjectStatus | ProjectStatus[]) =>
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
    const [closedResult, setClosedResult] = useState<ClosedResult>("ALL");

    // stage 변경 시 서버/URL 동기화
    const applyStageToQuery = (next: Stage, nextClosedResult: ClosedResult = "ALL") => {
        setStage(next);
        setClosedResult(next === "closed" ? nextClosedResult : "ALL");
        setPage(1);
        setRangeType("");

        if (next === "all") {
            setProjectStatus("");
            return;
        }

        if (next === "closed") {
            const statusCsv =
                nextClosedResult === "ALL"
                    ? STAGE_STATUS_MAP.closed.join(",")
                    : nextClosedResult;
            setProjectStatus(statusCsv);
            return;
        }

        setProjectStatus(STAGE_STATUS_MAP[next].join(","));
    };

    useEffect(() => {
        if (!projectStatus || projectStatus.length === 0) {
            applyStageToQuery(initialStage);
        }
    }, []);

    /* ------------------------------------ URL ------------------------------------ */

    // 현재 상태 CSV
    const currentStatusCsv = useMemo(() => {
        if (stage === "all") return "";
        if (stage === "closed") {
            return closedResult === "ALL"
                ? STAGE_STATUS_MAP.closed.join(",")
                : closedResult;
        }
        return STAGE_STATUS_MAP[stage].join(",");
    }, [stage, closedResult]);

    const url = useMemo(() => {
        if (idLoading) return null;
        if (creatorId != null) {
            return endpoints.getCreatorProjectList({
                page,
                size,
                projectStatus: currentStatusCsv || undefined,
                rangeType: rangeType || undefined,
            });
        }
        return null;
    }, [creatorId, idLoading, page, size, currentStatusCsv, rangeType]);

    /* -------------------------------- Data fetching -------------------------------- */

    const projectsData = useCallback(async () => {
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
        } catch (e: any) {
            setError(e?.message || "데이터 로드 중 에러가 발생했습니다.");
            setProjects([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        projectsData();
    }, [projectsData]);

    // TODO: dev id
    useEffect(() => {
        setDevCreatorIdHeader(creatorId ?? null);
    }, [creatorId]);

    /* -------------------------------- Handler --------------------------------- */

    const deleteProject = useCallback(async (projectId: number) => {
        if (!confirm("이 프로젝트를 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다.")) return;
        try {
            setDeletingId(projectId);
            await deleteData(endpoints.deleteProject(projectId));
            await projectsData();
            alert("프로젝트가 삭제되었습니다.");
        } catch (e: any) {
            setError(e?.message || "삭제 실패하였습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setDeletingId(null);
        }
    }, [projectsData]);

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
    const activeStatuses = useMemo<ProjectStatus[]>(() => {
        return currentStatusCsv.split(",").map((st) => st.trim()).filter(Boolean) as ProjectStatus[];
    }, [currentStatusCsv]);

    const visible = useMemo(() => {
        if (!currentStatusCsv) return projects;
        return projects.filter(p => activeStatuses.includes(p.projectStatus as ProjectStatus))
    }, [projects, activeStatuses, currentStatusCsv]);

    /* ----------------------------------- Render ----------------------------------- */

    if (loading) return <FundingLoader />;
    if (!projects) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <EmptyState onBack={() => navigate(-1)} message={error ?? "프로젝트를 불러오지 못했습니다."} />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="gap-6">
                <div className="flex items-center justify-between">
                    <CardTitle>프로젝트 목록</CardTitle>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Select
                            value={stage}
                            onValueChange={(v) => applyStageToQuery(v as Stage)}
                        >
                            <SelectTrigger className="h-8 w-[120px] text-xs">
                                <SelectValue placeholder="상태">{stageLabel(stage)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {STAGES.map(s => (
                                    <SelectItem key={s.key} value={s.key} className="text-sm">
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {stage === "closed" && (
                            <Select
                                value={closedResult ? closedResult : "ALL"}
                                onValueChange={(v) => {
                                    applyStageToQuery("closed", v as ClosedResult);
                                }}
                            >
                                <SelectTrigger className="h-8 w-[110px] text-xs">
                                    <SelectValue placeholder="전체">
                                        {CLOSED_RESULTS.find(c => c.value === closedResult)?.label ?? "전체"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {CLOSED_RESULTS.map(c => (
                                        <SelectItem key={c.label} value={c.value} className="text-sm">
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <Select
                        value={rangeType || ""}
                        onValueChange={(v) => {
                            setPage(1);
                            setRangeType(v === "ALL" ? "" : v);
                        }}
                    >
                        <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue placeholder="기간">
                                {rangeType === "" ? "전체" : rangeType === "7d" ? "최근 7일" : rangeType === "30d" ? "최근 30일" : "최근 90일"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">전체</SelectItem>
                            <SelectItem value="7d">최근 7일</SelectItem>
                            <SelectItem value="30d">최근 30일</SelectItem>
                            <SelectItem value="90d">최근 90일</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="text-xs text-muted-foreground ml-2">
                    총 {total.toLocaleString()}건
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
                            const st = p.projectStatus as ProjectStatus;

                            return (
                                <li key={p.projectId}>
                                    <Card>
                                        <CardHeader className="space-y-3">
                                            <CardTitle className="flex flex-wrap items-center gap-3">
                                                <span className="truncate">{p.title}</span>
                                                <ProjectStatusChip status={st} />
                                            </CardTitle>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatPill
                                                    icon={Users}
                                                    label=""
                                                    value={p.backerCnt?.toLocaleString?.() ?? 0}
                                                    tooltip="후원자수"
                                                    emphasize
                                                />
                                                <StatPill
                                                    icon={Heart}
                                                    label=""
                                                    value={p.likeCnt?.toLocaleString?.() ?? 0}
                                                    tooltip="좋아요수"
                                                    emphasize
                                                />
                                                <StatPill
                                                    icon={Eye}
                                                    label=""
                                                    value={p.viewCnt?.toLocaleString?.() ?? 0}
                                                    tooltip="조회수"
                                                    emphasize
                                                />

                                                {!HIDE_BADGE_STATUSES.includes(st) && (
                                                    <>
                                                        <div className="h-3 w-px bg-border mx-1 hidden sm:block" aria-hidden="true"></div>
                                                        <StatPill
                                                            label="새소식"
                                                            value={(p.newsCount ?? 0).toLocaleString?.()}
                                                            tooltip={
                                                                <span>최근 : {p.lastNewsAt ? formatDate(p.lastNewsAt) : "없음"}</span>
                                                            }
                                                            emphasize
                                                        />
                                                        <StatPill
                                                            label="후기"
                                                            value={`${p.reviewPendingCount ?? 0} / ${(p.reviewNewCount ?? 0)}`}
                                                            tooltip={
                                                                <span>최근 : {p.lastReviewAt ? formatDate(p.lastReviewAt) : "없음"}</span>
                                                            }
                                                            emphasize
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                                <div className="space-y-0.5">
                                                    <dt className="text-xs text-muted-foreground">카테고리</dt>
                                                    <dd className="font-medium text-foreground/90">
                                                        {p.ctgrName} <span className="mx-1 text-muted-foreground">›</span> {p.subctgrName}
                                                    </dd>
                                                </div>

                                                <div className="space-y-0.5">
                                                    <dt className="text-xs text-muted-foreground">기간</dt>
                                                    <dd className="font-medium text-foreground/90">
                                                        {formatDate(p.startDate)} <span className="mx-1 text-muted-foreground">~</span> {formatDate(p.endDate)}
                                                    </dd>
                                                </div>

                                                <div className="space-y-0.5">
                                                    <dt className="text-xs text-muted-foreground">현재/목표 금액</dt>
                                                    <dd className="font-semibold text-foreground tabular-nums">
                                                        {formatPrice(p.currAmount)}
                                                        <span className="mx-1 text-muted-foreground">/</span>
                                                        {formatPrice(p.goalAmount)}
                                                        <span className="ml-1 text-emerald-600">({p.percentNow}%)</span>
                                                    </dd>
                                                </div>

                                                <div className="space-y-0.5">
                                                    <dt className="text-xs text-muted-foreground">작성일 · 수정일</dt>
                                                    <dd className="text-foreground/90">
                                                        {formatDate(p.createdAt)}
                                                        <span className="mx-1 text-muted-foreground">·</span>
                                                        {formatDate(p.updatedAt)}
                                                    </dd>
                                                </div>

                                                {st === "VERIFYING" && p.requestedAt && (
                                                    <div className="space-y-0.5 md:col-span-2">
                                                        <dt className="text-xs text-muted-foreground">심사요청일</dt>
                                                        <dd className="text-foreground/90">{formatDate(p.requestedAt)}</dd>
                                                    </div>
                                                )}

                                                {st === "REJECTED" && p.rejectedReason && (
                                                    <div className="space-y-0.5 md:col-span-2">
                                                        <dt className="text-xs text-muted-foreground">반려 사유</dt>
                                                        <dd className="text-foreground/90">{p.rejectedReason}</dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </CardContent>

                                        <CardFooter className="justify-end gap-2">
                                            <CreatorProjectRowActions
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
                <CreatorCreateNewsModal
                    open={newsOpen}
                    projectId={activeProject.id}
                    projectTitle={activeProject.title}
                    onClose={() => {
                        setNewsOpen(false);
                        setActiveProject(null);
                    }}
                    onPosted={projectsData}
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

                        <CreatorReviewReplySheet
                            open={reviewsOpen}
                            projectId={activeProject.id}
                            projectTitle={activeProject.title}
                            onClose={() => {
                                setReviewsOpen(false);
                                setActiveProject(null);
                            }}
                            onReplied={projectsData}
                        />
                    </SheetContent>
                </Sheet>
            )}
        </Card >
    );
}

/* ------------------------------- UI Bits ------------------------------- */

function EmptyState({ message, onBack }: { message: string; onBack: () => void }) {
    return (
        <Card>
            <CardContent className="p-8 text-center space-y-4">
                <p className="text-sm text-muted-foreground">{message}</p>
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> 뒤로가기
                </Button>
            </CardContent>
        </Card>
    );
}

type StatPillProps = {
    icon?: LucideIcon;
    label: string;
    value?: React.ReactNode;
    tooltip?: React.ReactNode;
    className?: string;
    emphasize?: boolean;
    as?: "span" | "button" | "div";
};

export function StatPill({
    icon: Icon,
    label,
    value,
    tooltip,
    className,
    emphasize,
    as: As = "span",
}: StatPillProps) {
    const Pill = (
        <As
            className={clsx(
                "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5",
                "text-xs text-muted-foreground",
                className
            )}
        >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            <span className="whitespace-nowrap">{label}</span>
            {typeof value !== "undefined" && (
                <span className={clsx("tabular-nums", emphasize && "font-semibold text-foreground")}>
                    {value}
                </span>
            )}
        </As>
    );

    if (!tooltip) return Pill;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{Pill}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
}