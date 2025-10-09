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
import { formatDate } from "@/utils/utils";
import { Plus, Trash, Truck, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

const formatCurrency = (amount: string) =>
    new Intl.NumberFormat("ko-KR").format(parseInt(amount || "0", 10) || 0);

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
}) {
    const {
        step, project, setProject, categories, subcategories, rewardList, newReward, setNewReward, addReward, removeReward, agree = false, setAgree, agreeError
    } = props;

    const businessDocRef = useRef<HTMLInputElement>(null);

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

                {/* TODO: 첨부파일 업로드 기능 추가 */}
                <div>
                    <Label>대표 이미지 *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
                        <Button variant="outline" size="sm">파일 선택</Button>
                        <p className="text-xs text-gray-400 mt-2">권장 크기: 1200x800px, 최대 4MB (JPG, PNG)</p>
                    </div>
                </div>

                {/* TODO: 프로젝트 내용 단락 추가 */}

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
                        {project.goalAmount ? `${formatCurrency(String(project.goalAmount))}원` : ""}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="startDate">펀딩 시작일 *</Label>
                        <Input
                            id="startDate" type="date"
                            value={formatDate(project.startDate)}
                            onChange={(e) => setProject(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="endDate">펀딩 종료일 *</Label>
                        <Input
                            id="endDate" type="date"
                            value={formatDate(project.endDate)}
                            onChange={(e) => setProject(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                        />
                    </div>
                </div>
                <FeesCard goalAmount={project.goalAmount} />
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">리워드 추가</h3>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="rewardAmount">후원 금액 *</Label>
                                    <Input
                                        id="rewardAmount"
                                        value={newReward.price ?? ""}
                                        onChange={(e) => setNewReward({ ...newReward, price: Number(e.target.value.replace(/[^0-9]/g, "")) })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="rewardQuantity">제한 수량 (선택)</Label>
                                    <Input
                                        id="rewardQuantity"
                                        placeholder="비워두면 무제한"
                                        value={newReward.rewardCnt ?? ""}
                                        onChange={(e) => setNewReward({ ...newReward, rewardCnt: Number(e.target.value.replace(/[^0-9]/g, "")) })}
                                    />
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
                            </div>
                            <div>
                                <Label htmlFor="deliveryDate">{newReward.isPosting === "Y" ? "배송 예정일 *" : "제공 예정일 *"}</Label>
                                <Input
                                    id="deliveryDate"
                                    type="date"
                                    value={formatDate(newReward.deliveryDate)}
                                    onChange={(e) => setNewReward({ ...newReward, deliveryDate: new Date(e.target.value) })}
                                />
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
                                                <span className="text-lg font-semibold">{formatCurrency(String(r.price))}원</span>

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

    if (step === 4) {
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
                        {/* TODO: 사업자 서류첨부 업로드 기능 추가 */}
                        {/* <div>
                            <Label htmlFor="businessDoc">사업자 관련 서류 (PDF/JPG/PNG) *</Label>
                            <Input
                                ref={businessDocRef}
                                id="businessDoc"
                                type="file"
                                accept="application/pdf,image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setProject((prev) => ({ ...prev, businessDoc: file }));
                                }}
                            />
                            <div className="mt-2 flex items-center gap-2 w-full min-w-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 hover:bg-gray-100"
                                    onClick={() => businessDocRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-1" /> 파일 선택
                                </Button>
                                <div className="flex-1 min-w-0">
                                    <span className="block text-sm text-gray-700 truncate">
                                        {project.businessDoc ? project.businessDoc.name : "선택된 파일 없음"}
                                    </span>
                                </div>
                                {project.businessDoc && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 px-3"
                                        onClick={() => {
                                            if (businessDocRef.current) businessDocRef.current.value = "";
                                            setProject((prev) => ({ ...prev, businessDoc: null }));
                                        }}
                                    >
                                        <Trash className="h-4 w-4 mr-1" /> 삭제
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                • 최대 4GB (권장 50MB 이하)
                            </p>
                        </div> */}
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

    if (step === 5) {
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
                                <p>{project.goalAmount ? `${formatCurrency(String(project.goalAmount))}원` : "-"}</p>
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