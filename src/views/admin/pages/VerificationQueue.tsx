import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Eye, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProjectVerifyList } from "@/types/admin";
import { endpoints, getData, postData } from "@/api/apis";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDate, formatPrice } from "@/utils/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import FundingLoader from "@/components/FundingLoader";
import { Pagination } from "@/views/project/ProjectsBrowsePage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListQueryState } from "@/utils/usePagingQueryState";
import { ProjectStatusChip, type ProjectStatus } from "../components/ProjectStatusChip";

type Stage = "verifying" | "completed";
type CompletedResult = "ALL" | "UPCOMING" | "REJECTED";
type VerificationStatus = "VERIFYING" | "UPCOMING" | "REJECTED";

const STAGE_STATUS_MAP: Record<Stage, VerificationStatus[]> = {
    verifying: ["VERIFYING"],
    completed: ["UPCOMING", "REJECTED"],
};

const STAGES: { key: Stage; label: string }[] = [
    { key: "verifying", label: "심사중" },
    { key: "completed", label: "심사완료" },
];

const COMPLETED_RESULTS: { label: string; value: CompletedResult }[] = [
    { label: "전체", value: "ALL" },
    { label: "승인", value: "UPCOMING" },
    { label: "반려", value: "REJECTED" },
];

const stageLabel = (s: Stage) => STAGES.find(x => x.key === s)?.label ?? "상태";

/* --------------------------------- Page --------------------------------- */
export function VerificationQueue() {
    const navigate = useNavigate();
    const location = useLocation();
    const [projects, setProjects] = useState<ProjectVerifyList[] | null>(null);
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

        if (tokens.length === 0) return "verifying";
        if (has(["UPCOMING", "REJECTED"])) return "completed";
        if (has("VERIFYING")) return "verifying";
        return "verifying";
    }, [projectStatus]);

    const [stage, setStage] = useState<Stage>(initialStage);
    const [completedResult, setCompletedResult] = useState<CompletedResult>("ALL");

    // stage 변경 시 서버/URL 동기화
    const applyStageToQuery = (next: Stage, nextCompletedResult: CompletedResult = "ALL") => {
        setStage(next);
        setCompletedResult(next === "completed" ? nextCompletedResult : "ALL");
        setPage(1);
        setRangeType("");

        if (next === "completed") {
            setProjectStatus(nextCompletedResult === "ALL" ? [...STAGE_STATUS_MAP.completed] : [nextCompletedResult]);
        } else {
            setProjectStatus([...STAGE_STATUS_MAP[next]]);
        }
    };

    /* ------------------------------------ URL ------------------------------------ */
    // 현재 선택된 상태(배열)
    const selectedStatuses: VerificationStatus[] = useMemo(() => {
        if (stage === "verifying") return STAGE_STATUS_MAP.verifying.slice();
        return completedResult === "ALL"
            ? STAGE_STATUS_MAP.completed.slice()
            : [completedResult as VerificationStatus];
    }, [stage, completedResult]);

    const url = useMemo(() => endpoints.getProjectVerifyList({
        page, size, perGroup,
        projectStatus: selectedStatuses.length ? selectedStatuses : undefined,
        rangeType: rangeType || undefined,
    }), [page, size, perGroup, selectedStatuses, rangeType]);

    /* -------------------------------- Data fetching -------------------------------- */
    const projectData = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await getData(url);
            if (response.status === 200 && response.data) {
                const { items, totalElements } = response.data;
                setProjects(items ?? []);
                setTotal(totalElements ?? 0);
            } else {
                setProjects([]);
                setTotal(0);
            }
        } catch (e: any) {
            setError(e?.message || "데이터 로드 중 오류가 발생했습니다.");
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
            queueMicrotask(() => applyStageToQuery(initialStage));
        }
    }, []);

    /* -------------------------------- Render --------------------------------- */
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
                    <CardTitle>프로젝트 심사 목록</CardTitle>
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

                        {stage === "completed" && (
                            <Select
                                value={completedResult ? completedResult : "ALL"}
                                onValueChange={(v) => {
                                    applyStageToQuery("completed", v as CompletedResult);
                                }}
                            >
                                <SelectTrigger className="h-8 w-[110px] text-xs">
                                    <SelectValue placeholder="전체">
                                        {COMPLETED_RESULTS.find(c => c.value === completedResult)?.label ?? "전체"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {COMPLETED_RESULTS.map(c => (
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
                                showSizeSelector: true,
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

function ProjectCard({ p, onChanged }: { p: ProjectVerifyList; onChanged: () => void }) {
    const navigate = useNavigate();

    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    const [reason, setReason] = useState("");
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [targetProject, setTargetProject] = useState<{ id: number; title: string } | null>(null);

    const goDetail = (projectId: number) => navigate(`/admin/verify/${projectId}`);

    const st = p.projectStatus as ProjectStatus;

    const handleApproveButton = async (projectId: number, title: string) => {
        try {
            setApprovingId(projectId);
            if (!window.confirm(`[${title}]\n프로젝트를 승인하시겠습니까?`)) {
                return;
            }
            const response = await postData(endpoints.approveProject(projectId));
            if (response.status === 200) {
                alert(`[${title}]\n승인되었습니다.`);
                onChanged();
            }
        } catch (err) {
            console.log(err);
            alert(`[${title}]\n승인 실패했습니다.`);
        } finally {
            setApprovingId(null);
        }
    };

    const handleRejectButton = async (projectId: number, title: string) => {
        try {
            setRejectingId(projectId);
            const response = await postData(endpoints.rejectProject(projectId), { rejectedReason: reason });
            if (response.status === 200) {
                alert(`[${title}]\n반려되었습니다.\n사유: ${reason}`);
                onChanged();
                setOpenRejectModal(false);
            }
        } catch (err) {
            console.log(err);
            alert(`[${title}]\n반려 실패했습니다.`);
        } finally {
            setRejectingId(null);
        }
    };

    return (
        <li key={p.projectId}>
            <Card>
                <CardHeader className="space-y-3">
                    <CardTitle className="flex flex-wrap items-center gap-3">
                        <span className="truncate">{p.title}</span>
                            <ProjectStatusChip status={st} />
                    </CardTitle>
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
                            <dt className="text-xs text-muted-foreground">목표 금액</dt>
                            <dd className="font-medium text-foreground/90 tabular-nums">
                                {formatPrice(p.goalAmount)}
                            </dd>
                        </div>

                        <div className="space-y-0.5">
                            <dt className="text-xs text-muted-foreground">심사요청일</dt>
                            <dd className="text-foreground/90">
                                {formatDate(p.requestedAt)}
                            </dd>
                        </div>
                    </dl>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => goDetail(p.projectId)}>
                        <Eye className="h-4 w-4 mr-1" /> 상세보기
                    </Button>

                    {st === "VERIFYING" && (
                        <>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveButton(p.projectId, p.title)}
                                disabled={approvingId === p.projectId}
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />{approvingId === p.projectId ? "승인중" : "승인"}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setTargetProject({ id: p.projectId, title: p.title });
                                    setReason("");
                                    setOpenRejectModal(true);
                                }}
                            >
                                <XCircle className="h-4 w-4 mr-1" /> 반려
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>

            <Dialog open={openRejectModal} onOpenChange={setOpenRejectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>프로젝트 반려</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <p>[{targetProject?.title}]</p>
                        <Input value={reason} placeholder="프로젝트 반려 사유를 입력하세요." onChange={(e) => setReason(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpenRejectModal(false)}>취소</Button>
                        <Button
                            variant="destructive"
                            disabled={!reason.trim() || rejectingId === targetProject?.id}
                            onClick={() => handleRejectButton(targetProject!.id, targetProject!.title)}
                        >
                            {rejectingId === targetProject?.id ? "반려중" : "확인"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </li>
    );
}