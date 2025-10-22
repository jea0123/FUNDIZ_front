import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/types/admin";
import type { ProjectCreateRequestDto } from "@/types/creator";
import type { Subcategory } from "@/types/projects";
import type { RewardDraft, RewardForm } from "@/types/reward";
import { formatDate, formatPrice, toKRWCompact } from "@/utils/utils";
import { Plus, Truck, X } from "lucide-react";
import { BusinessDocUploader, ThumbnailUploader } from "./CreatorUploaders";
import ProjectDetailEditor from "./ProjectDetailEditor";
import { PROJECT_RULES, TagEditor, type ProjectFieldErrors } from "../pages/CreatorProjectEditPage";
import { REWARD_RULES, type RewardFieldErrors } from "@/types/reward-validator";

/* -------------------------------- Type -------------------------------- */

export type CreateProjectViewModel = Omit<
    ProjectCreateRequestDto,
    "startDate" | "endDate" | "thumbnail" | "businessDoc"
> & {
    startDate: Date | null;
    endDate: Date | null;
    thumbnail: File | null;
    businessDoc: File | null;
    creatorName: string;
    businessNum: string;
    email: string;
    phone: string;
    thumbnailPreviewUrl?: string;
    businessDocPreviewUrl?: string;
};

type StepsProps = {
    step: number;
    project: CreateProjectViewModel;
    setProject: React.Dispatch<React.SetStateAction<CreateProjectViewModel>>;
    categories: Category[];
    subcategories: Subcategory[];
    rewardList: RewardForm[];
    newReward: RewardDraft;
    setNewReward: React.Dispatch<React.SetStateAction<RewardDraft>>;
    addReward: () => void;
    removeReward: (tempId: string) => void;
    agree?: boolean;
    setAgree?: React.Dispatch<React.SetStateAction<boolean>>;
    agreeError?: string | null;
    rewardErrors?: RewardFieldErrors;
    projectErrors?: ProjectFieldErrors;
    rewardListError?: string | null;
    clearProjectError?: (k: keyof ProjectFieldErrors) => void;
    clearRewardError?: (k: keyof RewardFieldErrors) => void;
    addDays: (date: Date, days: number) => Date;
}

/* -------------------------------- Utils -------------------------------- */
const parseLocalDate = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
};

/* -------------------------------- Page -------------------------------- */

export function CreatorProjectEditSteps(props: StepsProps) {
    const {
        step, project, setProject, categories, subcategories, rewardList, newReward,
        setNewReward, addReward, removeReward, agree = false, setAgree, agreeError,
        rewardErrors = {}, projectErrors = {}, rewardListError = null,
        clearProjectError, clearRewardError, addDays
    } = props;

    const P = PROJECT_RULES;
    const R = REWARD_RULES;

    if (step === 1) {
        return (
            <div className="space-y-6">
                <RequiredLegend />
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-x-2 gap-y-2">
                    <div className="min-w-0">
                        <LabelRequired htmlFor="category">카테고리</LabelRequired>
                        <Select
                            value={project.ctgrId ? String(project.ctgrId) : undefined}
                            onValueChange={(value) => {
                                setProject(prev => ({ ...prev, ctgrId: Number(value), subctgrId: 0 }))
                                clearProjectError?.("ctgrId");
                            }}
                        >
                            <SelectTrigger id="category" className="w-full">
                                <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(c =>
                                    <SelectItem key={c.ctgrId} value={String(c.ctgrId)}>{c.ctgrName}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {projectErrors?.ctgrId && <p className="mt-1 text-xs text-red-600">{projectErrors.ctgrId}</p>}
                    </div>

                    <div className="min-w-0">
                        <LabelRequired htmlFor="subcategory">세부카테고리</LabelRequired>
                        <Select
                            value={project.subctgrId ? String(project.subctgrId) : undefined}
                            onValueChange={(value) => {
                                setProject(prev => ({ ...prev, subctgrId: Number(value) }));
                                clearProjectError?.("subctgrId");
                            }}
                            disabled={!project.ctgrId}
                        >
                            <SelectTrigger id="subcategory" className="w-full">
                                <SelectValue placeholder="세부카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {subcategories.length > 0 ? (
                                    subcategories.map(sc => (
                                        <SelectItem key={sc.subctgrId} value={String(sc.subctgrId)}>
                                            {sc.subctgrName}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="__none" disabled>선택한 카테고리에 해당 세부카테고리가 없습니다</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {projectErrors?.subctgrId && <p className="mt-1 text-xs text-red-600">{projectErrors.subctgrId}</p>}
                    </div>
                </div>

                <div>
                    <LabelRequired htmlFor="title">프로젝트 제목</LabelRequired>
                    <Input
                        id="title"
                        placeholder={`제목은 ${P.MIN_TITLE_LEN}~ ${P.MAX_TITLE_LEN}자 이내로 입력해주세요.`}
                        value={project.title}
                        onChange={(e) => {
                            setProject(prev => ({ ...prev, title: e.target.value }));
                            clearProjectError?.("title");
                        }}
                        maxLength={50}
                        required
                    />
                    {projectErrors.title && <p className="mt-1 text-xs text-red-600">{projectErrors.title}</p>}
                </div>

                <div>
                    <LabelRequired htmlFor="thumbnail">대표 이미지</LabelRequired>
                    <ThumbnailUploader
                        id="thumbnail"
                        file={project.thumbnail}
                        previewUrl={project.thumbnailPreviewUrl}
                        onSelect={(f) => {
                            setProject(prev => ({
                                ...prev,
                                thumbnail: f,
                                thumbnailPreviewUrl: f ? undefined : prev.thumbnailPreviewUrl,
                            }));
                            clearProjectError?.("thumbnail");
                        }}
                        onCleared={() => setProject(prev => ({ ...prev, thumbnail: null, thumbnailPreviewUrl: undefined }))}
                        required
                    />
                    {projectErrors.thumbnail && (
                        <p id="thumbnail-field-error" className="mt-1 text-xs text-red-600">
                            {projectErrors.thumbnail}
                        </p>
                    )}
                </div>

                <TagEditor
                    tags={project.tagList}
                    onAdd={(tag) => setProject(prev => ({
                        ...prev,
                        tagList: [...(prev.tagList || []), tag.trim()],
                    }))}
                    onRemove={(tag) => setProject(prev => ({
                        ...prev,
                        tagList: (prev.tagList || []).filter(t => t !== tag),
                    }))}
                />
                {projectErrors.tagList && (
                    <p className="mt-1 text-xs text-red-600">{projectErrors.tagList}</p>
                )}
            </div>
        );
    }

    if (step === 2) {
        const END_MIN_OFFSET = P.MIN_DAYS - 1;
        const END_MAX_OFFSET = P.MAX_DAYS - 1;

        const isEditMode = !!project.projectId && Number(project.projectId) > 0;

        const strip = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const today = strip(new Date());

        // 포함 일수 계산
        const daysInclusive = (s?: Date | null, e?: Date | null) => {
            if (!s || !e) return null;
            const start = strip(s);
            const end = strip(e);
            return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        };

        const duration = daysInclusive(project.startDate, project.endDate);
        const isDurationInvalid = duration !== null && (duration < P.MIN_DAYS || duration > P.MAX_DAYS);

        const minStartLeadDate = new Date(today);
        minStartLeadDate.setDate(minStartLeadDate.getDate() + P.MIN_START_LEAD_DAYS);
        const minStartLeadStr = formatDate(minStartLeadDate);

        const startDateStripped = project.startDate ? strip(project.startDate) : undefined;
        const isStartPast = !!startDateStripped && startDateStripped < today;

        const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            if (!raw) {
                setProject(prev => ({ ...prev, startDate: null, endDate: null }));
                return;
            }
            let picked = parseLocalDate(raw);

            if (!isEditMode && picked < today) picked = new Date(minStartLeadDate);

            const minEnd = addDays(picked, END_MIN_OFFSET);
            const maxEnd = addDays(picked, END_MAX_OFFSET);

            let nextEnd = project.endDate ?? minEnd;
            if (nextEnd < minEnd) nextEnd = minEnd;
            if (nextEnd > maxEnd) nextEnd = maxEnd;

            setProject(prev => ({ ...prev, startDate: picked, endDate: nextEnd }));
            clearProjectError?.("startDate");
            clearProjectError?.("endDate");
        }

        const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const pick = parseLocalDate(e.target.value);
            setProject(prev => ({ ...prev, endDate: pick }));
            clearProjectError?.("endDate");
        };

        return (
            <div className="space-y-6">
                <RequiredLegend />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="startDate">펀딩 시작일 *</Label>
                        <Input
                            id="startDate"
                            type="date"
                            min={isEditMode ? undefined : minStartLeadStr}
                            value={project.startDate ? formatDate(project.startDate) : ""}
                            onChange={handleStartDateChange}
                        />
                        {projectErrors.startDate && <p className="mt-1 text-xs text-red-600">{projectErrors.startDate}</p>}

                        {!projectErrors.startDate && isEditMode && isStartPast && (
                            <p className="mt-1 text-xs text-red-600">
                                시작일이 이미 지났습니다. 일정을 조정하세요.
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="endDate">펀딩 종료일 *</Label>
                        <Input
                            id="endDate"
                            type="date"
                            min={project.startDate ? formatDate(addDays(project.startDate, END_MIN_OFFSET)) : undefined}
                            max={project.startDate ? formatDate(addDays(project.startDate, END_MAX_OFFSET)) : undefined}
                            value={project.endDate ? formatDate(project.endDate) : ""}
                            onChange={handleEndDateChange}
                        />
                        {projectErrors.endDate && <p className="mt-1 text-xs text-red-600">{projectErrors.endDate}</p>}
                    </div>
                </div>

                {/* 기간 가이드 + 현재 선택한 기간 */}
                <div className="mt-1 space-y-1">
                    <p className={`text-xs ${isDurationInvalid ? "text-red-600" : "text-muted-foreground"}`}>
                        시작일은 오늘 기준 {P.MIN_START_LEAD_DAYS}일 이후로 설정하고,
                        전체 기간은 {P.MIN_DAYS}–{P.MAX_DAYS}일 범위에서 선택해주세요.
                        {duration !== null && <> <span className="ml-2 font-medium text-green-600">(현재 {duration}일)</span></>}
                    </p>
                </div>

                <div>
                    <Label htmlFor="goalAmount">목표 금액 *</Label>
                    <Input
                        placeholder="목표 금액을 입력하세요"
                        value={project.goalAmount}
                        onChange={(e) => {
                            setProject(prev => ({ ...prev, goalAmount: Number(e.target.value.replace(/[^0-9]/g, "")) }));
                            clearProjectError?.("goalAmount");
                        }}
                    />
                    <p className="mt-2 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">
                        {project.goalAmount ? `${formatPrice(project.goalAmount)}원` : ""}
                    </p>
                    <p className={`mt-1 text-xs ${projectErrors.goalAmount ? "text-red-600" : "text-muted-foreground"}`}>
                        최소 {toKRWCompact(P.MIN_GOAL_AMOUNT)}원 · 최대 {toKRWCompact(P.MAX_GOAL_AMOUNT)}원
                    </p>
                </div>
                <FeesCard goalAmount={project.goalAmount} />
            </div>

        );
    }

    if (step === 3) {
        return (
            <div className="space-y-6">
                <RequiredLegend />
                <div>
                    <Label htmlFor="projectContent">프로젝트 설명 *</Label>
                    <Textarea
                        placeholder={`프로젝트 스토리, 제작 배경, 리워드 구성/혜택, 제작·배송 일정, 유의사항을 적어주세요.\n예) 왜 시작했는지 / 사용 계획 / 일정 / 환불·AS 안내`}
                        rows={12}
                        value={project.content ?? ""}
                        maxLength={P.MAX_CONTENT_LEN}
                        onChange={e => setProject(p => ({ ...p, content: e.target.value.slice(0, P.MAX_CONTENT_LEN) }))}
                        className="mt-1 min-h-[100px] placeholder:text-xs placeholder:leading-5 placeholder:text-muted-foreground/80"
                    />
                    {projectErrors.content && <p className="mt-1 text-xs text-red-600">{projectErrors.content}</p>}
                    <span className={"text-xs text-muted-foreground"}>
                        {project.content.length} / {P.MAX_CONTENT_LEN}자
                    </span>
                </div>

                <div className="space-y-4">
                    <Label>프로젝트 소개 (이미지 + 텍스트) *</Label>
                    <p className="text-xs text-muted-foreground">
                        쇼핑몰 상세 페이지처럼 이미지를 추가하고 소개글을 작성하세요.
                    </p>
                    <ProjectDetailEditor
                        initialData={project.contentBlocks}
                        uploadUrl={"http://localhost:9099/api/v1/attach/image"}
                        onChange={(data) => {
                            setProject((prev: any) => ({ ...prev, contentBlocks: data }));
                            clearProjectError?.("contentBlocks");
                        }}
                    />
                    {projectErrors.contentBlocks && <p className="mt-1 text-xs text-red-600">{projectErrors.contentBlocks}</p>}
                </div>
            </div>
        );
    }

    if (step === 4) {
        return (
            <div className="space-y-6">
                <RequiredLegend />
                <div>
                    <h3 className="text-lg font-semibold mb-4">리워드 추가</h3>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="price">리워드 가격 *</Label>
                                    <Input
                                        value={newReward.price ?? ""}
                                        onChange={(e) => {
                                            setNewReward({ ...newReward, price: Number(e.target.value.replace(/[^0-9]/g, "")) })
                                            clearRewardError?.("price");
                                        }}
                                    />

                                    {newReward.price ? (
                                        <p className="mt-1 text-xs text-muted-foreground">{formatPrice(newReward.price)}원</p>
                                    ) : (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            최소 {toKRWCompact(R.MIN_REWARD_PRICE)} 원 · 최대 {toKRWCompact(R.MAX_REWARD_PRICE)} 원
                                        </p>
                                    )}
                                    {rewardErrors.price && <p className="mt-1 text-xs text-red-500">{rewardErrors.price}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="rewardQuantity">제한 수량 (선택)</Label>
                                    <Input
                                        id="rewardQuantity"
                                        placeholder="비워두면 무제한"
                                        value={newReward.rewardCnt ?? ""}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/[^0-9]/g, "");
                                            setNewReward({ ...newReward, rewardCnt: raw === "" ? null : Number(raw) });
                                            clearRewardError?.("rewardCnt");
                                        }}
                                    />
                                    {rewardErrors.rewardCnt && <p className="mt-1 text-xs text-red-500">{rewardErrors.rewardCnt}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="rewardTitle">리워드명 *</Label>
                                <Input
                                    id="rewardTitle"
                                    placeholder="얼리버드 패키지"
                                    value={newReward.rewardName}
                                    onChange={(e) => {
                                        setNewReward({ ...newReward, rewardName: e.target.value })
                                        clearRewardError?.("rewardName");
                                    }}
                                />
                                {rewardErrors.rewardName && <p className="mt-1 text-xs text-red-500">{rewardErrors.rewardName}</p>}
                            </div>

                            <div>
                                <Label htmlFor="rewardDescription">리워드 설명 *</Label>
                                <Textarea
                                    id="rewardDescription"
                                    rows={3}
                                    placeholder="리워드 구성품과 혜택을 설명하세요"
                                    value={newReward.rewardContent}
                                    onChange={(e) => {
                                        setNewReward({ ...newReward, rewardContent: e.target.value })
                                        clearRewardError?.("rewardContent");
                                    }}
                                />
                                {rewardErrors.rewardContent && <p className="mt-1 text-xs text-red-500">{rewardErrors.rewardContent}</p>}
                            </div>

                            <div>
                                <Label htmlFor="deliveryDate">{newReward.isPosting === "Y" ? "배송 예정일 *" : "제공 예정일 *"}</Label>
                                <Input
                                    type="date"
                                    value={formatDate(newReward.deliveryDate)}
                                    onChange={(e) => {
                                        setNewReward({ ...newReward, deliveryDate: parseLocalDate(e.target.value) });
                                        clearRewardError?.("deliveryDate");
                                    }}
                                    className={((newReward as any)._submittedOnce && rewardErrors.deliveryDate)
                                        ? "border-red-500 focus-visible:ring-red-500"
                                        : undefined}
                                />
                                {((newReward as any)._submittedOnce && rewardErrors.deliveryDate) ? (
                                    <p className="mt-1 text-xs text-red-500">{rewardErrors.deliveryDate}</p>
                                ) : (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        펀딩 종료일 다음날(
                                        {project.endDate ? formatDate(addDays(project.endDate, 1)) : "종료일 미설정"}
                                        ) 이후로 설정하세요.
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="isPosting">배송 필요 여부 *</Label>
                                <Select
                                    value={newReward.isPosting}
                                    onValueChange={(v) => setNewReward({ ...newReward, isPosting: v as "Y" | "N" })}
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
                                onClick={() => {
                                    setNewReward(prev => ({ ...prev, _submittedOnce: true } as any));
                                    addReward();
                                }}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                리워드 추가
                            </Button>
                        </CardContent>
                    </Card>
                    {rewardListError && <p className="mt-3 text-xs text-red-600">{rewardListError}</p>}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">추가된 리워드</h3>
                    <div className="space-y-2">
                        {rewardList.map((r) => (
                            <Card key={r.tempId}>
                                <CardContent>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="text-lg font-semibold">{formatPrice(r.price)}원</span>

                                                {r.rewardCnt === null
                                                    ? <Badge variant="secondary">무제한</Badge>
                                                    : <Badge variant="secondary">한정 {r.rewardCnt}개</Badge>}

                                                {r.isPosting === "Y" ? <Badge>배송 필요</Badge> : <Badge variant="outline">배송 불필요</Badge>}
                                            </div>

                                            <h4 className="font-medium mb-1">{r.rewardName}</h4>
                                            <p className="text-sm text-gray-600">{r.rewardContent}</p>
                                            <div className="mt-2 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    {formatDate(r.deliveryDate)}
                                                    {r.isPosting === "Y" && <Truck className="h-4 w-4" />}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => removeReward(r.tempId)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {rewardList.length === 0 && (
                            <p className="text-center text-gray-500 py-8">아직 추가된 리워드가 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (step === 5) {
        const hasBizNum = !!String(project.businessNum ?? "").trim();
        const hasBizDoc = (project.businessDoc instanceof File) || !!project.businessDocPreviewUrl;

        return (
            <div className="space-y-6">
                <RequiredLegend />
                <Card>
                    <CardHeader>
                        <CardTitle>창작자 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>창작자명</Label>
                            <Input value={project.creatorName ?? ''} readOnly disabled />
                        </div>
                        <div>
                            <Label>사업자등록번호</Label>
                            <Input value={project.businessNum ?? ''} readOnly disabled />
                        </div>
                        <div>
                            <BusinessDocUploader
                                file={project.businessDoc ?? null}
                                previewUrl={project.businessDocPreviewUrl}
                                onSelect={(f) => {
                                    setProject(prev => ({ ...prev, businessDoc: f, businessDocPreviewUrl: f ? undefined : prev.businessDocPreviewUrl, }));
                                    clearProjectError?.("businessDoc");
                                }}
                                onCleared={() =>
                                    setProject(prev => ({ ...prev, businessDoc: null, businessDocPreviewUrl: undefined, }))}
                            />
                            {projectErrors.businessDoc && (
                                <p className="mt-1 text-xs text-red-600" role="alert">
                                    {projectErrors.businessDoc}
                                </p>
                            )}

                            {!projectErrors.businessDoc && hasBizNum && !hasBizDoc && (
                                <p className="mt-1 text-xs text-red-600" role="alert">
                                    사업자등록증 사본을 첨부해주세요.
                                </p>
                            )}

                            {!hasBizNum && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    일반 창작자는 사업자등록증 첨부가 필요 없습니다.
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>이메일</Label>
                            <Input value={project.email ?? ''} readOnly disabled />
                        </div>
                        <div>
                            <Label>전화번호</Label>
                            <Input value={project.phone ?? ''} readOnly disabled />
                        </div>

                        <div className="md:col-span-2">
                            <Badge variant="secondary">변경사항은 &quot;창작자 정보 수정&quot; 화면에서 진행해주세요.</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === 6) {
        return (
            <div className="space-y-6">
                <RequiredLegend />
                <Card>
                    <CardHeader><CardTitle>프로젝트 요약</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-gray-700">카테고리</h4>
                                <p>
                                    {(() => {
                                        const sub = (subcategories as Subcategory[]).find(sc => sc.subctgrId === project.subctgrId);
                                        if (!sub) return "-";
                                        const ctgName = (categories as Category[]).find(c => c.ctgrId === sub.ctgrId)?.ctgrName ?? "기타";
                                        return `${ctgName} > ${sub.subctgrName}`;
                                    })()}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">목표 금액</h4>
                                <p>{project.goalAmount ? `${formatPrice(project.goalAmount)}원` : "-"}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">펀딩 기간</h4>
                                <p>
                                    {project.startDate && project.endDate
                                        ? `${formatDate(project.startDate)} ~ ${formatDate(project.endDate)}`
                                        : "-"}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">리워드 개수</h4>
                                <p>{rewardList.length}개</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700">프로젝트 제목</h4>
                            <p>{project.title || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700">창작자</h4>
                            <p>{project.creatorName || "-"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>심사 안내</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-xs">
                            <p>• 프로젝트 심사는 영업일 기준 3-5일 소요됩니다.</p>
                            <p>• 심사 결과는 등록된 이메일로 안내드립니다.</p>
                            <p>• 심사 승인 후 펀딩 시작일에 자동으로 공개됩니다.</p>
                            <p>• 심사 반려되었을 경우에는 새로운 프로젝트를 생성하셔야 합니다.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="agree"
                        checked={agree}
                        onCheckedChange={(v) => { const val = Boolean(v); setAgree?.(val); }}
                        aria-invalid={!!agreeError}
                    />
                    <label htmlFor="agree" className="text-xs">프로젝트 등록 약관 및 정책에 동의합니다. *</label>
                </div>
                {agreeError && (<p className="text-xs text-red-500 mt-1">{agreeError}</p>)}
            </div>
        );
    }
}

function FeesCard({ goalAmount }: { goalAmount: number }) {
    const collectedAmount = goalAmount ? Math.round(goalAmount * 0.92) : 0;

    return (
        <Card>
            <CardHeader><CardTitle className="text-lg">펀딩 수수료 안내</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>플랫폼 수수료</span><span>5%</span></div>
                    <div className="flex justify-between"><span>결제 수수료</span><span>3%</span></div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>총 수수료</span><span>8%</span>
                    </div>
                    {goalAmount > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p>목표금액 기준 예상 정산액: {new Intl.NumberFormat("ko-KR").format(collectedAmount)}원</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function RequiredLegend() {
    return (
        <p className="text-sm text-muted-foreground -mt-1 mb-2">
            <span className="text-red-600 font-semibold" aria-hidden="true">*</span>{" "}
            표시는 필수 입력 항목입니다.
        </p>
    );
}

function LabelRequired({
    children,
    ...rest
}: React.ComponentProps<typeof Label>) {
    return (
        <Label {...rest}>
            {children}
            <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>
            <span className="sr-only"> (필수)</span>
        </Label>
    );
}