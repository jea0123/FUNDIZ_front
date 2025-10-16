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
import type { ContentBlocks, ProjectCreateRequestDto } from '@/types/creator';
import { assertValidReward, validateReward, validateRewardList, type FieldErrors } from '@/types/reward-validator';
import { EditProjectSteps, type CreateProjectViewModel } from '../components/EditProjectSteps';
import { EditProjectStepper } from '../components/EditProjectStepper';
import { useCreatorId } from '../useCreatorId';
import { toPublicUrl } from '@/utils/utils';

const PROJECT_RULES = {
    MIN_TITLE_LEN: 2,
    MAX_TITLE_LEN: 255,
    MIN_CONTENT_LEN: 30,
    MAX_CONTENT_LEN: 3000,
    MIN_GOAL_AMOUNT: 10_000,
    MIN_DAYS: 7,
    MAX_DAYS: 60,
    MIN_START_LEAD_DAYS: 7,
    MAX_TAGS: 10,
    MIN_TAG_LEN: 2,
    MAX_TAG_LEN: 20,
} as const;

const DAY = 1000 * 60 * 60 * 24;
const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

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

    // 객체로 온 경우
    if (typeof input === "object") {
        const obj = input as any;
        if (Array.isArray(obj.blocks)) return obj as ContentBlocks;
        return { blocks: [] };
    }

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

const validateProject = (p: ProjectCreateRequestDto) => {
    const R = PROJECT_RULES;

    if (!p.subctgrId)
        return { ok: false, message: "세부카테고리를 선택해주세요." };

    const title = (p.title ?? "").trim();
    if (title.length < R.MIN_TITLE_LEN || title.length > R.MAX_TITLE_LEN)
        return { ok: false, message: `제목 길이는 ${R.MIN_TITLE_LEN}~${R.MAX_TITLE_LEN}자여야 합니다.` };

    const content = (p.content ?? "").trim();
    if (content.length < R.MIN_CONTENT_LEN || content.length > R.MAX_CONTENT_LEN)
        return { ok: false, message: `본문 길이는 ${R.MIN_CONTENT_LEN}~${R.MAX_CONTENT_LEN}자여야 합니다.` };

    if (!p.goalAmount || p.goalAmount < R.MIN_GOAL_AMOUNT)
        return { ok: false, message: `목표 금액은 최소 ${R.MIN_GOAL_AMOUNT.toLocaleString()}원 이상이어야 합니다.` };

    const start = stripTime(new Date(p.startDate));
    const end = stripTime(new Date(p.endDate));
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
        return { ok: false, message: "펀딩 시작일/종료일을 입력해주세요." };
    if (start > end)
        return { ok: false, message: "시작일은 종료일 이전이어야 합니다." };

    const days = Math.floor((end.getTime() - start.getTime()) / DAY) + 1;
    if (days < R.MIN_DAYS || days > R.MAX_DAYS)
        return { ok: false, message: `펀딩 기간은 ${R.MIN_DAYS}~${R.MAX_DAYS}일이어야 합니다.` };

    const today = stripTime(new Date());
    const minStart = new Date(today);
    minStart.setDate(minStart.getDate() + R.MIN_START_LEAD_DAYS);
    if (start < today)
        return { ok: false, message: "시작일이 이미 지났습니다. 일정을 조정하세요." };
    if (start < minStart)
        return { ok: false, message: `시작일은 오늘로부터 최소 ${R.MIN_START_LEAD_DAYS}일 이후여야 합니다.` };

    const tags = cleanTags(p.tagList);
    if (tags.length > R.MAX_TAGS)
        return { ok: false, message: `태그는 최대 ${R.MAX_TAGS}개까지 가능합니다.` };
    if (tags.some(t => t.trim().length < R.MIN_TAG_LEN))
        return { ok: false, message: `태그는 최소 ${R.MIN_TAG_LEN}자 이상이어야 합니다.` };

    return { ok: true, message: "" };
};

const yyyyMmDd = (d?: Date) =>
    d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";

const buildFormData = (
    project: ProjectCreateRequestDto,
    rewards: RewardForm[],
) => {
    const fd = new FormData();

    fd.append("subctgrId", String(project.subctgrId ?? 0));
    fd.append("title", project.title ?? "");
    fd.append("goalAmount", String(project.goalAmount ?? 0));
    fd.append("startDate", yyyyMmDd(project.startDate as any));
    fd.append("endDate", yyyyMmDd(project.endDate as any));
    fd.append("content", project.content ?? "");
    fd.append("contentBlocks", JSON.stringify(project.contentBlocks ?? { blocks: [] })); // 상세 설명(JSON)

    if (project.thumbnail instanceof File) {
        fd.append("thumbnail", project.thumbnail);
    }
    if (project.businessDoc instanceof File) {
        fd.append("businessDoc", project.businessDoc);
    }

    cleanTags(project.tagList).forEach(t => fd.append("tagList", t));

    rewards.forEach((r, i) => {
        const v = assertValidReward(r, { fundingEndDate: project.endDate });
        fd.append(`rewardList[${i}].rewardName`, v.rewardName);
        fd.append(`rewardList[${i}].price`, String(v.price));
        fd.append(`rewardList[${i}].rewardContent`, v.rewardContent);
        fd.append(`rewardList[${i}].deliveryDate`, yyyyMmDd(v.deliveryDate as any));
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

const STEPS = [
    { id: 1, title: "프로젝트 정보", description: "기본 정보 입력" },
    { id: 2, title: "프로젝트 소개", description: "프로젝트 본문 입력" },
    { id: 3, title: "프로젝트 설정", description: '목표 금액 및 기간 설정' },
    { id: 4, title: "리워드 설계", description: "후원자 리워드 구성" },
    { id: 5, title: "창작자 정보", description: "창작자 기본 정보" },
    { id: 6, title: "검토 및 제출", description: "프로젝트 요약 및 심사 안내" },
];

/* --------------------------- Page --------------------------- */

export default function EditProject() {
    const addDays = (date: Date, days: number) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    };

    //TODO: dev id
    const { creatorId, loading } = useCreatorId(26);

    const { projectId: projectIdParam } = useParams();
    const projectId = projectIdParam ? Number(projectIdParam) : null;
    const isEdit = !!projectId; // 편집 모드 여부

    const navigate = useNavigate();
    const goList = () => navigate("/creator/projects", { replace: true });

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [rewardErrors, setRewardErrors] = useState<FieldErrors>({});

    //프로젝트
    const [project, setProject] = useState<CreateProjectViewModel>({
        projectId: 0,
        ctgrId: 0,
        subctgrId: 0,
        creatorId: 0,
        title: "",
        content: "",
        thumbnail: null,
        goalAmount: 0,
        startDate: addDays(new Date(), PROJECT_RULES.MIN_START_LEAD_DAYS),
        endDate: addDays(addDays(new Date(), PROJECT_RULES.MIN_START_LEAD_DAYS), PROJECT_RULES.MIN_DAYS - 1),
        tagList: [],
        rewardList: [],
        creatorName: "",
        businessNum: "",
        email: "",
        phone: "",
        businessDoc: null,
        contentBlocks: { blocks: [] }, // EditorJS JSON,
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

    //약관 및 정책 동의 여부 검사
    const [agree, setAgree] = useState(false);
    const [agreeError, setAgreeError] = useState<string | null>(null);

    //프로젝트 검증 결과
    const projectValidation = useMemo(() => validateProject(project), [project]);

    //제출 버튼 가드
    const canSubmit = projectValidation.ok && rewardList.length > 0;

    const ko = useMemo(
        () => new Intl.Collator("ko", { sensitivity: "base", numeric: true }), []
    );

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

    //TODO: dev id
    useEffect(() => {
        if (!import.meta.env.DEV) return;
        if (!loading && creatorId) {
            localStorage.setItem("DEV_CREATOR_ID", String(creatorId));
        }
    }, [loading, creatorId])

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

                    // setProject((prev) => ({
                    //     ...prev,
                    //     projectId: draft.projectId,
                    //     creatorId: draft.creatorId,
                    //     ctgrId: draft.ctgrId,
                    //     subctgrId: draft.subctgrId,
                    //     title: draft.title,
                    //     goalAmount: draft.goalAmount,
                    //     startDate: new Date(draft.startDate),
                    //     endDate: new Date(draft.endDate),
                    //     content: draft.content,
                    //     contentBlocks: parseBlocks(draft.contentBlocks),
                    //     thumbnail: null,
                    //     businessDoc: null,
                    //     tagList: cleanTags(draft.tagList),
                    //     rewardList: [],

                    //     creatorName: draft.creatorName ?? prev.creatorName,
                    //     businessNum: draft.businessNum ?? prev.businessNum,
                    //     email: draft.email ?? prev.email,
                    //     phone: draft.phone ?? prev.phone,
                    //     thumbnailPreviewUrl: toPublicUrl(draft.thumbnail),
                    //     businessDocPreviewUrl: toPublicUrl(draft.businessDoc),
                    // }));

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

    //리워드 임시 id 생성
    const genId = () => Math.random().toString(36).slice(2, 10);

    //리워드 추가
    const addReward = () => {
        // 리워드 단건 검사
        const single = validateReward(newReward, { fundingEndDate: project.endDate });
        setRewardErrors(single.errors);
        if (!single.ok) return;

        // 리워드 목록 검사
        const multiple = [...rewardList, { ...newReward, tempId: genId() }];
        const list = validateRewardList(multiple, { fundingEndDate: project.endDate });
        if (!list.ok) {
            alert(list.allErrors.join("\n"));
            return;
        }
        setRewardList(multiple);
        setNewReward({
            rewardName: "",
            price: 0,
            rewardContent: "",
            deliveryDate: new Date(),
            rewardCnt: null,
            isPosting: "Y",
        });
    };

    //리워드 삭제
    const removeReward = (tempId: string) => setRewardList((prev) => prev.filter((r) => r.tempId !== tempId));

    //Draft 생성
    const handleSaveDraft = async () => {
        if (isLoading) return; // 중복 제출 방지
        if (!validateAgree(agree, setAgreeError)) return;

        // 프로젝트 검증
        const { ok, message } = validateProject(project);
        if (!ok) return alert(message);

        const formData = buildFormData(project, rewardList);
        setIsLoading(true);
        try {
            if (isEdit && projectId) {
                // 기존 Draft 업데이트
                await postData(endpoints.updateProject(projectId), formData);
                alert("저장이 완료되었습니다.");
                goList();
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

    //제출
    const handleSubmit = async () => {
        if (isLoading) return; // 중복 제출 방지
        if (!validateAgree(agree, setAgreeError)) return;

        // 프로젝트 검증
        const { ok, message } = validateProject(project);
        if (!ok) return alert(message);

        // 리워드 검증
        if (rewardList.length === 0) return alert("최소 1개 이상의 리워드가 필요합니다.");
        {
            const { ok, allErrors } = validateRewardList(rewardList, { fundingEndDate: project.endDate });
            if (!ok) {
                alert(allErrors.join("\n"));
                return;
            }
        }

        setIsLoading(true);
        try {
            const formData = buildFormData(project, rewardList);

            if (isEdit && projectId) {
                // 기존 Draft 업데이트
                await postData(endpoints.updateProject(projectId), formData);

                // 편집 중인 Draft 심사요청
                await postData(endpoints.submitProject(projectId), {});
                alert("심사요청이 완료되었습니다.");
                return goList();
            }

            // 신규 작성 후 즉시 심사요청
            await postData(endpoints.createProject, formData);
            alert("심사요청이 완료되었습니다.");
            goList();
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
                    <Button variant="outline" onClick={handleSaveDraft}>
                        <Save className="h-4 w-4 mr-2" /> 저장
                    </Button>
                    {currentStep < STEPS.length ? (
                        <Button onClick={() => setCurrentStep((s) => Math.min(STEPS.length, s + 1))}>
                            다음 단계
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={!agree || isLoading || !canSubmit}>
                            <Send className="h-4 w-4 mr-2" /> 심사요청
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}