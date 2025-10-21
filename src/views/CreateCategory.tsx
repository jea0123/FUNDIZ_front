import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { endpoints, getData, postData } from "@/api/apis";
import { toastSuccess } from "@/utils/utils";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = { ctgrId: number; ctgrName: string };
type Subcategory = { subCtgrId: number; ctgrId: number; subCtgrName: string };

export default function CreateCategory() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [ctgrName, setCtgrName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [subctgrName, setSubctgrName] = useState("");
    const [loading, setLoading] = useState(false);

    const ko = useMemo(() => new Intl.Collator("ko", { sensitivity: "base", numeric: true }), []);

    const fetchCategories = async () => {
        const res = await getData(endpoints.getCategories);
        if (res.status === 200) setCategories(res.data);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreateCategory = async () => {
        const name = ctgrName.trim();
        if (!name) return;
        setLoading(true);
        try {
            const res = await postData(endpoints.createCategory, { ctgrName: name });
            if (res.status === 200 || res.status === 201) {
                toastSuccess(`카테고리가 생성되었습니다. (${name})`);
                setCtgrName("");
                fetchCategories();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubcategory = async () => {
        if (selectedCategory == null) return;
        const name = subctgrName.trim();
        if (!name) return;
        setLoading(true);
        try {
            const res = await postData(endpoints.createSubcategory, {
                ctgrId: selectedCategory,
                subCtgrName: name, // 백엔드 JSON 키와 일치
            });
            if (res.status === 200 || res.status === 201) {
                toastSuccess(`서브카테고리가 생성되었습니다. (${name})`);
                setSubctgrName("");
                fetchCategories();
            }
        } finally {
            setLoading(false);
        }
    };

    const sortedCategories = useMemo(
        () =>
            categories
                .slice()
                .sort((a, b) => {
                    const c = ko.compare(a.ctgrName ?? "", b.ctgrName ?? "");
                    return c !== 0 ? c : a.ctgrId - b.ctgrId;
                }),
        [categories, ko]
    );

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>카테고리 생성</CardTitle>
                    <CardDescription>최상위 카테고리를 추가합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                            <Label htmlFor="ctgrName">카테고리 이름</Label>
                            <Input
                                id="ctgrName"
                                placeholder="예: 축제/행사"
                                value={ctgrName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setCtgrName(e.target.value)}
                                maxLength={100}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={handleCreateCategory}
                                className="w-full sm:w-auto"
                                disabled={loading || ctgrName.trim().length === 0}
                            >
                                카테고리 생성
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>서브카테고리 생성</CardTitle>
                    <CardDescription>선택한 상위 카테고리 아래에 서브카테고리를 추가합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-[minmax(220px,1fr),1fr,auto]">
                        <div className="space-y-2">
                            <Label>상위 카테고리</Label>
                            <Select
                                value={selectedCategory != null ? String(selectedCategory) : ""}
                                onValueChange={(v) => setSelectedCategory(Number(v))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="카테고리 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortedCategories.map((c) => (
                                        <SelectItem key={c.ctgrId} value={String(c.ctgrId)}>
                                            {c.ctgrName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subctgrName">서브카테고리 이름</Label>
                            <Input
                                id="subctgrName"
                                placeholder="예: 지역 살리기"
                                value={subctgrName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSubctgrName(e.target.value)}
                                maxLength={100}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={handleCreateSubcategory}
                                className="w-full sm:w-auto"
                                disabled={
                                    loading ||
                                    selectedCategory == null ||
                                    subctgrName.trim().length === 0
                                }
                            >
                                서브카테고리 생성
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
