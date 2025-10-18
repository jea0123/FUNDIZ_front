import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Subcategory } from '@/types/projects';
import { endpoints, getData, postData } from '@/api/apis';
import type { RewardDraft, RewardForm } from '@/types/reward';
import type { Category } from '@/types/admin';
import FundingLoader from '@/components/FundingLoader';
import { useNavigate, useParams } from 'react-router-dom';
import type { ContentBlocks } from '@/types/creator';
import { assertValidReward, validateReward, type RewardFieldErrors } from '@/types/reward-validator';
import { EditProjectSteps, type CreateProjectViewModel } from '../components/EditProjectSteps';
import { EditProjectStepper } from '../components/EditProjectStepper';
import { useCreatorId } from '../../../types/useCreatorId';
import { formatDate, toIsoDateTime, toPublicUrl } from '@/utils/utils';

/* -------------------------------- Type -------------------------------- */

export type ProjectFieldErrors = Partial<{
    ctgrId: string;
    subctgrId: string;
    title: string;
    goalAmount: string;
    startDate: string;
    endDate: string;
    content: string;
    contentBlocks: string;
    thumbnail: string;
    businessDoc: string;
    tagList: string;
}>;

/* ------------------------------ Constants ------------------------------ */

const STEPS = [
    { id: 1, title: "프로젝트 정보", description: "기본 정보 입력" },
    { id: 2, title: "프로젝트 설정", description: '목표 금액 및 기간 설정' },
    { id: 3, title: "프로젝트 소개", description: "프로젝트 본문 입력" },
    { id: 4, title: "리워드 설계", description: "후원자 리워드 구성" },
    { id: 5, title: "창작자 정보", description: "창작자 기본 정보" },
    { id: 6, title: "검토 및 제출", description: "프로젝트 요약 및 심사 안내" },
];

const PROJECT_RULES = {
    MIN_TITLE_LEN: 2,
    MAX_TITLE_LEN: 255,
    MIN_CONTENT_LEN: 30,
    MAX_CONTENT_LEN: 3000,
    MIN_GOAL_AMOUNT: 10_000,
    MAX_GOAL_AMOUNT: 2_000_000_000,
    MIN_DAYS: 7,
    MAX_DAYS: 60,
    MIN_START_LEAD_DAYS: 7,
    MAX_THUMBNAIL_LEN: 500,
    MAX_TAGS: 10,
    MIN_TAG_LEN: 2,
    MAX_TAG_LEN: 20,
} as const;

const DAY = 1000 * 60 * 60 * 24;
export const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/* -------------------------------- Utils -------------------------------- */

const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

// 태그 문자열화
const toTagNames = (list: any): string[] =>
    Array.isArray(list)
        ? list
            .map((t) => (typeof t === "string" ? t : t?.tagName))
            .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
        : [];

// 태그 정규화/중복제거
const cleanTags = (list: any): string[] => {
    const arr = toTagNames(list).map((s) => s.trim()).filter(Boolean);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of arr) {
        const key = normalizeName(t);
        if (!seen.has(key)) {
            seen.add(key);
            out.push(t);
        }
    }
    return out;
};

// contentBlocks 문자열/객체 대응
const parseBlocks = (input?: string | ContentBlocks | null | undefined): ContentBlocks => {
    if (input == null) return { blocks: [] };

    // 문자열로 온 경우
    const s = String(input).trim();
    if (!s) return { blocks: [] };

    try {
        const obj = JSON.parse(s);
        return (obj && typeof obj === "object" && Array.isArray((obj as any).blocks))
            ? (obj as ContentBlocks)
            : { blocks: [] };
    } catch {
        return { blocks: [] };
    }
};

const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

/* ---------------------------- Validaators / builders ---------------------------- */

const validateProject = (p: CreateProjectViewModel & {
    thumbnailPreviewUrl?: string;
    businessDocPreviewUrl?: string;
    businessNum?: string | null;
    businessDoc?: File | null;
}) => {
    const R = PROJECT_RULES;
    const errors: ProjectFieldErrors = {};

    // 1단계
    if (!p.ctgrId) errors.ctgrId = "카테고리를 선택해주세요.";
    if (!p.subctgrId) errors.subctgrId = "세부카테고리를 선택해주세요.";

    const title = (p.title ?? "").trim();
    if (title.length < R.MIN_TITLE_LEN || title.length > R.MAX_TITLE_LEN) {
        errors.title = `제목은 ${R.MIN_TITLE_LEN}~${R.MAX_TITLE_LEN}자여야 합니다.`;
    }

    const hasThumbnail = (p.thumbnail instanceof File) || !!p.thumbnailPreviewUrl;
    if (!hasThumbnail) {
        errors.thumbnail = "대표 이미지를 첨부해주세요.";
    }

    const tags = cleanTags(p.tagList);
    if (tags.length > R.MAX_TAGS) errors.tagList = `태그는 최대 ${R.MAX_TAGS}개까지 가능합니다.`;
    if (tags.some(t => t.trim().length < R.MIN_TAG_LEN)) errors.tagList = `태그는 최소 ${R.MIN_TAG_LEN}자 이상이어야 합니다.`;

    // 2단계
    if (!p.goalAmount || p.goalAmount < R.MIN_GOAL_AMOUNT) {
        errors.goalAmount = `목표 금액은 최소 ${R.MIN_GOAL_AMOUNT.toLocaleString()}원 이상이어야 합니다.`;
    } else if (p.goalAmount > R.MAX_GOAL_AMOUNT) {
        errors.goalAmount = `목표 금액은 최대 ${R.MAX_GOAL_AMOUNT.toLocaleString()}원 이하이어야 합니다.`;
    }

    const asValidDate = (v: unknown) =>
        v instanceof Date && !isNaN(v.getTime()) ? stripTime(v) : null;

    const start = asValidDate(p.startDate);
    const end = asValidDate(p.endDate);

    if (!start || !end) {
        if (!start) errors.startDate = "시작일을 선택해주세요.";
        if (!end) errors.endDate = "종료일을 선택해주세요.";
        return { ok: Object.keys(errors).length === 0, errors };
    }

    if (start > end) {
        errors.startDate = "시작일은 종료일 이전이어야 합니다.";
        errors.endDate = "종료일은 시작일 이후여야 합니다.";
    }

    const days = Math.floor((end.getTime() - start.getTime()) / DAY) + 1;
    if (days < R.MIN_DAYS || days > R.MAX_DAYS) {
        errors.endDate = `펀딩 기간은 최소 ${R.MIN_DAYS}일, 최대 ${R.MAX_DAYS}일까지 가능합니다.`;
    }

    const isEditMode = !!p.projectId && Number(p.projectId) > 0;
    const today = stripTime(new Date());
    const minStart = new Date(today);
    minStart.setDate(minStart.getDate() + R.MIN_START_LEAD_DAYS);

    if (isEditMode) {
        if (start < today) {
            errors.startDate = "시작일이 이미 지났습니다. 일정을 조정하세요.";
        }
    } else {
        if (start < minStart) {
            errors.startDate = `시작일은 오늘로부터 최소 ${R.MIN_START_LEAD_DAYS}일 이후여야 합니다.`;
        }
    }

    // 3단계
    const content = (p.content ?? "").trim();
    if (content.length < R.MIN_CONTENT_LEN || content.length > R.MAX_CONTENT_LEN) {
        errors.content = `내용은 최소 ${R.MIN_CONTENT_LEN}자, 최대 ${R.MAX_CONTENT_LEN}자까지 가능합니다.`;
    }

    const blocks = Array.isArray((p as any)?.contentBlocks?.blocks)
        ? (p as any).contentBlocks.blocks
        : [];
    if (blocks.length === 0) {
        errors.contentBlocks = "프로젝트 소개를 추가해주세요. (이미지 또는 텍스트 1개 이상)";
    }

    // 5단계
    const hasBizNum = !!(p.businessNum && String(p.businessNum).trim());
    const hasBizDoc = (p.businessDoc instanceof File) || !!p.businessDocPreviewUrl;
    if (hasBizNum && !hasBizDoc) {
        errors.businessDoc = "사업자등록증 사본을 첨부해주세요.";
    }

    return { ok: Object.keys(errors).length === 0, errors };
};

const validateByStep = (
    step: number,
    p: CreateProjectViewModel & {
        thumbnailPreviewUrl?: string;
        businessDocPreviewUrl?: string;
        businessNum?: string | null;
        businessDoc?: File | null;
    }
) => {
    const { errors: all } = validateProject(p);
    const stepErrors: ProjectFieldErrors = {};

    if (step === 1) {
        if (all.ctgrId) stepErrors.ctgrId = all.ctgrId;
        if (all.subctgrId) stepErrors.subctgrId = all.subctgrId;
        if (all.title) stepErrors.title = all.title;
        if (all.thumbnail) stepErrors.thumbnail = all.thumbnail;
    } else if (step === 2) {
        if (all.goalAmount) stepErrors.goalAmount = all.goalAmount;
        if (all.startDate) stepErrors.startDate = all.startDate;
        if (all.endDate) stepErrors.endDate = all.endDate;
    } else if (step === 3) {
        if (all.content) stepErrors.content = all.content;
        if (all.contentBlocks) stepErrors.contentBlocks = all.contentBlocks;
    } else if (step === 5) {
        if (all.businessDoc) stepErrors.businessDoc = all.businessDoc;
    }

    return { ok: Object.keys(stepErrors).length === 0, projectStepErrors: stepErrors };
};

const appendAll = (fd: FormData, key: string, values?: (string | number | null | undefined)[]) => {
    if (!values) return;
    values.forEach(v => {
        if (v === null || v === undefined) return;
        fd.append(key, String(v));
    });
};

const buildFormData = (
    project: CreateProjectViewModel,
    rewards: RewardForm[],
) => {
    const fd = new FormData();

    fd.append("subctgrId", String(project.subctgrId ?? 0));
    fd.append("title", project.title ?? "");
    fd.append("goalAmount", String(project.goalAmount ?? 0));
    fd.append("startDate", toIsoDateTime(formatDate(project.startDate)));
    fd.append("endDate", toIsoDateTime(formatDate(project.endDate), true));
    fd.append("content", project.content ?? "");
    fd.append("contentBlocks", JSON.stringify(project.contentBlocks ?? { blocks: [] }));

    if (project.thumbnail instanceof File) {
        fd.append("thumbnail", project.thumbnail);
    }
    if (project.businessDoc instanceof File) {
        fd.append("businessDoc", project.businessDoc);
    }

    appendAll(fd, "tagList", cleanTags(project.tagList));

    rewards.forEach((r, i) => {
        const v = assertValidReward(r, { fundingEndDate: project.endDate ?? undefined });
        fd.append(`rewardList[${i}].rewardName`, v.rewardName);
        fd.append(`rewardList[${i}].price`, String(v.price));
        fd.append(`rewardList[${i}].rewardContent`, v.rewardContent);
        fd.append(`rewardList[${i}].deliveryDate`, toIsoDateTime(formatDate(v.deliveryDate as Date | string | null)));
        fd.append(`rewardList[${i}].rewardCnt`, v.rewardCnt == null ? "" : String(v.rewardCnt));
        fd.append(`rewardList[${i}].isPosting`, v.isPosting);
    });

    return fd;
};

const validateAgree = (
    agree: boolean,
    setAgreeError: (message: string | null) => void
) => {
    if (!agree) {
        setAgreeError("약관 및 정책에 동의해야 제출할 수 있습니다.");
        return false;
    }
    setAgreeError(null);
    return true;
};

/* -------------------------------- Page -------------------------------- */

export default function EditProject() {

    /* ----------------------------- State ----------------------------- */

    //TODO: dev id
    const { creatorId, loading } = useCreatorId(2);

    const { projectId: projectIdParam } = useParams();
    const projectId = projectIdParam ? Number(projectIdParam) : null;
    const isEdit = !!projectId; // 편집 모드 여부

    const navigate = useNavigate();
    const goList = () => navigate("/creator/projects", { replace: true });

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [projectErrors, setProjectErrors] = useState<ProjectFieldErrors>({});
    const [rewardErrors, setRewardErrors] = useState<RewardFieldErrors>({});
    const [rewardListError, setRewardListError] = useState<string | null>(null);

    const clearProjectError = (k: keyof ProjectFieldErrors) => setProjectErrors((prev) => ({ ...prev, [k]: undefined }));
    const clearRewardError = (k: keyof RewardFieldErrors) => setRewardErrors((prev) => ({ ...prev, [k]: undefined }));

    //프로젝트
    const [project, setProject] = useState<CreateProjectViewModel>({
        projectId: 0,
        ctgrId: 0,
        subctgrId: 0,
        creatorId: 0,
        title: "",
        goalAmount: 0,
        startDate: null,
        endDate: null,
        content: "",
        contentBlocks: { blocks: [] }, // EditorJS JSON,
        thumbnail: null,
        businessDoc: null,
        tagList: [],
        rewardList: [],
        creatorName: "",
        businessNum: "",
        email: "",
        phone: "",
        thumbnailPreviewUrl: undefined, // 편집 모드
        businessDocPreviewUrl: undefined, // 편집 모드
    });

    //카테고리
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    //리워드
    const [rewardList, setRewardList] = useState<RewardForm[]>([]);
    const [newReward, setNewReward] = useState<RewardDraft>({
        rewardName: "",
        price: 0,
        rewardContent: "",
        deliveryDate: new Date(),
        rewardCnt: null,
        isPosting: "Y"
    });

    //약관 동의
    const [agree, setAgree] = useState(false);
    const [agreeError, setAgreeError] = useState<string | null>(null);

    /* ----------------------------- Derived ----------------------------- */

    //프로젝트 검증 결과
    const projectValidation = useMemo(() => validateProject(project), [project]);

    //제출 버튼 가드
    const canSubmit = projectValidation.ok && rewardList.length > 0;

    const ko = useMemo(() => new Intl.Collator("ko", { sensitivity: "base", numeric: true }), []);

    //TODO: 선택된 카테고리와 연결된 세부카테고리만 조회하도록 백엔드 수정
    //선택된 카테고리에 속한 세부카테고리 보여주는 필터링 및 정렬
    const sortedSubcategories = useMemo(() => {
        return subcategories
            .filter((sc) => Number(sc.ctgrId) === Number(project.ctgrId))
            .slice()
            .sort((a, b) => {
                const an = a.subctgrName ?? "";
                const bn = b.subctgrName ?? "";
                const aNum = /^\d/.test(an);
                const bNum = /^\d/.test(bn);
                if (aNum !== bNum) return aNum ? 1 : -1; //숫자로 시작하면 문자 뒤로
                const cmp = ko.compare(an, bn); //한글/영어는 사전순 정렬
                if (cmp !== 0) return cmp;
                return Number(a.subctgrId) - Number(b.subctgrId); //같으면 id 오름차순
            });
    }, [subcategories, project.ctgrId, ko]);

    /* ----------------------------- Effects ----------------------------- */

    useEffect(() => {
        let alive = true;
        (async () => {
            setIsLoading(true);
            try {
                const [catRes, subRes, infoRes] = await Promise.all([
                    getData(endpoints.getCategories),
                    getData(endpoints.getSubcategories),
                    getData(endpoints.getCreatorProfileSummary),
                ]);
                if (!alive) return;

                setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
                setSubcategories(Array.isArray(subRes?.data) ? subRes.data : []);

                const info = infoRes?.data ?? null;
                if (info) {
                    setProject(prev => ({
                        ...prev,
                        creatorName: info.creatorName ?? prev.creatorName,
                        businessNum: info.businessNum ?? prev.businessNum,
                        email: info.email ?? prev.email,
                        phone: info.phone ?? prev.phone,
                    }));
                }

                if (isEdit && projectId) {
                    const response = await getData(endpoints.getCreatorProjectDetail(projectId));
                    if (!alive) return;

                    const draft = response?.data ?? {};
                    console.log("[EditProject] raw draft.contentBlocks =", draft.contentBlocks);
                    console.log("[EditProject] typeof draft.contentBlocks =", typeof draft.contentBlocks);

                    setProject((prev) => {
                        const parsed = parseBlocks(draft.contentBlocks);
                        console.log("[EditProject] parsed.blocks.length =", parsed.blocks?.length ?? 0);

                        return {
                            ...prev,
                            projectId: draft.projectId,
                            creatorId: draft.creatorId,
                            ctgrId: draft.ctgrId,
                            subctgrId: draft.subctgrId,
                            title: draft.title,
                            goalAmount: draft.goalAmount,
                            startDate: new Date(draft.startDate),
                            endDate: new Date(draft.endDate),
                            content: draft.content,
                            contentBlocks: parsed,
                            thumbnail: null,
                            businessDoc: null,
                            tagList: cleanTags(draft.tagList),
                            rewardList: [],

                            creatorName: draft.creatorName ?? prev.creatorName,
                            businessNum: draft.businessNum ?? prev.businessNum,
                            email: draft.email ?? prev.email,
                            phone: draft.phone ?? prev.phone,
                            thumbnailPreviewUrl: toPublicUrl(draft.thumbnail),
                            businessDocPreviewUrl: toPublicUrl(draft.businessDoc),
                        };
                    });

                    setRewardList(
                        (draft.rewardList ?? []).map((r: any) => ({
                            rewardId: r.rewardId,
                            rewardName: r.rewardName,
                            price: r.price,
                            rewardContent: r.rewardContent,
                            deliveryDate: new Date(r.deliveryDate),
                            rewardCnt: r.rewardCnt == null ? null : r.rewardCnt,
                            isPosting: r.isPosting,
                            tempId: Math.random().toString(36).slice(2, 10)
                        }))
                    );
                }
            } catch (e: any) {
                const msg =
                    e?.response?.data?.message ||
                    e?.message ||
                    "정보를 불러오는 중 오류가 발생했습니다.";
                alert(msg);
            } finally {
                if (alive) setIsLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [isEdit, projectId]);

    //TODO: dev id
    useEffect(() => {
        if (!import.meta.env.DEV) return;
        if (!loading && creatorId) {
            localStorage.setItem("DEV_CREATOR_ID", String(creatorId));
        }
    }, [loading, creatorId])

    /* ---------------------------- Handlers ---------------------------- */

    //리워드 임시 id 생성
    const genId = () => Math.random().toString(36).slice(2, 10);

    //리워드 추가
    const addReward = () => {
        // 새 리워드 폼 검증
        const res = validateReward(newReward, { fundingEndDate: project.endDate });
        setRewardErrors(res.errors);
        if (!res.ok) return;

        const item = { ...newReward, tempId: genId() };
        setRewardList(prev => [...prev, item]);

        setNewReward({
            rewardName: "",
            price: 0,
            rewardContent: "",
            deliveryDate: new Date(),
            rewardCnt: null,
            isPosting: "Y",
        });
        setRewardErrors({});
        setRewardListError(null);
    };

    //리워드 삭제
    const removeReward = (tempId: string) => setRewardList((prev) => prev.filter((r) => r.tempId !== tempId));

    // 다음 단계
    const handleNextStep = () => {
        // step별 부분 검증
        const { ok, projectStepErrors } = validateByStep(currentStep, project);
        setProjectErrors(projectStepErrors);
        if (!ok) return;

        if (currentStep === 4) {
            if (rewardList.length === 0) {
                setRewardListError("최소 1개 이상의 리워드가 필요합니다.");
                return;
            }
            setRewardListError(null);
        }

        setCurrentStep((s) => Math.min(STEPS.length, s + 1));
    };

    //저장
    const handleSaveDraft = async () => {
        if (isLoading) return; // 중복 제출 방지
        const formData = buildFormData(project, rewardList);
        setIsLoading(true);
        try {
            if (isEdit && projectId) {
                // 기존 Draft 업데이트
                const response = await postData(endpoints.updateProject(projectId), formData);
                if (response.status === 200) {
                    alert("저장이 완료되었습니다.");
                    goList();
                } else {
                    alert("저장에 실패했습니다.");
                }
            } else {
                // 신규 Draft 생성
                const response = await postData(endpoints.createProject, formData);
                if (response.status === 200) {
                    alert("저장이 완료되었습니다.");
                    goList();
                } else {
                    alert("저장에 실패했습니다.");
                }
            }
        } catch (err: any) {
            alert(err?.message ?? "저장 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    //심사요청(제출)
    const handleSubmit = async () => {
        if (isLoading) return; // 중복 제출 방지
        if (!validateAgree(agree, setAgreeError)) return;

        const { ok, errors } = validateProject(project);
        if (!ok) { setProjectErrors(errors); return; }

        if (rewardList.length === 0) {
            alert("최소 1개 이상의 리워드가 필요합니다.");
            return;
        }
        setRewardListError(null);

        setIsLoading(true);
        try {
            const formData = buildFormData(project, rewardList);

            if (isEdit && projectId) {
                // 기존 Draft 업데이트
                await postData(endpoints.updateProject(projectId), formData);

                // 편집 중인 Draft 심사요청
                const response = await postData(endpoints.submitProject(projectId), {});
                if (response.status === 200) {
                    alert("심사요청이 완료되었습니다.");
                    return goList();
                } else {
                    alert("심사요청이 실패했습니다");
                }
            }

            // 신규 작성 후 즉시 심사요청
            const extractProjectId = (res: any): number | null => {
                const data = res?.data?.data ?? res?.data ?? res;

                if (typeof data === "number") return data;

                if (data && typeof data === "object") {
                    const id = (data as any).project ?? (data as any).id ?? null;
                    return (typeof id === "number") ? id : null;
                }
                return null;
            }

            const form = await postData(endpoints.createProject, formData);
            const newId = extractProjectId(form);

            if (newId == null) {
                throw new Error("생성은 되었지만 projectId를 확인할 수 없습니다. 서버 응답을 점검해 주세요.");
            }

            const response = await postData(endpoints.submitProject(newId), {});
            if (response.status === 200) {
                alert("심사요청이 완료되었습니다.");
                goList();
            } else {
                alert("심사요청이 실패했습니다.");
            }
        } catch (e: any) {
            const status = e?.response?.status;
            const msg =
                e?.response?.data?.message ||
                (status === 0 && "서버 응답이 없습니다. 잠시 후 다시 시도해주세요.") ||
                (status === 400 && "입력한 정보가 올바르지 않습니다. 다시 확인해주세요.") ||
                e?.message ||
                "요청 처리 중 오류가 발생했습니다.";
            alert(msg);
        } finally {
            setIsLoading(false);
        }
    };

    /* --------------------------- Render --------------------------- */

    if (isLoading) return <FundingLoader></FundingLoader>;

    const progress = (currentStep / STEPS.length) * 100;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EditProjectStepper steps={STEPS} currentStep={currentStep} progress={progress} title={isEdit ? "프로젝트 수정" : "프로젝트 만들기"} />

            <Card className="mt-6">
                <CardContent className="p-6">
                    <EditProjectSteps
                        key={isEdit ? `edit-${projectId}` : "new"}
                        step={currentStep}
                        project={project}
                        setProject={setProject}
                        categories={categories}
                        subcategories={sortedSubcategories}
                        rewardList={rewardList}
                        newReward={newReward}
                        setNewReward={setNewReward}
                        addReward={addReward}
                        removeReward={removeReward}
                        agree={agree}
                        setAgree={setAgree}
                        agreeError={agreeError}
                        rewardErrors={rewardErrors}
                        projectErrors={projectErrors}
                        rewardListError={rewardListError}
                        clearProjectError={clearProjectError}
                        clearRewardError={clearRewardError}
                        addDays={addDays}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-between mt-8">
                <div className="flex items-center">
                    {isEdit && currentStep === 1 ? (
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> 뒤로
                        </Button>
                    ) : currentStep > 1 ? (
                        <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}>
                            이전 단계
                        </Button>
                    ) : null}
                </div>

                <div className="flex space-x-2">
                    {currentStep < STEPS.length ? (
                        <Button variant="outline" onClick={handleNextStep}>
                            다음 단계
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleSaveDraft}>
                                <Save className="h-4 w-4 mr-2" /> 저장
                            </Button>
                            <Button onClick={handleSubmit} disabled={!agree || isLoading || !canSubmit}>
                                <Send className="h-4 w-4 mr-2" /> 심사요청
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}