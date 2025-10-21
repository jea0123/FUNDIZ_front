import { endpoints, getData, postData } from '@/api/apis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toastSuccess } from '@/utils/utils';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'

type Category = {
    ctgrId: number;
    ctgrName: string;
}

type Subcategory = {
    subCtgrId: number;
    ctgrId: number;
    subCtgrName: string;
}
export default function CreateCategory() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [ctgrName, setCtgrName] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [subctgrName, setSubctgrName] = useState<string>("");

    const getCategories = async () => {
        const res = await getData(endpoints.getCategories);
        if (res.status === 200) {
            setCategories(res.data);
        }
    }

    useEffect(() => {
        getCategories();
    }, []);

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const ctgrId = Number(e.target.value);
        setSelectedCategory(ctgrId);
    }

    const handleCtgrNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const ctgrName = e.target.value;
        setCtgrName(ctgrName);
    }

    const handleSubctgrNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const subctgrName = e.target.value;
        setSubctgrName(subctgrName);
    }

    const handleCreateCategory = async () => {
        const res = await postData(endpoints.createCategory, { ctgrName });
        if (res.status === 200) {
            toastSuccess(`카테고리가 생성되었습니다. (${ctgrName})`);
            getCategories();
        }
    }

    const handleCreateSubcategory = async () => {
        if (selectedCategory === null) return;
        const res = await postData(endpoints.createSubcategory, { ctgrId: selectedCategory, subctgrName: subctgrName });
        if (res.status === 200) {
            toastSuccess(`서브카테고리가 생성되었습니다. (${subctgrName})`);
            getCategories();
        }
    }

    return (
        <div>
            <h2>카테고리 생성</h2>
            <div>
                <Input type="text" value={ctgrName} onChange={handleCtgrNameChange} placeholder="카테고리 이름" />
                <Button onClick={handleCreateCategory}>카테고리 생성</Button>
            </div>
            <h2>서브카테고리 생성</h2>
            <div>
                <select value={selectedCategory ?? ""} onChange={handleCategoryChange}>
                    <option value="" disabled>카테고리 선택</option>
                    {categories.map((category) => (
                        <option key={category.ctgrId} value={category.ctgrId}>{category.ctgrName}</option>
                    ))}
                </select>
                <Input type="text" value={subctgrName} onChange={handleSubctgrNameChange} placeholder="서브카테고리 이름" />
                <Button onClick={handleCreateSubcategory}>서브카테고리 생성</Button>
            </div>
        </div>
    )
}
