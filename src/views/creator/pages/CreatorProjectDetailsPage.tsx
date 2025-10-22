import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, FileText, Gift, ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FundingLoader from "@/components/FundingLoader";
import type { CreatorProjectDetailDto } from "@/types/creator";
import { formatDate, formatPrice, toPublicUrl } from "@/utils/utils";
import { ProjectDetailViewer } from "../components/ProjectDetailViewer";
import { endpoints, getData } from "@/api/apis";
import { ProjectStatusChip, type ProjectStatus } from "@/views/admin/components/ProjectStatusChip";
import { BusinessDocViewer } from "../components/BusinessDocViewer";
import { useCookies } from "react-cookie";

const toTagNames = (list: any): string[] =>
    Array.isArray(list)
        ? list
            .map((t: any) => (typeof t === "string" ? t : t?.tagName))
            .filter((s: any): s is string => typeof s === "string" && s.trim().length > 0)
        : [];

/* ------------------------------- Page ------------------------------- */

export default function CreatorProjectDetailsPage() {

    /* --------------------------- Router helpers --------------------------- */

    const navigate = useNavigate();
    const { projectId } = useParams();

    /* ------------------------------- States ------------------------------- */

    const [cookie] = useCookies();
    const [project, setProject] = useState<CreatorProjectDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const thumbnailUrl = useMemo(() =>
        toPublicUrl(project?.thumbnail ?? null), [project?.thumbnail]
    );
    const businessDocUrl = useMemo(() =>
        toPublicUrl(project?.businessDoc ?? null), [project?.businessDoc]
    );

    const projectData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await getData(endpoints.getCreatorProjectDetail(Number(projectId)), cookie.accessToken);
            if (res.status === 200) {
                setProject(res.data);
            }
        } catch (e: any) {
            setError(e?.message || "데이터 로드 중 에러가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        projectData();
    }, [projectData]);

    /* ----------------------------------- Render ----------------------------------- */

    if (loading) return <FundingLoader />;
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
                <h1 className="text-2xl font-semibold truncate">{project.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <ProjectStatusChip status={project.projectStatus as ProjectStatus} />
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BadgeCheck className="h-5 w-5" /> 프로젝트 정보
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <KV label="작성일 / 수정일" value={`${formatDate(project.createdAt)} / ${formatDate(project.updatedAt)}`} />
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
                        <KV label="목표 금액" value={`${formatPrice(project.goalAmount)}원`} />
                        <KV label="현재 금액" value={`${formatPrice(project.currAmount)}원`} />
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
                                            <span className="text-lg font-semibold">{formatPrice(r.price)}원</span>
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" /> 심사 안내
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2 text-sm">
                        <p>• 프로젝트 심사는 영업일 기준 3-5일 소요됩니다.</p>
                        <p>• 심사 결과는 등록된 이메일로 안내드립니다.</p>
                        <p>• 심사 승인 후 펀딩 시작일에 자동으로 공개됩니다.</p>
                        <p>• 심사 반려되었을 경우에는 새로운 프로젝트를 생성하셔야 합니다.</p>
                    </CardContent>
                </Card>

                <div className="sticky bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-xl p-3 shadow-sm">
                    <Button variant="ghost" className="leading-none min-w-0 w-auto" onClick={() => navigate(-1)}>
                        <ArrowLeft /> 뒤로
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------- UI Bits ------------------------------- */

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
