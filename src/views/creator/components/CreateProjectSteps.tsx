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
import type { FieldErrors } from "@/types/reward-validator";
import { formatDate } from "@/utils/utils";
import { Plus, Trash, Truck, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { ThumbnailUploader } from "./ThumbnailUploader";
import clsx from "clsx";

const numberKR = (n?: number | null) => new Intl.NumberFormat("ko-KR").format(n || 0);

const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

export function CreateProjectSteps(props: {
    step: number;
    project: ProjectCreateRequestDto;
    setProject: React.Dispatch<React.SetStateAction<ProjectCreateRequestDto>>;
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
    rewardErrors?: FieldErrors;
    addDays: (date: Date, days: number) => Date;
}) {
    const {
        step, project, setProject, categories, subcategories, rewardList, newReward,
        setNewReward, addReward, removeReward, agree = false, setAgree, agreeError,
        rewardErrors = {}, addDays
    } = props;

    if (step === 1) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-x-2 gap-y-2">
                    <div className="min-w-0">
                        <Label htmlFor="category">카테고리 *</Label>
                        <Select
                            value={project.ctgrId ? String(project.ctgrId) : undefined}
                            onValueChange={(value) => setProject(prev => ({ ...prev, ctgrId: Number(value), subctgrId: 0 }))}
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
                    </div>

                    <div className="min-w-0">
                        <Label htmlFor="subcategory">세부카테고리 *</Label>
                        <Select
                            value={project.subctgrId ? String(project.subctgrId) : undefined}
                            onValueChange={(value) => setProject(prev => ({ ...prev, subctgrId: Number(value) }))}
                            disabled={!project.ctgrId}
                        >
                            <SelectTrigger id="subcategory" className="w-full">
                                <SelectValue placeholder="세부카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {subcategories.map(sc => (
                                    <SelectItem key={sc.subctgrId} value={String(sc.subctgrId)}>{sc.subctgrName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <Label htmlFor="title">프로젝트 제목 *</Label>
                    <Input
                        id="title"
                        placeholder="프로젝트 제목을 입력하세요"
                        value={project.title}
                        onChange={(e) => setProject(prev => ({ ...prev, title: e.target.value }))}
                        maxLength={50}
                    />
                    <p className="text-sm text-gray-500 mt-1">{project.title.length}/50자</p>
                </div>

                <ThumbnailUploader
                    onCleared={() => setProject(p => ({ ...p, thumbnail: null, thumbnailUrl: "" }))}
                />

                <TagEditor
                    tags={project.tagList}
                    onAdd={(tag) => setProject(prev => {
                        const trimmed = tag.trim();
                        if (!trimmed) return prev;

                        const exists = (prev.tagList || []).some(
                            (tag) => normalizeName(tag) === normalizeName(trimmed)
                        );
                        if (exists) return prev;

                        const next = [...(prev.tagList || []), trimmed];
                        if (next.length > 10) return prev;
                        return { ...prev, tagList: next };
                    })}
                    onRemove={(tag) => setProject(prev => ({
                        ...prev,
                        tagList: (prev.tagList || []).filter(
                            (t) => normalizeName(t) !== normalizeName(tag)
                        )
                    }))}
                />
            </div>
        );
    }

    if (step === 2) {
        const MAX_MB = 4 * 1024 * 1024 * 1024;;
        const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

        const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const next = e.target.value;
            setProject(prev => ({ ...prev, content: next }));
        };

        const handleAddFiles = (incoming: FileList | File[]) => {
            const arr = Array.from(incoming);

            const filtered = arr.filter(f =>
                ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_MB
            );

            setProject(prev => {
                const before = prev.files ?? [];
                const deduped = [...before];

                filtered.forEach(f => {
                    if (!deduped.some(df =>
                        df.name === f.name &&
                        df.size === f.size &&
                        df.lastModified === f.lastModified
                    )) {
                        deduped.push(f);
                    }
                });

                return { ...prev, files: deduped };
            });
        };

        const handleRemoveFile = (idx: number) => {
            setProject(prev => {
                const next = (prev.files ?? []).filter((_, i) => i !== idx);
                return { ...prev, files: next };
            });
        };

        return (
            <div className="space-y-6">
                <div>
                    <Label htmlFor="projectContent">프로젝트 소개 *</Label>
                    <Textarea
                        id="projectContent"
                        placeholder={`프로젝트의 스토리, 제작 배경, 리워드 상세 설명, 일정 등을 충분히 써주세요.\n(예: 왜 이 프로젝트를 시작했는지, 목표 금액의 사용 계획, 제작/배송 일정, 유의사항 등)`}
                        rows={12}
                        value={project.content ?? ""}
                        onChange={handleContentChange}
                        className="mt-1 min-h-[100px]"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        • 가독성을 위해 단락을 나누고, 핵심 정보를 굵게 처리하거나 리스트로 정리해 주세요.
                    </p>
                </div>

                <div>
                    <FileAttach
                        files={project.files ?? []}
                        onAddFiles={handleAddFiles}
                        onRemoveFile={handleRemoveFile}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        • 본문 이미지는 여기 첨부해 주세요.
                    </p>
                </div>
            </div>
        );
    }


    if (step === 3) {
        const MIN_DAYS = 7;
        const MAX_DAYS = 60;
        const END_MIN_OFFSET = MIN_DAYS - 1;
        const END_MAX_OFFSET = MAX_DAYS - 1;

        const parseLocalDate = (s: string) => {
            const [y, m, d] = s.split("-").map(Number);
            return new Date(y, (m ?? 1) - 1, d ?? 1);
        };

        const clampDate = (d: Date, min: Date, max: Date) => d < min ? min : d > max ? max : d;

        const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const start = parseLocalDate(e.target.value);
            const end = addDays(start, END_MIN_OFFSET);
            setProject(prev => ({ ...prev, startDate: start, endDate: end }));
        }

        const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const pick = parseLocalDate(e.target.value);
            if (!project.startDate) {
                setProject(prev => ({ ...prev, endDate: pick }));
                return;
            }
            const minEnd = addDays(project.startDate, END_MIN_OFFSET);
            const maxEnd = addDays(project.startDate, END_MAX_OFFSET);
            setProject(prev => ({ ...prev, endDate: clampDate(pick, minEnd, maxEnd) }));
        };

        return (
            <div className="space-y-6">
                <div>
                    <Label htmlFor="goalAmount">목표 금액 *</Label>
                    <Input
                        id="goalAmount"
                        placeholder="목표 금액을 입력하세요"
                        value={project.goalAmount}
                        onChange={(e) => {
                            const numeric = e.target.value.replace(/[^0-9]/g, "");
                            setProject(prev => ({ ...prev, goalAmount: Number(numeric) }));
                        }}
                    />
                    <p className="mt-2 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">
                        {project.goalAmount ? `${numberKR(project.goalAmount)}원` : ""}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="startDate">펀딩 시작일 *</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={formatDate(project.startDate)}
                            onChange={handleStartDateChange}
                        />
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
                    </div>
                </div>
                <FeesCard goalAmount={project.goalAmount} />
            </div>
        );
    }

    if (step === 4) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">리워드 추가</h3>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="price">후원 금액 *</Label>
                                    <Input
                                        id="price"
                                        value={newReward.price ?? ""}
                                        onChange={(e) => setNewReward({ ...newReward, price: Number(e.target.value.replace(/[^0-9]/g, "")) })}
                                    />
                                    {newReward.price ? (
                                        <p className="mt-1 text-xs text-muted-foreground">{numberKR(newReward.price)}원</p>
                                    ) : null}
                                    {rewardErrors.price && <p className="mt-1 text-xs text-red-500">{rewardErrors.price}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="rewardQuantity">제한 수량 (선택)</Label>
                                    <Input
                                        id="rewardQuantity"
                                        placeholder="비워두면 무제한"
                                        value={newReward.rewardCnt ?? ""}
                                        onChange={(e) => setNewReward({ ...newReward, rewardCnt: Number(e.target.value.replace(/[^0-9]/g, "")) })}
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
                                    onChange={(e) => setNewReward({ ...newReward, rewardName: e.target.value })}
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
                                    onChange={(e) => setNewReward({ ...newReward, rewardContent: e.target.value })}
                                />
                                {rewardErrors.rewardContent && <p className="mt-1 text-xs text-red-500">{rewardErrors.rewardContent}</p>}
                            </div>

                            <div>
                                <Label htmlFor="deliveryDate">{newReward.isPosting === "Y" ? "배송 예정일 *" : "제공 예정일 *"}</Label>
                                <Input
                                    id="deliveryDate"
                                    type="date"
                                    value={formatDate(newReward.deliveryDate)}
                                    onChange={(e) => setNewReward({ ...newReward, deliveryDate: new Date(e.target.value) })}
                                />
                                {rewardErrors.deliveryDate && <p className="mt-1 text-xs text-red-500">{rewardErrors.deliveryDate}</p>}
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

                            <Button onClick={addReward} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />리워드 추가
                            </Button>
                        </CardContent>
                    </Card>
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
                                                <span className="text-lg font-semibold">{numberKR(r.price)}원</span>

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
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>창작자 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="creatorName">창작자명 *</Label>
                            <Input
                                id="creatorName"
                                placeholder="개인명 또는 단체명"
                                value={project.creatorName}
                                onChange={(e) => setProject(prev => ({ ...prev, creatorName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="businessNum">사업자등록번호 *</Label>
                            <Input
                                id="businessNum"
                                placeholder="000-00-00000"
                                value={project.businessNum}
                                onChange={(e) => setProject(prev => ({ ...prev, businessNum: e.target.value }))}
                                inputMode="numeric"
                            />
                        </div>
                        <div>
                            <BusinessDocAttach
                                label="사업자등록증 첨부파일 *"
                                file={project.businessDoc ?? null}
                                onSelect={(file) => setProject(prev => ({ ...prev, businessDoc: file }))}
                                onClear={() => setProject(prev => ({ ...prev, businessDoc: null }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">문의 이메일 *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@example.com"
                                value={project.email}
                                onChange={(e) => setProject(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">문의 전화번호 *</Label>
                            <Input
                                id="phone"
                                placeholder="010-1234-5678"
                                value={project.phone}
                                onChange={(e) => setProject(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === 6) {
        return (
            <div className="space-y-6">
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
                                <p>{project.goalAmount ? `${numberKR(project.goalAmount)}원` : "-"}</p>
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
                        <div className="space-y-2 text-sm">
                            <p>• 프로젝트 심사는 영업일 기준 3-5일 소요됩니다.</p>
                            <p>• 심사 결과는 등록된 이메일로 안내드립니다.</p>
                            <p>• 심사 승인 후 펀딩 시작일에 자동으로 공개됩니다.</p>
                            <p>• 심사 반려 시 수정 후 재제출이 가능합니다.</p>
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
                    <label htmlFor="agree" className="text-sm">프로젝트 등록 약관 및 정책에 동의합니다. *</label>
                </div>
                {agreeError && (<p className="text-xs text-red-500 mt-1">{agreeError}</p>)}
            </div>
        );
    }
}

function TagEditor({
    tags, onAdd, onRemove
}: { tags: string[]; onAdd: (tag: string) => void; onRemove: (tag: string) => void }) {
    const [value, setValue] = useState("");
    const add = () => { onAdd(value); setValue(""); };

    return (
        <div>
            <Label>검색 태그 (최대 10개)</Label>
            <div className="flex space-x-2 mb-2 mt-1">
                <Input
                    placeholder="태그 입력"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                />
                <Button type="button" variant="outline" onClick={add}>추가</Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                        {tag}
                        <X className="h-3 w-3 ml-1" onClick={() => onRemove(tag)} />
                    </Badge>
                ))}
            </div>
        </div>
    );
}

function FeesCard({ goalAmount }: { goalAmount: number }) {
    const earned = goalAmount ? Math.round(goalAmount * 0.92) : 0;

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
                            <p>목표 달성 시 예상 수익: {new Intl.NumberFormat("ko-KR").format(earned)}원</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function FileAttach({
    label = "파일 첨부",
    files,
    onAddFiles,
    onRemoveFile,
    disabled = false,
}: {
    label?: string;
    files: File[];
    onAddFiles: (files: FileList | File[]) => void;
    onRemoveFile: (index: number) => void;
    disabled?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const openPicker = () => !disabled && inputRef.current?.click();

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) onAddFiles(e.target.files);
        if (inputRef.current) inputRef.current.value = "";
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onAddFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    return (
        <div>
            <Label className="mb-2 block">{label}</Label>

            <div
                className={clsx(
                    "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
                    dragOver ? "border-blue-400 bg-blue-50/40" : "border-gray-300",
                    disabled && "opacity-60 cursor-not-allowed"
                )}
                role="button"
                onClick={openPicker}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
            >
                <div className="py-6">
                    <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-600">
                        클릭하거나 드래그하여 파일을 업로드
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            openPicker();
                        }}
                        disabled={disabled}
                    >
                        파일 선택
                    </Button>
                    <p className="mt-2 text-xs text-gray-400">
                        이미지(JPG/PNG/WEBP/GIF)
                    </p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={handleInput}
                />
            </div>

            {files.length > 0 && (
                <div className="mt-4 space-y-3">
                    <div className="text-sm font-medium">
                        첨부된 파일 ({files.length})
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {files.map((f, idx) => {
                            const isImage = f.type.startsWith("image/");
                            return (
                                <Card key={`${f.name}-${f.lastModified}`} className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="relative">
                                            {isImage ? (
                                                <img
                                                    src={URL.createObjectURL(f)}
                                                    alt={f.name}
                                                    className="w-full h-32 object-cover"
                                                    onLoad={(e) =>
                                                        URL.revokeObjectURL(
                                                            (e.target as HTMLImageElement).src
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <div className="w-full h-32 flex items-center justify-center text-xs text-muted-foreground">
                                                    PDF 문서
                                                </div>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1 right-1 h-7 w-7 rounded-full bg-white/80 hover:bg-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemoveFile(idx);
                                                }}
                                                aria-label={`${f.name} 제거`}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="p-2 text-xs truncate">{f.name}</div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function BusinessDocAttach({
    label = "사업자등록증 첨부파일",
    file,
    onSelect,
    onClear,
    disabled = false,
}: {
    label?: string;
    file: File | null;
    onSelect: (file: File | null) => void;
    onClear: () => void;
    disabled?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const openPicker = () => !disabled && inputRef.current?.click();

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        onSelect(f);
        if (inputRef.current) inputRef.current.value = "";
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0] ?? null;
        if (f) onSelect(f);
        e.dataTransfer.clearData();
    };

    const isImage = file ? file.type.startsWith("image/") : false;

    return (
        <div>
            <Label className="mb-2 block">{label}</Label>

            <div
                className={clsx(
                    "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
                    dragOver ? "border-blue-400 bg-blue-50/40" : "border-gray-300",
                    disabled && "opacity-60 cursor-not-allowed"
                )}
                role="button"
                onClick={openPicker}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
            >
                {file ? (
                    <div className="relative">
                        <div className="mx-auto max-w-md">
                            {isImage ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="mx-auto max-h-80 w-auto rounded-md object-contain"
                                    onLoad={(e) =>
                                        URL.revokeObjectURL((e.target as HTMLImageElement).src)
                                    }
                                />
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center rounded-md bg-muted/40">
                                    <div className="text-sm text-muted-foreground">PDF 문서</div>
                                    <div className="mt-1 text-xs text-muted-foreground truncate max-w-[80%]">
                                        {file.name}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openPicker();
                                }}
                                disabled={disabled}
                            >
                                파일 교체
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClear();
                                }}
                                disabled={disabled}
                            >
                                삭제
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-6">
                        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-600">
                            클릭하거나 드래그하여 파일을 업로드
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                openPicker();
                            }}
                            disabled={disabled}
                        >
                            파일 선택
                        </Button>
                        <p className="mt-2 text-xs text-gray-400">
                            PDF 또는 이미지(JPG/PNG) 지원
                        </p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={handleInput}
                />
            </div>

            {file && isImage && (
                <div className="mt-2 text-xs text-gray-500 truncate">{file.name}</div>
            )}
        </div>
    );
}