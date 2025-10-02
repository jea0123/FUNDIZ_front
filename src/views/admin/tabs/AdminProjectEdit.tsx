import { endpoints, getData, postData } from "@/api/apis";
import FundingLoader from "@/components/FundingLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminProjectUpdateDto, Category } from "@/types/admin";
import type { Subcategory } from "@/types/projects";
import { Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* -------------------------------- Types -------------------------------- */

export const ADMIN_STATUSES = ["VERIFYING", "UPCOMING", "OPEN", "SUCCESS", "FAILED", "REJECTED", "CANCELED", "SETTLED"] as const;

export type AdminStatus = typeof ADMIN_STATUSES[number];

/* --------------------------- Component --------------------------- */

export default function AdminProjectEdit() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    const [form, setForm] = useState<AdminProjectUpdateDto | null>(null);

    const [selectedCtgrId, setSelectedCtgrId] = useState<number | "">("");
    const initSyncedRef = useRef(false);

    /* --------------------------- Helpers --------------------------- */

    const ko = useMemo(
        () => new Intl.Collator("ko", { sensitivity: "base", numeric: true }), []
    );

    //전체 세부카테고리 정렬
    const sortedSubcategories = useMemo(() => {
        return [...subcategories].sort((a, b) => {
            const an = a.subctgrName ?? "";
            const bn = b.subctgrName ?? "";
            const aNum = /^\d/.test(an);
            const bNum = /^\d/.test(bn);
            if (aNum !== bNum) return aNum ? 1 : -1; //숫자로 시작하면 문자 뒤로
            const cmp = ko.compare(an, bn); //한글/영어는 사전순 정렬
            if (cmp !== 0) return cmp;
            return Number(a.subctgrId) - Number(b.subctgrId); //같으면 id 오름차순
        });
    }, [subcategories, ko]);

    //선택된 카테고리에 속한 세부카테고리 보여주는 필터링
    const filteredSubcategories = useMemo(() => {
        if (selectedCtgrId === "") return [];
        return sortedSubcategories.filter((s) => s.ctgrId === selectedCtgrId);
    }, [sortedSubcategories, selectedCtgrId]);

    //subctgrId로 카테고리 ID/이름 찾기
    const findCategoryBySub = (subctgrId?: number) => {
        if (!subctgrId) return { id: undefined, name: "-" };
        const sub = subcategories.find((s) => s.subctgrId === subctgrId);
        if (!sub) return { id: undefined, name: "-" };
        const cat = categories.find((c) => c.ctgrId === sub.ctgrId);
        return { id: cat?.ctgrId, name: cat?.ctgrName ?? "-" };
    };

    const toAdminProjectForm = (projectRes: any, pid: number): AdminProjectUpdateDto => ({
        projectId: pid,
        subctgrId: Number(projectRes.subctgrId) || 0,
        title: projectRes.title ?? "",
        thumbnail: projectRes.thumbnail ?? "",
        projectStatus: (projectRes.projectStatus as AdminStatus) ?? "VERIFYING"
    });

    const validate = (form: AdminProjectUpdateDto) => {
        if (!form.title.trim()) return "제목을 입력하세요.";
        if (!form.thumbnail.trim()) return "대표 이미지가 필요합니다.";
        if (!form.subctgrId || form.subctgrId <= 0) return "세부카테고리를 선택하세요.";
        if (!ADMIN_STATUSES.includes(form.projectStatus)) return "프로젝트 상태 값을 확인하세요.";
        return "";
    };

    /* --------------------------- Effects --------------------------- */

    //카테고리/서브카테고리/프로젝트 상세 불러오고 form 세팅
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

                const pid = Number(projectId);
                if (!pid) throw new Error("잘못된 프로젝트 ID입니다.");

                const detailRes = await getData(endpoints.getProjectDetail(pid));
                const src = detailRes?.data;

                setForm(toAdminProjectForm(src, pid));
            } finally {
                setIsLoading(false);
            }
        })();
    }, [projectId]);

    //form.subctgrId 기준으로 selectedCtgrId 초기값 세팅
    useEffect(() => {
        if (initSyncedRef.current) return;
        if (!form || subcategories.length === 0 || categories.length === 0) return;

        const sub = subcategories.find((s) => s.subctgrId === form.subctgrId);
        const catId = sub ? categories.find((c) => c.ctgrId === sub.ctgrId)?.ctgrId : undefined;
        const next = catId ?? "";

        setSelectedCtgrId(next);
        initSyncedRef.current = true;
    }, [form?.subctgrId, subcategories, categories]);

    //선택한 카테고리가 바뀌면 현재 subctgrId가 그 카테고리에 속하는지 검사, 아니라면 0으로 초기화
    useEffect(() => {
        if (selectedCtgrId === "") return;

        const formSubId = form?.subctgrId;
        if (formSubId == null || formSubId === 0) return;

        const ok = subcategories.some(
            (s) => s.subctgrId === formSubId && s.ctgrId === selectedCtgrId
        );
        if (!ok) {
            setForm((p) => (p && p.subctgrId !== 0 ? { ...p, subctgrId: 0 } : p));
        }
    }, [selectedCtgrId, form?.subctgrId, subcategories]);

    /* --------------------------- Submit --------------------------- */

    const handleSubmit = async () => {
        if (!form) return;

        const msg = validate(form);
        if (msg) {
            alert(msg);
            return;
        }

        setIsSaving(true);
        try {
            const { projectId: _omit, ...body } = form;
            const resp = await postData(endpoints.adminUpdateProject(form.projectId), body);
            const status = resp?.status ?? 0;

            if (status >= 200 && status < 300) {
                alert("프로젝트가 수정되었습니다.");
                navigate("/admin/project");
            } else if (status === 400) {
                alert("입력값을 확인해주세요.");
            } else {
                alert("수정에 실패했습니다. 다시 시도해주세요.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    /* --------------------------- Render --------------------------- */

    if (isLoading || !form) return <FundingLoader />;

    const currentCat = findCategoryBySub(form.subctgrId);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-semibold">프로젝트 수정 (관리자)</h1>

            <Card className="mt-6">
                <CardContent className="p-6 space-y-6">
                    <input type="hidden" value={form.projectId} readOnly />

                    <div>
                        <Label>프로젝트 상태</Label>
                        <Select
                            value={form.projectStatus}
                            onValueChange={(v) => setForm((p) => p ? ({ ...p, projectStatus: v as AdminStatus }) : p)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="상태를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                {ADMIN_STATUSES.map((st) => (
                                    <SelectItem key={st} value={st}>
                                        {st}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <Label>카테고리</Label>
                            <Select
                                value={selectedCtgrId === "" ? undefined : String(selectedCtgrId)}
                                onValueChange={(v) => {
                                    const next = v === "" ? "" : Number(v);
                                    setSelectedCtgrId(next);
                                    setForm((p) => (p ? { ...p, subctgrId: 0 } : p));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={"카테고리를 선택하세요"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                    {categories.map((c) => (
                                        <SelectItem key={c.ctgrId} value={String(c.ctgrId)}>
                                            {c.ctgrName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>세부카테고리</Label>
                            <Select
                                value={form.subctgrId ? String(form.subctgrId) : undefined}
                                onValueChange={(v) => {
                                    const subId = Number(v);
                                    const picked = subcategories.find(s => s.subctgrId === subId);
                                    if (picked && picked.ctgrId !== selectedCtgrId) {
                                        setSelectedCtgrId(picked.ctgrId);
                                    }
                                    setForm((p) => (p ? { ...p, subctgrId: subId } : p));
                                }}
                                disabled={selectedCtgrId === ""}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="세부카테고리를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                    {filteredSubcategories.map((s) => (
                                        <SelectItem key={s.subctgrId} value={String(s.subctgrId)}>
                                            {s.subctgrName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="title">프로젝트명</Label>
                        <Input
                            id="title"
                            value={form.title}
                            onChange={(e) => setForm((p) => p ? ({ ...p, title: e.target.value }) : p)}
                            placeholder="프로젝트명"
                        />
                    </div>

                    <div className="space-y-2">
                        {/* TODO: 파일업로드 기능 추가 */}
                        <div>
                            <Label>대표 이미지 *</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500 mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
                                <Button variant="outline" size="sm">파일 선택</Button>
                                <p className="text-xs text-gray-400 mt-2">권장 크기: 1200x800px, 최대 4MB (JPG, PNG)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => navigate(-1)}>취소</Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>저장</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}