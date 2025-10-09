import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, ArrowLeft, Truck, PackagePlus, Loader2, Gift } from "lucide-react";
import { endpoints, getData, postData } from "@/api/apis";
import type { ProjectSummaryDto } from "@/types/creator";
import type { Reward, RewardCreateRequestDto } from "@/types/reward";
import FundingLoader from "@/components/FundingLoader";
import { formatDate } from "@/utils/utils";

const numberKR = (n?: number | null) => new Intl.NumberFormat("ko-KR").format(n || 0);

export default function CreatorAddReward() {
    type RewardFormState = {
        projectId: number;
        rewardName: string;
        price: number;
        rewardContent: string;
        deliveryDate: Date;
        rewardCnt: number | null;
        isPosting: "Y" | "N";
    }

    const navigate = useNavigate();
    const { projectId: projectIdParam } = useParams();
    const projectId = Number(projectIdParam);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [project, setProject] = useState<ProjectSummaryDto | null>(null);
    const [rewards, setRewards] = useState<Reward[]>([]);
    
    // 신규 리워드 폼 상태
    const [form, setForm] = useState<RewardFormState>({
        projectId,
        rewardName: "",
        price: 0,
        rewardContent: "",
        deliveryDate: new Date(),
        rewardCnt: null,
        isPosting: "Y",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // 초기 데이터 로드: 프로젝트 요약 + 기존 리워드
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const [projectRes, rewardRes] = await Promise.all([
                    getData(endpoints.getCreatorProjectSummary(projectId)),
                    getData(endpoints.getCreatorRewardList(projectId)),
                ]);
                if (!alive) return;
                setProject(projectRes.data);
                setRewards(rewardRes.data || []);
            } catch (e) {
                console.error(e);
                alert("데이터를 불러오지 못했습니다.");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [projectId]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.price || form.price <= 0) e.price = "금액을 입력하세요.";
        if (!form.rewardName?.trim()) e.rewardName = "리워드명을 입력하세요.";
        if (!form.rewardContent?.trim()) e.rewardContent = "리워드 설명을 입력하세요.";
        if (form.isPosting === "Y" || form.isPosting === "N") {
            const label = form.isPosting === "Y" ? "배송 예정일" : "제공 예정일";
            if (!form.deliveryDate) {
                e.deliveryDate = `${label}을 선택하세요.`;
            } else if (project?.endDate) {
                const end = new Date(project.endDate);
                const del = new Date(form.deliveryDate);
                if (del < end) e.deliveryDate = `${label}은 펀딩 종료일 이후여야 합니다.`;
            }
        }
        if (form.rewardCnt != null && form.rewardCnt < 0) e.rewardCnt = "수량은 0 이상이어야 합니다.";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async () => {
        if (!project) return;
        if (!validate()) return;

        try {
            setSaving(true);
            const payload: RewardCreateRequestDto = {
                projectId: form.projectId,
                rewardName: form.rewardName.trim(),
                price: form.price,
                rewardContent: form.rewardContent.trim(),
                deliveryDate: form.deliveryDate,
                rewardCnt: form.rewardCnt ?? 0,
                isPosting: form.isPosting
            };

            const res = await postData(endpoints.addReward(project.projectId), payload);
            if (res?.status === 200) {
                alert("리워드를 추가했습니다.");
                // 폼 초기화 + 리스트 재조회
                setForm({
                    projectId,
                    rewardName: "",
                    price: 0,
                    rewardContent: "",
                    deliveryDate: new Date(),
                    rewardCnt: null,
                    isPosting: "Y"
                });
                const refresh = await getData(endpoints.getCreatorRewardList(project.projectId));
                setRewards(refresh.data || []);
            } else {
                alert(res?.data?.message || "추가에 실패했습니다.");
            }
        } catch (e: any) {
            console.error(e);
            const msg = e?.response?.data?.message || "일시적인 오류가 발생했습니다.";
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    const disabledByStatus = useMemo(() => {
        const s = project?.projectStatus;
        // 운영 중 추가만 허용
        return !(s === "UPCOMING" || s === "OPEN");
    }, [project?.projectStatus]);

    if (loading) return <FundingLoader />;

    if (!project) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" /> 뒤로
                </Button>
                <Card>
                    <CardContent className="p-6">프로젝트 정보를 찾을 수 없습니다.</CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold truncate">리워드 추가</h1>
                </div>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> 뒤로
                </Button>
            </div>

            <Card className="block">
                <CardHeader>
                    <CardTitle className="text-base">프로젝트 정보</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="text-sm">
                        <div className="mt-1 text-muted-foreground">
                            프로젝트 <span className="ml-1 font-medium text-foreground">{project.title}</span>
                        </div>

                        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="flex items-center gap-2">
                                <div className="text-muted-foreground">상태</div>
                                <div>
                                    <Badge variant={disabledByStatus ? "secondary" : "default"}>
                                        {project.projectStatus}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="text-muted-foreground">종료일</div>
                                <div className="font-medium text-foreground">{formatDate(project.endDate)}</div>
                            </div>
                        </div>
                        {disabledByStatus && (
                            <p className="text-red-600 text-sm mt-2">현재 상태에서는 리워드 추가가 제한됩니다. ('오픈예정'/'진행중'에서만 추가 가능)</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="block">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center">
                        <PackagePlus className="h-4 w-4 mr-2" /> 새 리워드 구성
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="price">후원 금액 *</Label>
                            <Input
                                id="price"
                                placeholder="0"
                                value={String(form.price ?? "")}
                                onChange={(e) => setForm({ ...form, price: Number(e.target.value.replace(/[^0-9]/g, "")) })}
                                disabled={disabledByStatus}
                            />
                            {form.price ? (
                                <p className="mt-1 text-xs text-muted-foreground">{numberKR(form.price)}원</p>
                            ) : null}
                            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                        </div>
                        <div>
                            <Label htmlFor="rewardCnt">제한 수량 (선택)</Label>
                            <Input
                                id="rewardCnt"
                                placeholder="0"
                                value={String(form.rewardCnt ?? "")}
                                onChange={(e) => setForm({ ...form, rewardCnt: Number(e.target.value.replace(/[^0-9]/g, "")) })}
                                disabled={disabledByStatus}
                            />
                            {errors.rewardCnt && <p className="mt-1 text-xs text-red-500">{errors.rewardCnt}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="rewardName">리워드명 *</Label>
                        <Input
                            id="rewardName"
                            placeholder="얼리버드 패키지"
                            value={form.rewardName}
                            onChange={(e) => setForm({ ...form, rewardName: e.target.value })}
                            disabled={disabledByStatus}
                        />
                        {errors.rewardName && <p className="mt-1 text-xs text-red-500">{errors.rewardName}</p>}
                    </div>

                    <div>
                        <Label htmlFor="rewardContent">리워드 설명 *</Label>
                        <Textarea
                            id="rewardContent"
                            rows={3}
                            placeholder="리워드 구성품과 혜택을 설명하세요"
                            value={form.rewardContent}
                            onChange={(e) => setForm({ ...form, rewardContent: e.target.value })}
                            disabled={disabledByStatus}
                        />
                        {errors.rewardContent && <p className="mt-1 text-xs text-red-500">{errors.rewardContent}</p>}
                    </div>

                    <div>
                        <Label htmlFor="deliveryDate">{form.isPosting === "Y" ? "배송 예정일 *" : "제공 예정일 *"}</Label>
                        <Input
                            id="deliveryDate"
                            type="date"
                            value={formatDate(form.deliveryDate)}
                            onChange={(e) => setForm({ ...form, deliveryDate: new Date(e.target.value) })}
                            disabled={disabledByStatus}
                        />
                        {errors.deliveryDate && <p className="mt-1 text-xs text-red-500">{errors.deliveryDate}</p>}
                    </div>

                    <div>
                        <Label htmlFor="isPosting">배송 필요 여부 *</Label>
                        <Select
                            value={form.isPosting}
                            onValueChange={(v) => setForm((f) => ({ ...f, isPosting: v as "Y" | "N" }))}
                            disabled={disabledByStatus}
                        >
                            <SelectTrigger id="isPosting" className="w-full">
                                <SelectValue placeholder="배송 필요 여부 선택" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="Y">배송 필요</SelectItem>
                                <SelectItem value="N">배송 불필요(디지털/현장수령)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={onSubmit}
                        disabled={disabledByStatus || saving}
                        className="w-full"
                    >
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        리워드 추가
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center">
                        <Gift className="h-4 w-4 mr-2" /> 기존 리워드
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {rewards.length === 0 ? (
                        <p className="text-sm text-muted-foreground">기존 리워드가 없습니다.</p>
                    ) : (
                        <div className="grid gap-4">
                            {rewards.map((r) => (
                                <div key={r.rewardId} className="rounded-lg border p-4 md:p-5">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-lg font-semibold tabular-nums">{numberKR(r.price)}원</span>
                                                {r.rewardCnt ? <Badge variant="secondary">한정 {r.rewardCnt}개</Badge> : null}
                                                {r.isPosting === "Y" ? <Badge>배송 필요</Badge> : <Badge variant="outline">배송 불필요</Badge>}
                                            </div>

                                            <h4 className="font-medium truncate">{r.rewardName}</h4>
                                            <p className="mt-1 text-sm text-muted-foreground break-words">{r.rewardContent}</p>

                                            <div className="mt-2 text-sm text-foreground/80 flex flex-wrap items-center gap-3">
                                                {r.deliveryDate && (
                                                    <span className="inline-flex items-center gap-1">
                                                        {formatDate(r.deliveryDate)}
                                                        {r.isPosting === "Y" && <Truck className="h-4 w-4" />}
                                                    </span>
                                                )}
                                                {typeof r.remain === "number" && (
                                                    <span>남은 {numberKR(r.remain)}개</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Separator />
        </div>
    );
}
