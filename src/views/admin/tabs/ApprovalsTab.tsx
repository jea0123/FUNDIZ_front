import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import type { ProjectVerifyList, SearchProjectVerify } from "@/types/admin";
import { endpoints, getData, postData } from "@/api/apis";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDate } from "@/utils/utils";
import { Badge } from "@/components/ui/badge";

/* ------------------------------ Common hook ------------------------------ */

function useQueryState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "5", 10));
    const rangeType = searchParams.get("rangeType") || "";
    const projectStatus = searchParams.get("projectStatus") || "VERIFYING";

    const setParam = (k: string, v?: string) => {
        const next = new URLSearchParams(searchParams);

        if (v && v.length) {
            next.set(k, v);
        } else {
            next.delete(k);
        }
        setSearchParams(next, { replace: true });
    };

    const setPage = (p: number) => setParam("page", String(p));
    const setSize = (s: number) => setParam("size", String(s));
    const setRangeType = (rt: string) => setParam("rangeType", rt);
    const setProjectStatus = (ps: string) => setParam("projectStatus", ps);

    return { page, size, rangeType, projectStatus, setPage, setSize, setRangeType, setProjectStatus };
}

export function ApprovalCard({ project, projectData }: { project: ProjectVerifyList; projectData: () => Promise<void> }) {
    const navigate = useNavigate();

    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    const [reason, setReason] = useState("");
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [targetProject, setTargetProject] = useState< { id: number; title: string } | null>(null);

    const handleApproveButton = async (projectId: number, title: string) => {
        try {
            setApprovingId(projectId);
            if (!window.confirm(`[${title}] 프로젝트를 승인하시겠습니까?`)) {
                return;
            }
            const response = await postData(endpoints.approveProject(projectId));
            if (response.status === 200) {
                alert(`[${title}] 승인되었습니다.`);
                await projectData();
            }
        } catch (err) {
            alert(`[${title}] 승인 실패했습니다.`);
        } finally {
            setApprovingId(null);
        }
    };

    const handleRejectButton = async (projectId: number, title: string) => {
        try {
            setRejectingId(projectId);
            const rejectedReason = prompt("반려 사유를 입력하세요:");
            if (!rejectedReason) {
                alert("반려 사유가 입력되지 않았습니다. 반려 사유를 입력하세요.");
                return;
            }
            const response = await postData(endpoints.rejectProject(projectId), { rejectedReason });
            if (response.status === 200) {
                alert(`[${title}] 반려되었습니다.\n사유: ${rejectedReason}`);
                await projectData();
                setOpenRejectModal(false);
            }
        } catch (err) {
            alert(`[${title}] 반려 실패했습니다.`);
        } finally {
            setRejectingId(null);
        }
    };

    return (
        <>
        <Card className="pb-4">
            <CardContent>
                <h4 className="font-semibold mb-2 truncate">{project.title}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                    <div className="truncate">창작자명: {project.creatorName}</div>
                    <div className="truncate">카테고리: {project.ctgrName} &gt; {project.subctgrName ?? "-"}</div>
                    <div>목표금액: {project.goalAmount}원</div>
                    <div>심사요청일: {formatDate(project.requestedAt)}</div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button
                    variant="outline" size="sm"
                    onClick={() => navigate(`/admin/verify/&{project.projectId}`)}
                >
                    <Eye className="h-4 w-4 mr-1" />상세보기
                </Button>
                <Button 
                    variant="default" size="sm"
                    onClick={() => handleApproveButton(project.projectId, project.title)}
                    disabled={approvingId === project.projectId}
                >
                    <CheckCircle className="h-4 w-4 mr-1"/>{approvingId === project.projectId ? "승인중" : "승인"}
                </Button>
                <Button
                    variant="destructive" size="sm"
                    onClick={() => {
                        setTargetProject({ id: project.projectId, title: project.title });
                        setReason("");
                        setOpenRejectModal(true);
                    }}
                >
                    <XCircle className="h-4 w-4 mr-1" />반려
                </Button>
            </CardFooter>
        </Card>
        </>
    )
}

/* ------------------------------ UI component ------------------------------ */

function Pagination({ page, size, total, onPage }: { page: number; size: number; total: number; onPage: (p: number) => void }) {
    const lastPage = Math.max(1, Math.ceil(total / size));

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>이전</Button>
            <span className="text-sm text-gray-600">{page} / {lastPage}</span>
            <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>다음</Button>
        </div>
    );
}

/* --------------------------------- Page --------------------------------- */

export function ApprovalsTab() {
    const [verifyList, setVerifyList] = useState<ProjectVerifyList[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const [approveing, setApproving] = useState<number | null>(null);
    const [rejecting, setRejecting] = useState<number | null>(null);

    const { page, size, rangeType, projectStatus, setPage, setRangeType } = useQueryState();

    const url = useMemo(() => {
        return endpoints.getProjectVerifyList({ page, size, projectStatus, rangeType: rangeType || undefined });
    }, [page, size, projectStatus, rangeType]);

    const projectData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getData(url);
            if (response.status === 200 && response.data) {
                const { items, totalElements } = response.data;
                setVerifyList(items ?? []);
                setTotal(totalElements ?? 0);
            } else {
                setVerifyList([]);
                setTotal(0);
            }
        } catch (err) {
            setError(err);
            setVerifyList([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        projectData();
    }, [url]);

    

    const RangeButton = ({ label, value }: { label: string; value: string }) => {
        const active = rangeType === value;
        return (
            <Button variant={active ? "default" : "outline"} size="sm" onClick={() => setRangeType(active ? "" : value)}>
                {label}
            </Button>
        );
    };

    if (loading) return <p>불러오는 중…</p>;
    if (error) return <p className="text-red-600">심사 목록을 불러오지 못했습니다.{String(error)}</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>프로젝트 심사 관리</CardTitle>
                <CardDescription>창작자가 제출한 프로젝트를 심사하고 승인/반려를 결정하세요.</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                    <RangeButton label="전체" value="" />
                    <RangeButton label="최근 7일" value="7d" />
                    <RangeButton label="최근 30일" value="30d" />
                    <RangeButton label="최근 90일" value="90d" />
                </div>
                <div className="text-xs text-gray-500 mt-2 pl-1">
                    <span>총 {total.toLocaleString()}건</span>
                </div>
            </CardHeader>
            <CardContent>
                {verifyList.length === 0 ? (
                    <p>심사 대기중인 프로젝트가 없습니다.</p>
                ) : (
                <div className="space-y-4">
                    {/* {verifyList.map((r) => (
                        
                    ))} */}
                    <Pagination page={page} size={size} total={total} onPage={setPage} />
                </div>
                )}
            </CardContent>
        </Card>
    );
}