import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Subcategory } from '@/types/projects';
import { endpoints, getData, postData } from '@/api/apis';
import type { RewardCreateRequestDto, RewardDraft, RewardForm } from '@/types/reward';
import type { Category } from '@/types/admin';
import FundingLoader from '@/components/FundingLoader';
import { CreateProjectStepper } from '../components/CreateProjectStepper';
import { CreateProjectSteps } from '../components/CreateProjectSteps';
import { useNavigate, useParams } from 'react-router-dom';
import type { ProjectCreateRequestDto } from '@/types/creator';
import { assertValidReward, validateReward, validateRewardList, type FieldErrors } from '@/types/reward-validator';

const PROJECT_RULES = {
    MIN_TITLE_LEN: 2,
    MAX_TITLE_LEN: 255,
    MIN_CONTENT_LEN: 30,
    MAX_CONTENT_LEN: 3000,
    //TODO: 대표이미지 나중에 추가
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

type RewardCreatePayload = Omit<RewardCreateRequestDto, "projectId">;

type ProjectCreatePayload = Omit<ProjectCreateRequestDto, "rewardList"> & {
    rewardList: RewardCreatePayload[];
};

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

    //TODO: 대표이미지 검증 추가

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

const buildPayload = (project: ProjectCreateRequestDto, rewards: RewardForm[], creatorId: number): ProjectCreatePayload => ({
    ...project,
    creatorId,
    startDate: project.startDate,
    endDate: project.endDate,
    tagList: cleanTags(project.tagList),
    rewardList: rewards.map((r): RewardCreatePayload => {
        const valid = assertValidReward(r, { fundingEndDate: project.endDate });
        return {
            rewardName: valid.rewardName,
            price: valid.price,
            rewardContent: valid.rewardContent,
            deliveryDate: valid.deliveryDate,
            rewardCnt: valid.rewardCnt,
            isPosting: valid.isPosting
        };
    })
});

const yyyyMmDd = (d?: Date) =>
    d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";

const buildFormData = (
    project: ProjectCreateRequestDto,
    rewards: RewardForm[],
    creatorId: number
) => {
    const fd = new FormData();

    fd.append("creatorId", String(creatorId));
    fd.append("ctgrId", String((project as any).ctgrId ?? 0));
    fd.append("subctgrId", String(project.subctgrId ?? 0));
    fd.append("title", project.title ?? "");
    fd.append("content", project.content ?? "");
    fd.append("goalAmount", String(project.goalAmount ?? 0));
    fd.append("startDate", yyyyMmDd(project.startDate as any));
    fd.append("endDate", yyyyMmDd(project.endDate as any));
    fd.append("creatorName", project.creatorName ?? "");
    fd.append("businessNum", project.businessNum ?? "");
    fd.append("email", project.email ?? "");
    fd.append("phone", project.phone ?? "");
    fd.append("thumbnail", project.thumbnail instanceof File ? project.thumbnail : "");

    fd.append("contentBlocks", JSON.stringify(project.contentBlocks ?? { blocks: [] })); // 상세 설명(JSON)

    console.log("buildFormData.project", project);

    if (project.thumbnail instanceof File) {
        fd.append("thumbnail", project.thumbnail);
    }

    (project.files ?? []).forEach(f => fd.append("files", f));

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
    { id: 7, title: "상세 설명", description: "이미지+텍스트 상세 구성" },
];

/* --------------------------- Page --------------------------- */

export default function CreateProject() {
    const addDays = (date: Date, days: number) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    };

    const { projectId: projectIdParam } = useParams();
    const projectId = projectIdParam ? Number(projectIdParam) : null;
    const isEdit = !!projectId; // 편집 모드 여부

    const navigate = useNavigate();
    const goList = () => navigate("/creator/projects", { replace: true });

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [rewardErrors, setRewardErrors] = useState<FieldErrors>({});

    //프로젝트
    const [project, setProject] = useState<ProjectCreateRequestDto>({
        projectId: 0,
        ctgrId: 0,
        subctgrId: 0,
        creatorId: 0,
        title: "",
        content: "",
        thumbnail: null,
        goalAmount: 0,
        startDate: addDays(new Date(), PROJECT_RULES.MIN_START_LEAD_DAYS),
        endDate: addDays(addDays(new Date(), PROJECT_RULES.MIN_START_LEAD_DAYS), PROJECT_RULES.MIN_DAYS),
        tagList: [],
        rewardList: [],
        creatorName: "",
        businessNum: "",
        email: "",
        phone: "",
        files: [],
        businessDoc: null,
        contentBlocks: { blocks: [] } // EditorJS JSON,
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

    //창작자 기본정보
    const [creator, setCreator] = useState<{
        creatorId: number | null;
        isComplete: boolean;
        isSuspended: boolean;
    } | null>(null);

    //약관 및 정책 동의 여부 검사
    const [agree, setAgree] = useState(false);
    const [agreeError, setAgreeError] = useState<string | null>(null);

    //프로젝트 검증 결과
    const projectValidation = useMemo(() => validateProject(project), [project]);

    //제출 버튼 가드
    const canSubmit =
        projectValidation.ok &&
        rewardList.length > 0 &&
        (creator?.creatorId ?? null) !== null &&
        creator?.isComplete === true &&
        creator?.isSuspended === false;

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
                    setCreator({
                        creatorId: info.creatorId ?? null,
                        isComplete: !!info.isComplete,
                        isSuspended: !!info.isSuspended,
                    });
                }

                if (isEdit && projectId) {
                    const response = await getData(endpoints.getCreatorProjectDetail(projectId));
                    if (!alive) return;

                    const draft = response?.data ?? {};

                    setProject((prev) => ({
                        ...prev,
                        projectId: draft.projectId,
                        ctgrId: draft.ctgrId,
                        subctgrId: draft.subctgrId,
                        creatorId: draft.creatorId,
                        title: draft.title,
                        content: draft.content,
                        thumbnail: draft.thumbnail,
                        goalAmount: draft.goalAmount,
                        startDate: draft.startDate,
                        endDate: draft.endDate,
                        tagList: cleanTags(draft.tagList),
                        rewardList: [],
                        creatorName: draft.creatorName,
                        businessNum: draft.businessNum,
                        email: draft.email,
                        phone: draft.phone
                    }));

                    setRewardList(
                        (draft.rewardList ?? []).map((r: any) => ({
                            rewardId: r.rewardId,
                            rewardName: r.rewardName,
                            price: r.price,
                            rewardContent: r.rewardContent,
                            deliveryDate: r.deliveryDate,
                            rewardCnt: r.rewardCnt == null ? null : r.rewardCnt,
                            isPosting: r.isPosting,
                            tempId: Math.random().toString(36).slice(2, 10)
                        }))
                    );

                    // draft > info > prev 우선순위로 병합
                    setCreator(prev => {
                        const creatorId =
                            draft.creatorId ?? prev?.creatorId ?? info?.creatorId ?? null;

                        const hasDraftComplete = draft.isComplete !== undefined && draft.isComplete !== null;
                        const isComplete = hasDraftComplete
                            ? !!draft.isComplete
                            : (prev?.isComplete ?? !!info?.isComplete);

                        const hasDraftSuspended = draft.isSuspended !== undefined && draft.isSuspended !== null;
                        const isSuspended = hasDraftSuspended
                            ? !!draft.isSuspended
                            : (prev?.isSuspended ?? !!info?.isSuspended);

                        return { creatorId, isComplete, isSuspended };
                    });
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

    //Draft 생성/저장
    const handleSaveDraft = async () => {
        if (isLoading) return; // 중복 제출 방지
        if (!creator || creator.creatorId == null) {
            alert("창작자 ID가 필요합니다.");
            return;
        }
        const formData = buildFormData(project, rewardList, creator.creatorId);
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

        // 창작자 기본정보 사전 가드
        if (!creator?.creatorId) return alert("창작자 ID가 필요합니다.");
        if (creator.isSuspended) return alert("정지된 창작자는 프로젝트 등록/수정이 불가합니다.");
        if (!creator.isComplete) return alert("창작자 기본정보 필수 항목이 미완성입니다. (창작자명/사업자번호/이메일/전화번호)");

        setIsLoading(true);
        try {
            const formData = buildFormData(project, rewardList, creator!.creatorId);

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
            <CreateProjectStepper steps={STEPS} currentStep={currentStep} progress={progress} title={isEdit ? "프로젝트 수정" : "프로젝트 만들기"} />

            <Card className="mt-6">
                <CardContent className="p-6">
                    <CreateProjectSteps
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

            {currentStep === STEPS.length && !canSubmit && (
                <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
                    제출하기 전에 아래 항목을 확인하세요:
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        {!projectValidation.ok && <li>프로젝트 정보가 정책에 맞지 않습니다.</li>}
                        {rewardList.length === 0 && <li>최소 1개 이상의 리워드를 추가하세요.</li>}
                        {(creator?.creatorId ?? null) === null && <li>창작자 ID가 필요합니다.</li>}
                        {creator?.isComplete === false && (
                            <li>창작자 기본정보 필수 항목이 미완성입니다. (창작자명/사업자번호/이메일/전화번호)</li>
                        )}
                        {creator?.isSuspended === true && <li>정지된 창작자는 프로젝트 등록/수정이 불가합니다.</li>}
                    </ul>
                </div>
            )}

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
                            <Button onClick={handleSubmit}
                                // disabled={!agree || isLoading || !canSubmit}
                            >
                            <Send className="h-4 w-4 mr-2" /> 심사요청
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}