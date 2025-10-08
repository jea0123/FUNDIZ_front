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
import { formatDate } from '@/utils/utils';

type RewardCreatePayload = Omit<RewardCreateRequestDto, "projectId" | "deliveryDate"> & {
    deliveryDate: string;
};

type ProjectCreatePayload = Omit<ProjectCreateRequestDto, "startDate" | "endDate" | "rewardList"> & {
    startDate: string;
    endDate: string;
    rewardList: RewardCreatePayload[];
};

const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

const toNum = (v: any, d = 0) => (v === null || v === "" ? d : Number(v));
const toDate = (v: any) => (v instanceof Date ? v : (v ? new Date(v) : new Date()));
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

const isValidReward = (r: RewardDraft) => (
    r.rewardName.trim().length > 0 &&
    r.price > 0 &&
    r.rewardContent.trim().length > 0 &&
    r.deliveryDate instanceof Date &&
    !isNaN(r.deliveryDate.getTime()) &&
    (r.isPosting === "Y" || r.isPosting === "N")
);

const isValidProject = (p: ProjectCreateRequestDto) => {
    if (!p.title || !p.content || !p.thumbnail)
        return { ok: false, message: "필수 입력 항목을 모두 채워주세요." };
    if (!p.goalAmount || p.goalAmount <= 0)
        return { ok: false, message: "목표 금액을 입력하세요." };

    const start = new Date(p.startDate);
    const end = new Date(p.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()))
        return { ok: false, message: "펀딩 기간을 올바르게 입력하세요." };
    if (start > end)
        return { ok: false, message: "시작일은 종료일보다 이전이어야 합니다." };

    return { ok: true, message: "" };
};

const buildPayload = (
    project: ProjectCreateRequestDto,
    rewards: Array<RewardForm>
): ProjectCreatePayload => ({
    ...project,
    startDate: formatDate(project.startDate),
    endDate: formatDate(project.endDate),
    tagList: cleanTags(project.tagList),
    rewardList: rewards.map(({ rewardName, price, rewardContent, deliveryDate, rewardCnt, isPosting }) => ({
        rewardName,
        price,
        rewardContent,
        deliveryDate: formatDate(deliveryDate),
        rewardCnt,
        isPosting
    })),
});

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
    { id: 2, title: "프로젝트 설정", description: '목표 금액 및 기간 설정' },
    { id: 3, title: "리워드 설계", description: "후원자 리워드 구성" },
    { id: 4, title: "창작자 정보", description: "창작자 기본 정보" },
    { id: 5, title: "검토 및 제출", description: "프로젝트 요약 및 심사 안내" },
];

/* --------------------------- Page --------------------------- */

export default function CreateProject() {
    const { projectId: projectIdParam } = useParams();
    const projectId = projectIdParam ? Number(projectIdParam) : null;
    const isEdit = !!projectId; // 편집 모드 여부

    const navigate = useNavigate();
    const goList = () => navigate("/creator/projects", { replace: true });

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    //서버 전송용
    const [project, setProject] = useState<ProjectCreateRequestDto>({
        projectId: 0,
        ctgrId: 0,
        subctgrId: 0,
        creatorId: 0,
        title: "",
        content: "",
        thumbnail: "",
        goalAmount: 0,
        startDate: new Date(),
        endDate: new Date(),
        tagList: [],
        rewardList: [],
        creatorName: "",
        businessNum: "",
        email: "",
        phone: ""
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
        rewardCnt: 0,
        isPosting: "Y"
    });

    //약관 및 정책 동의 여부 검사
    const [agree, setAgree] = useState(false);
    const [agreeError, setAgreeError] = useState<string | null>(null);

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
        (async () => {
            setIsLoading(true);
            try {
                const [catRes, subRes] = await Promise.all([
                    getData(endpoints.getCategories),
                    getData(endpoints.getSubcategories)
                ]);
                setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
                setSubcategories(Array.isArray(subRes?.data) ? subRes.data : []);

                if (isEdit && projectId) {
                    const response = await getData(endpoints.getCreatorProjectDetail(projectId));
                    const draft = response?.data?.data ?? response?.data ?? {}; // ResponseDto 형태 / 직접 데이터 둘 다 대응

                    setProject((prev) => ({
                        ...prev,
                        projectId: toNum(draft.projectId),
                        ctgrId: toNum(draft.ctgrId),
                        subctgrId: toNum(draft.subctgrId),
                        creatorId: toNum(draft.creatorId),
                        title: draft.title ?? "",
                        content: draft.content ?? "",
                        thumbnail: draft.thumbnail ?? "",
                        goalAmount: toNum(draft.goalAmount),
                        startDate: toDate(draft.startDate),
                        endDate: toDate(draft.endDate),
                        tagList: cleanTags(draft.tagList),
                        rewardList: [],
                        creatorName: draft.creatorName ?? "",
                        businessNum: draft.businessNum ?? "",
                        email: draft.email ?? "",
                        phone: draft.phone ?? ""
                    }));

                    setRewardList(
                        (draft.rewardList ?? []).map((r: any) => ({
                            rewardId: toNum(r.rewardId),
                            rewardName: r.rewardName ?? "",
                            price: toNum(r.price),
                            rewardContent: r.rewardContent ?? "",
                            deliveryDate: toDate(r.deliveryDate),
                            rewardCnt: toNum(r.rewardCnt, 0),
                            isPosting: ((r.isPosting ?? "Y") + "").trim() === "N" ? "N" : "Y",
                            tempId: Math.random().toString(36).slice(2, 10)
                        }))
                    );
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [isEdit, projectId]);

    //리워드 임시 id 생성
    const genId = () => Math.random().toString(36).slice(2, 10);

    //리워드 추가
    const addReward = () => {
        if (!isValidReward(newReward)) {
            alert("리워드 정보를 올바르게 입력해주세요.");
            return;
        }
        const newName = normalizeName(newReward.rewardName);
        const dup = rewardList.some(r => normalizeName(r.rewardName) === newName);
        if (dup) {
            alert('같은 리워드명이 이미 있습니다. 다른 이름을 사용해주세요.');
            return;
        }
        setRewardList((prev) => [...prev, { ...newReward, tempId: genId() }]);
        setNewReward({
            rewardName: "",
            price: 0,
            rewardContent: "",
            deliveryDate: new Date(),
            rewardCnt: 0,
            isPosting: "Y",
        });
    };

    //리워드 삭제
    const removeReward = (tempId: string) => setRewardList((prev) => prev.filter((r) => r.tempId !== tempId));

    //임시저장
    const handleSaveDraft = async () => {
        const payload = buildPayload(project, rewardList);
        setIsLoading(true);
        try {
            if (isEdit && projectId) {
                // 기존 Draft 업데이트
                await postData(endpoints.updateProject(projectId), payload);
                alert("임시저장이 완료되었습니다.");
                goList();
            } else {
                // 신규 Draft 생성
                const response = await postData(endpoints.createProject, payload);
                if (response.status === 200) {
                    alert("임시저장이 완료되었습니다.");
                    goList();
                } else {
                    alert("임시저장에 실패했습니다.");
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    //제출
    const handleSubmit = async () => {
        if (!validateAgree(agree, setAgreeError)) return;

        const { ok, message } = isValidProject(project);
        if (!ok) return alert(message);
        if (rewardList.length === 0) return alert("최소 하나 이상의 리워드를 추가해주세요.");
        if (rewardList.find((r) => !isValidReward(r))) return alert("리워드 정보가 올바르지 않습니다. 다시 확인해주세요.");

        setIsLoading(true);
        try {
            const payload = buildPayload(project, rewardList);

            if (isEdit && projectId) {
                // 기존 Draft 업데이트
                const updateRes = await postData(endpoints.updateProject(projectId), payload);
                if (updateRes.status !== 200) {
                    alert("변경사항 저장에 실패했습니다. 다시 시도해주세요.");
                    return;
                }

                // 편집 중인 Draft 심사요청
                const submitRes = await postData(endpoints.submitProject(projectId), {});
                if (submitRes.status === 200) {
                    alert("심사요청이 완료되었습니다.");
                    goList();
                } else {
                    alert("심사요청에 실패했습니다. 다시 시도해주세요.");
                }
                return;
            }

            // 신규 작성 후 즉시 심사요청
            const createRes = await postData(endpoints.createProject, payload);
            if (createRes.status === 200) {
                alert("심사요청이 완료되었습니다.");
                goList();
            } else if (createRes.status === 400) {
                alert("입력한 정보가 올바르지 않습니다. 다시 확인해주세요.");
            } else if (createRes.status === 0) {
                alert("서버 응답이 없습니다. 잠시 후 다시 시도해주세요.");
            } else {
                alert("심사요청에 실패했습니다. 다시 시도해주세요.");
            }
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
                    />
                </CardContent>
            </Card>

            <div className="flex justify-between mt-8">
                <div className="flex items-center">
                    {isEdit && currentStep === 1 ? (
                        <Button variant="outline" onClick={() => goList()}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> 목록으로
                        </Button>
                    ) : currentStep > 1 ? (
                        <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}>
                            이전
                        </Button>
                    ) : null}
                </div>

                <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleSaveDraft}>
                        <Save className="h-4 w-4 mr-2" /> 임시저장
                    </Button>
                    {currentStep < STEPS.length ? (
                        <Button onClick={() => setCurrentStep((s) => Math.min(STEPS.length, s + 1))}>
                            다음
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={!agree || isLoading}>
                            <Send className="h-4 w-4 mr-2" /> 심사요청
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}