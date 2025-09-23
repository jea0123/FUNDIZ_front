import type { Category } from "@/types/admin";
import type { Subcategory } from "@/types/projects";
import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

type Props = {
    categories: Category[];
    subcategories: Subcategory[];
    categoryId?: number;
    subcategoryId?: number;
};

export default function Crumbs({ categories, subcategories, categoryId, subcategoryId }: Props) {
    const cat = categoryId ? categories.find((c) => c.ctgrId === categoryId)?.ctgrName : undefined;
    const sub = categoryId && subcategoryId ? subcategories.find((s) => s.ctgrId === categoryId && s.subctgrId === subcategoryId)?.subctgrName : undefined;
    
    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <NavLink to="/project" className={({ isActive }) => (isActive ? "text-black" : "hover:text-black")}>프로젝트</NavLink>
                {categoryId && (
                <>
                    <ChevronRight className="h-4 w-4" />
                    <a href={`/project/category/${categoryId}`} className="hover:text-black">{cat ?? "카테고리"}</a>
                </>
                )}
                {subcategoryId && (
                <>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-black">{sub ?? "세부카테고리"}</span>
                </>
                )}
        </div>
    );
}