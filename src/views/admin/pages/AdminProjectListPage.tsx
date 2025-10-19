import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowLeft, Eye, Heart, Pencil, Users, XCircle, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { endpoints, getData, postData } from "@/api/apis";
import { useNavigate } from "react-router-dom";
import FundingLoader from "@/components/FundingLoader";
import { useQueryState } from "./VerificationQueue";
import { formatDate, formatPrice } from "@/utils/utils";
import type { AdminProjectList } from "@/types/admin";
import { ProjectStatusChip, type ProjectStatus } from "../components/ProjectStatusChip";
import { Pagination } from "@/views/project/ProjectsBrowsePage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import clsx from "clsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Stage = keyof typeof STAGE_STATUS_MAP;
type ClosedResult = "ALL" | "SUCCESS" | "FAILED" | "CANCELED";

const STAGE_STATUS_MAP = {
    all: ["VERIFYING", "UPCOMING", "OPEN", "SUCCESS", "FAILED", "CANCELED", "REJECTED", "SETTLED"],
    verifying: ["VERIFYING"],
    upcoming: ["UPCOMING"],
    open: ["OPEN"],
    closed: ["SUCCESS", "FAILED", "CANCELED"],
    rejected: ["REJECTED"],
    settled: ["SETTLED"],
} as const;

const STAGES: { key: Stage; label: string }[] = [
    { key: "all", label: "전체" },
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

/* --------------------------------- Page --------------------------------- */
export function AdminProjectListPage() {
    const [projects, setProjects] = useState<AdminProjectList[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

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
        return endpoints.getAdminProjectList({ page, size, projectStatus: projectStatus || undefined, rangeType: rangeType || undefined });
    }, [page, size, projectStatus, rangeType]);

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
        } catch (e) {
            setError(e);
            setProjects([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        projectData();
    }, [projectData]);

    /* -------------------------------- Safe Filtering --------------------------------- */
    // 서버가 콤마 분리 다중 상태를 지원하지 않을 경우를 대비한 클라이언트 필터
    const activeStatuses = useMemo<ProjectStatus[]>(() => {
        return currentStatusCsv.split(",").map((st) => st.trim()).filter(Boolean) as ProjectStatus[];
    }, [currentStatusCsv]);

    const visible = useMemo(() => {
        if (!currentStatusCsv) return projects;
        return projects.filter(p => activeStatuses.includes(p.projectStatus as ProjectStatus))
    }, [projects, activeStatuses, currentStatusCsv]);

    /* --------------------------- Render --------------------------- */
    if (loading) return <FundingLoader />;
    if (error) return <p className="text-red-600">프로젝트 목록을 불러오지 못했습니다.</p>;

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
                    <p>조건에 맞는 프로젝트가 없습니다.</p>
                ) : (
                    <ul className="space-y-4">
                        {projects.map(p => <ProjectCard key={p.projectId} p={p} onChanged={projectData} />)}
                        <Pagination
                            key={`${stage}-${closedResult || "ALL"}-${rangeType || "ALL"}-${size}`}
                            page={page}
                            size={size}
                            total={total}
                            onPage={setPage}
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

    const canVerify = p.projectStatus === "VERIFYING";
    const canCancel = ["VERIFYING", "UPCOMING", "OPEN"].includes(p.projectStatus);
    const [cancel, setCancel] = useState(false);

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
                    </div>
                </CardHeader>

                <CardContent>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div className="space-y-0.5">
                            <dt className="text-xs text-muted-foreground">창작자명</dt>
                            <dd className="font-medium text-foreground/90">
                                {p.creatorName}
                            </dd>
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
        </li>
    );

    // return (
    //     <Card className="block">
    //         <CardHeader className="pb-2">
    //             <CardTitle className="flex items-center gap-2 flex-wrap">
    //                 <span className="mr-1 truncate">{p.title}</span>
    //                 <ProjectStatusChip status={p.projectStatus as ProjectStatus} />
    //                 {["UPCOMING", "OPEN"].includes(p.projectStatus) && (
    //                     <span>({getDaysLeft(p.endDate)}일 남음)</span>
    //                 )}
    //             </CardTitle>
    //         </CardHeader>

    //         <CardContent>
    //             <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
    //                 <div>기간: {formatDate(p.startDate)} ~ {formatDate(p.endDate)}</div>
    //                 <div>카테고리: {p.ctgrName} &gt; {p.subctgrName}</div>
    //                 <div>현재/목표금액: {p.currAmount.toLocaleString()} / {p.goalAmount.toLocaleString()} ({p.percentNow}%)</div>
    //                 <div>후원자 수: {p.backerCnt.toLocaleString()}</div>
    //                 <div>창작자: {p.creatorName}</div>
    //                 <div>마지막 수정일: {formatDate(p.updatedAt)}</div>
    //             </div>
    //         </CardContent>

    //         <CardFooter className="justify-end gap-2 pt-2">
    //             <Button variant="outline" size="sm" onClick={goEdit}>
    //                 <Pencil className="h-4 w-4 mr-1" /> 수정
    //             </Button>

    //             {canCancel && (
    //                 <Button variant="destructive" size="sm" onClick={goCancel} disabled={cancel}>
    //                     <XCircle className="h-4 w-4 mr-1" /> {cancel ? "취소중" : "취소"}
    //                 </Button>
    //             )}

    //             {canVerify && (
    //                 <Button variant="default" size="sm" onClick={goVerifyDetail}>
    //                     심사
    //                 </Button>
    //             )}
    //         </CardFooter>
    //     </Card>
    // );
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