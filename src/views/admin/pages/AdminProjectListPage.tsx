import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowLeft, Eye, Heart, Pencil, Users, XCircle, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { endpoints, getData, postData } from "@/api/apis";
import { useLocation, useNavigate } from "react-router-dom";
import FundingLoader from "@/components/FundingLoader";
import { formatDate, formatPrice, toPublicUrl } from "@/utils/utils";
import type { AdminProjectList } from "@/types/admin";
import { ProjectStatusChip, type ProjectStatus } from "../components/ProjectStatusChip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import clsx from "clsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useListQueryState } from "@/utils/usePagingQueryState";
import { Pagination } from "@/utils/pagination";
import { ProjectThumb } from "@/views/creator/pages/CreatorProjectListPage";

type Stage = keyof typeof STAGE_STATUS_MAP;
type ClosedResult = "ALL" | "SUCCESS" | "FAILED" | "CANCELED";

const STAGE_STATUS_MAP = {
    all: ["UPCOMING", "OPEN", "SUCCESS", "FAILED", "CANCELED", "SETTLED"],
    upcoming: ["UPCOMING"],
    open: ["OPEN"],
    closed: ["SUCCESS", "FAILED", "CANCELED"],
    settled: ["SETTLED"],
} as const;

const STAGES: { key: Stage; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "upcoming", label: "오픈예정" },
    { key: "open", label: "진행중" },
    { key: "closed", label: "종료" },
    { key: "settled", label: "정산" },
];

const CLOSED_RESULTS: { label: string; value: ClosedResult }[] = [
    { label: "전체", value: "ALL" },
    { label: "성공", value: "SUCCESS" },
    { label: "실패", value: "FAILED" },
    { label: "취소", value: "CANCELED" },
];

const stageLabel = (s: Stage) => STAGES.find(x => x.key === s)?.label ?? "상태";

/* --------------------------------- Page --------------------------------- */
export function AdminProjectListPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [projects, setProjects] = useState<AdminProjectList[] | null>(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        page, size, perGroup, projectStatus, rangeType, bindPagination,
        setPage, setProjectStatus, setRangeType,
    } = useListQueryState();

    /* ----------------------------- Stage & Result ----------------------------- */
    const initialStage: Stage = useMemo(() => {
        const tokens = (projectStatus ?? []) as ProjectStatus[];
        const has = (s: ProjectStatus | ProjectStatus[]) =>
            (Array.isArray(s) ? s : [s]).some(x => tokens.includes(x));

        if (tokens.length === 0) return "all";
        if (has("SETTLED")) return "settled";
        if (has(["SUCCESS", "FAILED", "CANCELED"])) return "closed";
        if (has("OPEN")) return "open";
        if (has("UPCOMING")) return "upcoming";
        return "all";
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
            setProjectStatus(undefined);
        } else if (next === "closed") {
            setProjectStatus(
                nextClosedResult === "ALL" ? [...STAGE_STATUS_MAP.closed] : [nextClosedResult]
            );
        } else {
            setProjectStatus([...STAGE_STATUS_MAP[next]]);
        }
    };

    /* ------------------------------------ URL ------------------------------------ */
    // 현재 선택된 상태(배열)
    const selectedStatuses: ProjectStatus[] = useMemo(() => {
        if (stage === "all") return [];
        if (stage === "closed") {
            return closedResult === "ALL"
                ? STAGE_STATUS_MAP.closed.slice()
                : [closedResult as ProjectStatus];
        }
        return STAGE_STATUS_MAP[stage].slice();
    }, [stage, closedResult]);

    const url = useMemo(() => endpoints.getAdminProjectList({
        page, size, perGroup,
        projectStatus: selectedStatuses.length ? selectedStatuses : undefined,
        rangeType: rangeType || undefined,
    }), [page, size, perGroup, selectedStatuses, rangeType]);

    /* -------------------------------- Data fetching -------------------------------- */
    const projectData = useCallback(async () => {
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
        projectData();
    }, [projectData]);

    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const qs = sp.getAll("projectStatus");
        if (qs.length === 0) {
            applyStageToQuery(initialStage);
        }
    }, []);

    /* --------------------------- Render --------------------------- */
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
                    <CardTitle className="text-2xl">프로젝트 목록</CardTitle>
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
                {projects.length === 0 ? (
                    <p>조건에 맞는 프로젝트가 없습니다.</p>
                ) : (
                    <ul className="space-y-4">
                        {projects.map(p => <ProjectCard key={p.projectId} p={p} onChanged={projectData} />)}
                        <Pagination
                            {...bindPagination(total, {
                                variant: "admin",
                                showSizeSelector: true,
                                showRange: true,
                                sizeOptions: [5, 10, 20, 30, 50],
                            })}
                        />
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

/* ------------------------------- UI Bits ------------------------------- */

function ProjectCard({ p, onChanged }: { p: AdminProjectList; onChanged: () => void }) {

    const navigate = useNavigate();

    const canEdit = ["UPCOMING", "OPEN"].includes(p.projectStatus);
    const canCancel = ["UPCOMING", "OPEN"].includes(p.projectStatus);
    const [cancel, setCancel] = useState(false);

    const goDetail = (projectId: number) => navigate(`/admin/projects/${projectId}`);
    const goEdit = () => navigate(`/admin/project/${p.projectId}`);
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

    const st = p.projectStatus as ProjectStatus;

    return (
        <li key={p.projectId}>
            <Card className="group/card">
                <div className="grid gap-0 md:grid-cols-[180px_1fr]">
                    <div className="p-4 md:p-5 md:flex md:items-center md:justify-center">
                        <ProjectThumb
                            src={toPublicUrl(p.thumbnail)}
                            alt={p.title}
                            ratio="1/1"
                            className="w-[120px] h-[120px] md:w-[120px] md:h-[120px]"
                        />
                    </div>

                    <div className="border-t md:border-t-0 md:border-l border-border">
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
                            </div>
                        </CardHeader>

                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mt-3">
                                <div className="space-y-0.5">
                                    <dt className="text-xs text-muted-foreground">창작자명</dt>
                                    <dd className="font-medium text-foreground/90">{p.creatorName}</dd>
                                </div>

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
                            </dl>
                        </CardContent>

                        <CardFooter className="justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => goDetail(p.projectId)}>
                                <Eye className="h-4 w-4 mr-1" /> 상세보기
                            </Button>
                            {canEdit && (
                                <Button variant="outline" size="sm" onClick={goEdit}>
                                    <Pencil className="h-4 w-4 mr-1" /> 수정
                                </Button>
                            )}
                            {canCancel && (
                                <Button variant="destructive" size="sm" onClick={goCancel} disabled={cancel}>
                                    <XCircle className="h-4 w-4 mr-1" /> {cancel ? "취소중" : "취소"}
                                </Button>
                            )}
                        </CardFooter>
                    </div>
                </div>
            </Card>
        </li>
    );
}

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