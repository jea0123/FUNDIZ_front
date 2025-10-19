import { endpoints, getData, postData } from "@/api/apis";
import FundingLoader from "@/components/FundingLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProjectVerifyDetail } from "@/types/admin";
import { formatDate, formatNumber, toPublicUrl } from "@/utils/utils";
import { BusinessDocViewer } from "@/views/creator/components/BusinessDocViewer";
import { ProjectDetailViewer } from "@/views/creator/components/ProjectDetailViewer";
import { ArrowLeft, BadgeCheck, CheckCircle, FileText, Gift, UserRound, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const toTagNames = (list: any): string[] =>
    Array.isArray(list)
        ? list
            .map((t: any) => (typeof t === "string" ? t : t?.tagName))
            .filter((s: any): s is string => typeof s === "string" && s.trim().length > 0)
        : [];

export function VerificationDetails() {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    const [project, setProject] = useState<ProjectVerifyDetail | null>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [reason, setReason] = useState("");

    const thumbnailUrl = useMemo(() =>
        toPublicUrl(project?.thumbnail ?? null), [project?.thumbnail]
    );
    const businessDocUrl = useMemo(() =>
        toPublicUrl(project?.businessDoc ?? null), [project?.businessDoc]
    );

    const projectData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getData(endpoints.getProjectVerifyDetail(Number(projectId)));
            if (response.status === 200) {
                setProject(response.data);
            }
        } catch (e: any) {
            setError(e?.message || "데이터 로드 중 오류가 발생했습니다.");
            setProject(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!projectId) return;
        projectData();
    }, [projectId]);

    const handleApprove = async () => {
        if (!project || !projectId) return;
        try {
            if (!window.confirm(`[${project.title}]\n프로젝트를 승인하시겠습니까?`)) return;
            setApproving(true);
            const response = await postData(endpoints.approveProject(Number(projectId)));
            if (response.status === 200) {
                alert(`[${project.title}] 승인되었습니다.`);
                navigate(-1);
            }
        } catch (err) {
            console.log(err);
            alert(`[${project.title}] 승인 실패했습니다.`);
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async () => {
        if (!project || !projectId) return;
        try {
            setRejecting(true);
            const response = await postData(endpoints.rejectProject(Number(projectId)), { rejectedReason: reason });
            if (response.status === 200) {
                alert(`[${project.title}] 반려되었습니다.\n사유: ${reason}`);
                setOpenRejectModal(false);
                navigate(-1);
            }
        } catch (err) {
            console.log(err);
            alert(`[${project.title}] 반려 실패했습니다.`);
        } finally {
            setRejecting(false);
        }
    };

    /* ----------------------------------- Render ----------------------------------- */
    if (loading || !project) return <FundingLoader />;
    if (!project) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <EmptyState onBack={() => navigate(-1)} message={error ?? "프로젝트를 불러오지 못했습니다."} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold truncate">프로젝트 심사</h1>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BadgeCheck className="h-5 w-5" /> 프로젝트 정보
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <>
                            <div className="text-sm text-muted-foreground">대표 이미지</div>
                            <div className="mb-6 overflow-hidden rounded-xl border bg-background">
                                <img src={thumbnailUrl} alt={project.title} className="w-full max-h-[420px] object-cover" />
                            </div>
                        </>
                        <KV label="카테고리" value={`${project.ctgrName} > ${project.subctgrName}`} />
                        <div>
                            <div className="text-sm text-muted-foreground">태그</div>
                            {toTagNames(project.tagList).length ? (
                                <div className="flex flex-wrap gap-2">
                                    {toTagNames(project.tagList).map((t) => (
                                        <Badge key={t} variant="secondary" className="text-sm">{t}</Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm">-</p>
                            )}
                        </div>
                        <KV label="펀딩 기간" value={`${formatDate(project.startDate)} ~ ${formatDate(project.endDate)}`} />
                        <KV label="목표 금액" value={`${formatNumber(project.goalAmount)}원`} />
                        <div className="space-y-6">
                            <section>
                                <div className="text-sm text-muted-foreground mb-2">프로젝트 내용</div>
                                <div className="whitespace-pre-wrap leading-relaxed">
                                    {project.content}
                                </div>
                            </section>
                            <section>
                                <div className="text-sm text-muted-foreground mb-2">프로젝트 소개</div>
                                <ProjectDetailViewer data={project.contentBlocks} />
                            </section>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5" /> 리워드 구성 ({project.rewardList.length}개)
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {project.rewardList.length === 0 && <p className="text-sm text-muted-foreground">등록된 리워드가 없습니다.</p>}
                        {project.rewardList.map((r) => (
                            <div key={(r as any).rewardId ?? `${r.rewardName}-${r.price}`} className="rounded-lg border p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg font-semibold">{formatNumber(r.price)}원</span>
                                            {r.rewardCnt ? <Badge variant="secondary">한정 {r.rewardCnt}개</Badge> : null}
                                            <Badge variant={r.isPosting === "Y" ? "default" : "outline"}>
                                                {r.isPosting === "Y" ? "배송 필요" : "배송 불필요"}
                                            </Badge>
                                        </div>
                                        <div className="font-medium">{r.rewardName}</div>
                                        <div className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{r.rewardContent}</div>
                                        <div className="text-xs text-muted-foreground mt-2">배송/제공 예정일: {formatDate(r.deliveryDate)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserRound className="h-5 w-5" /> 창작자 정보
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <KV label="창작자명" value={project.creatorName} />
                        <KV label="이메일" value={project.email} />
                        <KV label="전화번호" value={project.phone} />
                        <KV label="사업자번호" value={project.businessNum || "-"} />
                    </CardContent>
                </Card>

                {businessDocUrl && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> 사업자등록증
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BusinessDocViewer src={businessDocUrl} fileName={`사업자등록증_${project.creatorName || project.projectId}.pdf`} />
                        </CardContent>
                    </Card>
                )}

                <div className="sticky bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-xl p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <Button variant="ghost" className="leading-none min-w-0 w-auto" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4" />뒤로
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleApprove} disabled={approving}>
                                <CheckCircle className="h-4 w-4 mr-1" />{approving ? "승인중" : "승인"}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => { setReason(""); setOpenRejectModal(true); }}>
                                <XCircle className="h-4 w-4 mr-1" />반려
                            </Button>
                        </div>
                    </div>
                </div>

                <Dialog open={openRejectModal} onOpenChange={setOpenRejectModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>프로젝트 반려</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-700">[{project.title}]</p>
                            <Input
                                value={reason}
                                placeholder="프로젝트 반려 사유를 입력하세요."
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpenRejectModal(false)}>취소</Button>
                            <Button variant="destructive" disabled={!reason.trim() || rejecting} onClick={handleReject}>
                                {rejecting ? "반려중" : "확인"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
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

function KV({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-28 shrink-0 text-sm text-muted-foreground flex items-center gap-1">
                {icon}
                <span>{label}</span>
            </div>
            <div className="min-w-0 text-sm leading-relaxed break-all [overflow-wrap:anywhere]">{value || "-"}</div>
        </div>
    );
}