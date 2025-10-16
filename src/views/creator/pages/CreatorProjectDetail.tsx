import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Mail, Phone, ShieldCheck, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FundingLoader from "@/components/FundingLoader";
import { endpoints, getData, kyInstance } from "@/api/apis";
import type { ProjectCreateRequestDto } from "@/types/creator";
import type { RewardCreateRequestDto } from "@/types/reward";
import type { Category } from "@/types/admin";
import type { Subcategory } from "@/types/projects";
import { formatDate } from "@/utils/utils";
import { useCreatorId } from "../useCreatorId";

/* ------------------------------- Types ------------------------------- */

type RewardView = RewardCreateRequestDto & { rewardId?: number };

/* ------------------------------- Utils ------------------------------- */

const fmtKRW = (n?: number) =>
    typeof n === "number" && !isNaN(n) ? new Intl.NumberFormat("ko-KR").format(n) : "-";

const toTagNames = (list: any): string[] =>
    Array.isArray(list)
        ? list
            .map((t: any) => (typeof t === "string" ? t : t?.tagName))
            .filter((s: any): s is string => typeof s === "string" && s.trim().length > 0)
        : [];

function useObjectUrl(file: File | null | undefined) {
    const url = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
    useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
    return url;
}

/* ------------------------------- Page ------------------------------- */

export default function CreatorProjectDetail() {
    //TODO: 임시용 id (나중에 삭제하기)
    const { creatorId, loading: idLoading } = useCreatorId(26);

    const { projectId: projectIdParam } = useParams();
    const projectId = projectIdParam ? Number(projectIdParam) : null;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [project, setProject] = useState<ProjectCreateRequestDto | null>(null);
    const [rewards, setRewards] = useState<RewardView[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    useEffect(() => {
        let mounted = true;

        if (!projectId) return;
        if (idLoading) return;
        if (creatorId == null) return;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const [catRes, subRes] = await Promise.all([
                    getData(endpoints.getCategories),
                    getData(endpoints.getSubcategories),
                ]);

                if (!mounted) return;
                setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
                setSubcategories(Array.isArray(subRes?.data) ? subRes.data : []);

                //TODO: dev 헤더에 creatorId 주입
                const res = await kyInstance.get(endpoints.getCreatorProjectDetail(projectId), {
                    headers: { "X-DEV-CREATOR-ID": String(creatorId) },
                });

                if (!mounted) return;
                const body = await res.json<any>();
                const draft = body?.data ?? body ?? {};

                const project: ProjectCreateRequestDto = {
                    projectId: Number(draft.projectId) || 0,
                    creatorId: Number(draft.creatorId) || 0,
                    ctgrId: Number(draft.ctgrId) || 0,
                    subctgrId: Number(draft.subctgrId) || 0,
                    title: draft.title ?? "",
                    goalAmount: Number(draft.goalAmount) || 0,
                    startDate: draft.startDate ? new Date(draft.startDate) : new Date(),
                    endDate: draft.endDate ? new Date(draft.endDate) : new Date(),
                    content: draft.content ?? "",
                    contentBlocks: draft.contentBlocks ?? { blocks: [] },
                    thumbnail: draft.thumbnail ?? null,
                    businessDoc: draft.businessDoc ?? null,
                    tagList: toTagNames(draft.tagList),
                    rewardList: [],
                    creatorName: draft.creatorName ?? "",
                    businessNum: draft.businessNum ?? "",
                    email: draft.email ?? "",
                    phone: draft.phone ?? "",
                };
                setProject(project);

                const rewardArr: RewardView[] = (draft.rewardList ?? []).map((r: any) => ({
                    rewardId: r.rewardId ? Number(r.rewardId) : undefined,
                    rewardName: r.rewardName ?? "",
                    price: Number(r.price) || 0,
                    rewardContent: r.rewardContent ?? "",
                    deliveryDate: r.deliveryDate ? new Date(r.deliveryDate) : new Date(),
                    rewardCnt: r.rewardCnt ? Number(r.rewardCnt) : 0,
                    isPosting: ((r.isPosting ?? "Y") + "").trim() === "N" ? "N" : "Y",
                }));
                setRewards(rewardArr);
            } catch (e: any) {
                setError(e?.message ?? "데이터 로드 중 오류가 발생했습니다.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [projectId, idLoading, creatorId]);

    const categoryPath = useMemo(() => {
        if (!project) return "-";

        const sub = subcategories.find((s) => Number(s.subctgrId) === Number(project.subctgrId));
        if (!sub) return "-";
        const ctg = categories.find((c) => Number(c.ctgrId) === Number(sub.ctgrId));

        return `${ctg?.ctgrName} > ${sub.subctgrName}`;
    }, [project, categories, subcategories]);

    if (loading) return <FundingLoader />;

    if (!project) {

        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <EmptyState onBack={() => navigate(-1)} message={error ?? "프로젝트를 찾을 수 없습니다."} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold truncate">{project.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <StatusChip status="VERIFYING" />
                </div>
            </div>

            {/* TODO: 대표이미지 수정 */}
            {useObjectUrl(project.thumbnail) && (
                <div className="mb-6 overflow-hidden rounded-xl border bg-background">
                    <img src={useObjectUrl(project.thumbnail)} alt={project.title} className="w-full max-h-[420px] object-cover" />
                </div>
            )}

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BadgeCheck className="h-5 w-5" /> 프로젝트 정보
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <KV label="카테고리" value={categoryPath} />
                        <KV label="펀딩 기간" value={`${formatDate(project.startDate)} ~ ${formatDate(project.endDate)}`} />
                        <KV label="목표 금액" value={`${fmtKRW(project.goalAmount)}원`} icon={<Wallet className="h-4 w-4" />} />
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">검색 태그</div>
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
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">프로젝트 소개</div>
                            <div className="prose max-w-none whitespace-pre-wrap leading-relaxed">
                                {project.content}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>창작자 정보</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <KV label="창작자명" value={project.creatorName} />
                        <KV label="사업자등록번호" value={project.businessNum || "-"} />
                        <KV label="이메일" value={project.email} icon={<Mail className="h-4 w-4" />} />
                        <KV label="전화번호" value={project.phone} icon={<Phone className="h-4 w-4" />} />
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>리워드 구성 ({rewards.length}개)</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {rewards.length === 0 && <p className="text-sm text-muted-foreground">등록된 리워드가 없습니다.</p>}
                        {rewards.map((r) => (
                            <div key={(r as any).rewardId ?? `${r.rewardName}-${r.price}`} className="rounded-lg border p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg font-semibold">{fmtKRW(r.price)}원</span>
                                            {r.rewardCnt ? <Badge variant="secondary">한정 {r.rewardCnt}개</Badge> : null}
                                            <Badge variant={r.isPosting === "Y" ? "default" : "outline"}>
                                                {r.isPosting === "Y" ? "배송 필요" : "배송 불필요"}
                                            </Badge>
                                        </div>
                                        <div className="font-medium">{r.rewardName}</div>
                                        <div className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{r.rewardContent}</div>
                                        <div className="text-xs text-muted-foreground mt-2">배송 예정일: {formatDate(r.deliveryDate)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" /> 심사 정보
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2 text-sm">
                        <p>• 심사중에는 수정이 제한됩니다. (반려 시 새로운 프로젝트 생성)</p>
                        <p>• 등록된 이메일/전화로 안내드립니다.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <Button
                    variant="outline"
                    onClick={() => navigate("/creator/projects", { replace: true })}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> 목록으로
                </Button>
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

function StatusChip({ status }: { status: "VERIFYING" | string }) {
    return (
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            {status === "VERIFYING" ? "심사중" : status}
        </span>
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
