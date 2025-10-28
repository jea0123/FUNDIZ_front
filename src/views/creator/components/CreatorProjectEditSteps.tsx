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
import { AlertCircle, CalendarDays, Info, PackageSearch, Plus, TagIcon, Truck, Wallet, X } from "lucide-react";
import { BusinessDocUploader, ThumbnailUploader } from "./CreatorUploaders";
import ProjectDetailEditor from "./ProjectDetailEditor";
import { PROJECT_RULES, TagEditor, type ProjectFieldErrors } from "../pages/CreatorProjectEditPage";
import { REWARD_RULES, type RewardFieldErrors } from "@/types/reward-validator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

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
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="stack-5 md:stack-6"
                >
                    <RequiredLegend />
                    <SectionTitle
                        icon={TagIcon}
                        title="기본 정보"
                        desc="카테고리와 제목, 대표 이미지를 입력하면 탐색/검색 노출 품질이 올라가요."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="min-w-0">
                            <LabelRequired htmlFor="category">카테고리</LabelRequired>
                            <Select
                                value={project.ctgrId ? String(project.ctgrId) : undefined}
                                onValueChange={(value) => {
                                    setProject(prev => ({ ...prev, ctgrId: Number(value), subctgrId: 0 }))
                                    clearProjectError?.("ctgrId");
                                }}
                            >
                                <SelectTrigger id="category" className="w-full control-tone">
                                    <SelectValue placeholder="카테고리 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c =>
                                        <SelectItem key={c.ctgrId} value={String(c.ctgrId)}>{c.ctgrName}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {projectErrors?.ctgrId && <FieldError>{projectErrors.ctgrId}</FieldError>}
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
                            {projectErrors?.subctgrId && <FieldError>{projectErrors.subctgrId}</FieldError>}
                        </div>
                    </div>

                    <div>
                        <LabelRequired htmlFor="title">프로젝트 제목</LabelRequired>
                        <Input
                            id="title"
                            className="control-tone"
                            placeholder={`제목은 ${P.MIN_TITLE_LEN}~ ${P.MAX_TITLE_LEN}자 이내로 입력해주세요.`}
                            value={project.title}
                            onChange={(e) => {
                                setProject(prev => ({ ...prev, title: e.target.value }));
                                clearProjectError?.("title");
                            }}
                            maxLength={50}
                            required
                        />
                        {projectErrors.title && <FieldError>{projectErrors.title}</FieldError>}
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
                        {projectErrors.thumbnail && <FieldError>{projectErrors.thumbnail}</FieldError>}
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
                    {projectErrors.tagList && <FieldError>{projectErrors.tagList}</FieldError>}
                </motion.div>
            </AnimatePresence>
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
            <div className="stack-5 md:stack-6">
                <RequiredLegend />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-3 md:gap-4">
                    <div>
                        <Label htmlFor="startDate" className="label-tone mb-1.5 block">펀딩 시작일 *</Label>
                        <Input
                            id="startDate"
                            type="date"
                            min={isEditMode ? undefined : minStartLeadStr}
                            value={project.startDate ? formatDate(project.startDate) : ""}
                            onChange={handleStartDateChange}
                            className="control-tone"
                        />
                        {projectErrors.startDate && <p className="mt-1 text-xs text-red-600">{projectErrors.startDate}</p>}

                        {!projectErrors.startDate && isEditMode && isStartPast && (
                            <p className="mt-1 text-xs text-red-600">
                                시작일이 이미 지났습니다. 일정을 조정하세요.
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="endDate" className="label-tone mb-1.5 block">펀딩 종료일 *</Label>
                        <Input
                            id="endDate"
                            type="date"
                            min={project.startDate ? formatDate(addDays(project.startDate, END_MIN_OFFSET)) : undefined}
                            max={project.startDate ? formatDate(addDays(project.startDate, END_MAX_OFFSET)) : undefined}
                            value={project.endDate ? formatDate(project.endDate) : ""}
                            onChange={handleEndDateChange}
                            className="control-tone"
                        />
                        {projectErrors.endDate && <p className="mt-1 text-xs text-red-600">{projectErrors.endDate}</p>}
                    </div>
                </div>

                {/* 기간 가이드 + 현재 선택한 기간 */}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                        시작일은 오늘 기준 {P.MIN_START_LEAD_DAYS}일 이후, 전체 기간은 {P.MIN_DAYS}–{P.MAX_DAYS}일.
                    </span>
                    {duration !== null && (
                        <Pill intent={isDurationInvalid ? "bad" : "good"}>
                            현재 {duration}일
                        </Pill>
                    )}
                    <InfoTip tip="심사 승인 후 지정한 시작일에 자동 공개됩니다." />
                </div>

                <div>
                    <Label htmlFor="goalAmount" className="label-tone mb-1.5 block">목표 금액 *</Label>
                    <Input
                        placeholder="목표 금액을 입력하세요"
                        value={project.goalAmount}
                        onChange={(e) => {
                            setProject(prev => ({ ...prev, goalAmount: Number(e.target.value.replace(/[^0-9]/g, "")) }));
                            clearProjectError?.("goalAmount");
                        }}
                        className="control-tone"
                    />
                    <p className="mt-2 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">
                        {project.goalAmount ? `${formatPrice(project.goalAmount)}원` : ""}
                    </p>
                    <FieldHelp>
                        최소 {toKRWCompact(P.MIN_GOAL_AMOUNT)} · 최대 {toKRWCompact(P.MAX_GOAL_AMOUNT)}
                    </FieldHelp>
                    {projectErrors.goalAmount && <FieldError>{projectErrors.goalAmount}</FieldError>}
                </div>
                <FeesCard goalAmount={project.goalAmount} />
            </div>

        );
    }

    if (step === 3) {
        return (
            <div className="stack-5 md:stack-6">
                <RequiredLegend />
                <div>
                    <SectionTitle
                        icon={CalendarDays}
                        title="프로젝트 설명"
                        desc="스토리·제작 배경·혜택·일정·유의사항 등을 자세히 적어주세요."
                        className="mb-2 md:mb-5"
                    />
                    <Textarea
                        placeholder={`프로젝트 스토리, 제작 배경, 리워드 구성/혜택, 제작·배송 일정, 유의사항을 적어주세요.\n예) 왜 시작했는지 / 사용 계획 / 일정 / 환불·AS 안내`}
                        rows={12}
                        value={project.content ?? ""}
                        maxLength={P.MAX_CONTENT_LEN}
                        onChange={e => setProject(p => ({ ...p, content: e.target.value.slice(0, P.MAX_CONTENT_LEN) }))}
                        className="control-tone mt-1 min-h-[100px] placeholder:text-xs placeholder:leading-5 placeholder:text-muted-foreground/80"
                    />
                    {projectErrors.content && <FieldError>{projectErrors.content}</FieldError>}
                    <div className="mt-1 text-right">
                        <span className="type-body text-xs text-muted-foreground">
                            {project.content.length} / {P.MAX_CONTENT_LEN}자
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="label-tone !text-sm mb-2.5 block">프로젝트 소개 (이미지 + 텍스트) *</Label>
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
                    {projectErrors.contentBlocks && <FieldError>{projectErrors.contentBlocks}</FieldError>}
                </div>
            </div>
        );
    }

    if (step === 4) {
        return (
            <div className="stack-5 md:stack-6">
                <RequiredLegend />
                <div>
                    <h3 className="text-lg font-semibold mb-4">리워드 추가</h3>
                    <Card>
                        <CardContent className="p-4 md:p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-3 md:gap-4">
                                <div>
                                    <Label htmlFor="price" className="label-tone mb-1.5 block">리워드 가격 *</Label>
                                    <Input
                                        value={newReward.price ?? ""}
                                        onChange={(e) => {
                                            setNewReward({ ...newReward, price: Number(e.target.value.replace(/[^0-9]/g, "")) })
                                            clearRewardError?.("price");
                                        }}
                                        className="control-tone"
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
                                    <Label htmlFor="rewardQuantity" className="label-tone mb-1.5 block">제한 수량 (선택)</Label>
                                    <Input
                                        id="rewardQuantity"
                                        placeholder="비워두면 무제한"
                                        value={newReward.rewardCnt ?? ""}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/[^0-9]/g, "");
                                            setNewReward({ ...newReward, rewardCnt: raw === "" ? null : Number(raw) });
                                            clearRewardError?.("rewardCnt");
                                        }}
                                        className="control-tone"
                                    />
                                    {rewardErrors.rewardCnt && <p className="mt-1 text-xs text-red-500">{rewardErrors.rewardCnt}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="rewardTitle" className="label-tone mb-1.5 block">리워드명 *</Label>
                                <Input
                                    id="rewardTitle"
                                    placeholder="얼리버드 패키지"
                                    value={newReward.rewardName}
                                    onChange={(e) => {
                                        setNewReward({ ...newReward, rewardName: e.target.value })
                                        clearRewardError?.("rewardName");
                                    }}
                                    className="control-tone"
                                />
                                {rewardErrors.rewardName && <p className="mt-1 text-xs text-red-500">{rewardErrors.rewardName}</p>}
                            </div>

                            <div>
                                <Label htmlFor="rewardDescription" className="label-tone mb-1.5 block">리워드 설명 *</Label>
                                <Textarea
                                    id="rewardDescription"
                                    rows={3}
                                    placeholder="리워드 구성품과 혜택을 설명하세요"
                                    value={newReward.rewardContent}
                                    onChange={(e) => {
                                        setNewReward({ ...newReward, rewardContent: e.target.value })
                                        clearRewardError?.("rewardContent");
                                    }}
                                    className="control-tone"
                                />
                                {rewardErrors.rewardContent && <p className="mt-1 text-xs text-red-500">{rewardErrors.rewardContent}</p>}
                            </div>

                            <div>
                                <Label htmlFor="deliveryDate" className="label-tone mb-1.5 block">
                                    배송(제공) 예정일 *
                                </Label>
                                <Input
                                    type="date"
                                    value={formatDate(newReward.deliveryDate)}
                                    onChange={(e) => {
                                        setNewReward({ ...newReward, deliveryDate: parseLocalDate(e.target.value) });
                                        clearRewardError?.("deliveryDate");
                                    }}
                                    className={((newReward as any)._submittedOnce && rewardErrors.deliveryDate)
                                        ? "border-red-500 focus-visible:ring-red-500 control-tone"
                                        : undefined}
                                />
                                {((newReward as any)._submittedOnce && rewardErrors.deliveryDate)
                                    ? <FieldError>{rewardErrors.deliveryDate}</FieldError>
                                    : <FieldHelp>
                                        펀딩 종료일 다음날({project.endDate ? formatDate(addDays(project.endDate, 1)) : "종료일 미설정"}) 이후로 설정하세요.
                                    </FieldHelp>}
                            </div>

                            <div>
                                <Label htmlFor="isPosting" className="label-tone mb-1.5 block">배송 필요 여부 *</Label>
                                <Select
                                    value={newReward.isPosting}
                                    onValueChange={(v) => setNewReward({ ...newReward, isPosting: v as "Y" | "N" })}
                                >
                                    <SelectTrigger id="isPosting" className="w-full control-tone">
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
                            <Card key={r.tempId} className="rounded-2xl border border-muted/60">
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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                            onClick={() => removeReward(r.tempId)}
                                            aria-label="리워드 삭제"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {rewardList.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">
                                <PackageSearch className="h-6 w-6 mx-auto mb-2 opacity-60" />
                                아직 추가된 리워드가 없어요. 첫 리워드를 만들어볼까요?
                            </div>
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
            <div className="stack-5 md:stack-6">
                <RequiredLegend />
                <SectionTitle
                    icon={Wallet}
                    title="창작자 정보"
                    desc="정산 및 심사에 필요한 기본 정보를 확인하세요."
                />
                <Card>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="label-tone mb-1.5 block">창작자명</Label>
                            <Input value={project.creatorName ?? ''} disabled />
                        </div>
                        <div>
                            <Label className="label-tone mb-1.5 block">사업자등록번호</Label>
                            <Input value={project.businessNum ?? ''} disabled />
                        </div>
                        <div>
                            <BusinessDocUploader
                                file={project.businessDoc ?? null}
                                previewUrl={project.businessDocPreviewUrl}
                                onSelect={(f) => {
                                    setProject(prev => ({
                                        ...prev,
                                        businessDoc: f,
                                        businessDocPreviewUrl: f ? undefined : prev.businessDocPreviewUrl,
                                    }));
                                    clearProjectError?.("businessDoc");
                                }}
                                onCleared={() =>
                                    setProject(prev => ({
                                        ...prev,
                                        businessDoc: null,
                                        businessDocPreviewUrl: undefined,
                                    }))}
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
                            <Label className="label-tone mb-1.5 block">이메일</Label>
                            <Input value={project.email ?? ''} disabled />
                        </div>
                        <div>
                            <Label className="label-tone mb-1.5 block">전화번호</Label>
                            <Input value={project.phone ?? ''} disabled />
                        </div>

                        <Badge variant="secondary">변경사항은 &quot;창작자 정보 수정&quot; 화면에서 진행해주세요.</Badge>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === 6) {
        return (
            <div className="space-y-5 md:space-y-6">
                <RequiredLegend />
                <SectionTitle
                    icon={TagIcon}
                    title="최종 확인"
                    desc="요약 정보를 확인하고 약관에 동의해 제출하세요."
                />
                <Card>
                    <CardContent className="p-2 md:p-6 space-y-4">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div>
                                <dt className="text-xs md:text-sm text-muted-foreground">카테고리</dt>
                                <dd className="text-sm md:text-base font-medium text-foreground mt-0.5">
                                    {(() => {
                                        const sub = (subcategories as Subcategory[]).find(sc => sc.subctgrId === project.subctgrId);
                                        if (!sub) return "-";
                                        const ctgName = (categories as Category[]).find(c => c.ctgrId === sub.ctgrId)?.ctgrName ?? "기타";
                                        return `${ctgName} > ${sub.subctgrName}`;
                                    })()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs md:text-sm text-muted-foreground">목표 금액</dt>
                                <dd className="text-sm md:text-base font-medium text-foreground mt-0.5">
                                    {project.goalAmount ? `${formatPrice(project.goalAmount)}원` : "-"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs md:text-sm text-muted-foreground">펀딩 기간</dt>
                                <dd className="text-sm md:text-base font-medium text-foreground mt-0.5">
                                    {project.startDate && project.endDate
                                        ? `${formatDate(project.startDate)} ~ ${formatDate(project.endDate)}`
                                        : "-"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs md:text-sm text-muted-foreground">리워드 개수</dt>
                                <dd className="text-sm md:text-base font-medium text-foreground mt-0.5">
                                    {rewardList.length}개
                                </dd>
                            </div>
                        </dl>
                        <div className="pt-2">
                            <h4 className="text-xs md:text-sm text-muted-foreground">프로젝트 제목</h4>
                            <p className="text-sm md:text-base font-medium text-foreground mt-0.5">
                                {project.title || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs md:text-sm text-muted-foreground">창작자</h4>
                            <p className="text-sm md:text-base font-medium text-foreground mt-0.5">
                                {project.creatorName || "-"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>심사 안내</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p>• 프로젝트 심사는 영업일 기준 3-5일 소요됩니다.</p>
                            <p>• 심사 결과는 등록된 이메일로 안내드립니다.</p>
                            <p>• 심사 승인 후 펀딩 시작일에 자동으로 공개됩니다.</p>
                            <p>• 심사 반려되었을 경우에는 새로운 프로젝트를 생성하셔야 합니다.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="agree"
                        checked={agree}
                        onCheckedChange={(v) => { const val = Boolean(v); setAgree?.(val); }}
                        aria-invalid={!!agreeError}
                    />
                    <label htmlFor="agree" className="text-sm">
                        프로젝트 등록 약관 및 정책에 동의합니다. *
                    </label>
                </div>
                {agreeError && (<p className="text-xs text-red-500 mt-1">{agreeError}</p>)}
            </div>
        );
    }
}

function FeesCard({ goalAmount }: { goalAmount: number }) {
    const platformRate = 0.05;
    const paymentRate = 0.03;
    const totalRate = platformRate + paymentRate;

    const fees = Math.round((goalAmount || 0) * totalRate);
    const net = Math.max(0, (goalAmount || 0) - fees);
    const pct = goalAmount > 0 ? Math.min(100, Math.round((net / goalAmount) * 100)) : 0;

    return (
        <Card className="border border-muted/50 shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="type-title text-lg flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    펀딩 수수료 안내
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5 md:p-6">
                <div className="grid grid-cols-3 gap-3 text-sm type-body">
                    <div className="rounded-xl bg-slate-50 p-4">
                        <div className="text-xs text-muted-foreground">플랫폼 수수료</div>
                        <div className="font-semibold mt-0.5">{Math.round(platformRate * 100)}%</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <div className="text-xs text-muted-foreground">결제 수수료</div>
                        <div className="font-semibold mt-0.5">{Math.round(paymentRate * 100)}%</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <div className="text-xs text-muted-foreground">총 수수료</div>
                        <div className="font-semibold mt-0.5">{Math.round(totalRate * 100)}%</div>
                    </div>
                </div>

                {goalAmount > 0 && (
                    <div className="mt-1 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span>정산 예상액</span>
                            <span className="font-medium">{new Intl.NumberFormat("ko-KR").format(net)}원</span>
                        </div>
                        <Progress value={pct} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>목표금액 {new Intl.NumberFormat("ko-KR").format(goalAmount)}원 기준</span>
                            <span>수수료 {new Intl.NumberFormat("ko-KR").format(fees)}원</span>
                        </div>
                    </div>
                )}
                <FieldHelp>카드 수수료는 결제/취소율에 따라 변동될 수 있습니다.</FieldHelp>
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
    className,
    ...rest
}: React.ComponentProps<typeof Label>) {
    return (
        <Label {...rest} className={`label-tone mb-1.5 block ${className ?? ""}`}>
            {children}
            <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>
            <span className="sr-only"> (필수)</span>
        </Label>
    );
}

function SectionTitle({
    icon: Icon,
    title,
    desc,
    className,
}: { icon: React.ComponentType<any>, title: string, desc?: string, className?: string }) {
    return (
        <div className={`flex items-start gap-2.5 ${className ?? ""}`}>
            <div className="rounded-xl bg-primary/10 text-primary p-2.5">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h3 className="type-title text-lg font-semibold">{title}</h3>
                {desc && <p className="type-body text-sm text-muted-foreground mt-0.5">{desc}</p>}
            </div>
        </div>
    );
}

function FieldHelp({ children }: { children: React.ReactNode }) {
    return <p className="type-body mt-1.5 text-xs text-muted-foreground">{children}</p>;
}

function FieldError({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="type-body">{children}</span>
        </p>
    );
}

function InfoTip({ tip }: { tip: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button type="button" className="inline-flex items-center">
                    <Info className="h-4 w-4 text-muted-foreground" />
                </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[260px] leading-5">
                {tip}
            </TooltipContent>
        </Tooltip>
    );
}

function Pill({
    children,
    intent = "neutral",
}: { children: React.ReactNode, intent?: "neutral" | "good" | "bad" }) {
    const tone = intent === "good"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : intent === "bad"
            ? "bg-red-50 text-red-700 ring-red-200"
            : "bg-slate-50 text-slate-700 ring-slate-200";

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${tone}`}>
            {children}
        </span>
    );
}
