import type { Category } from "@/types/admin";
import type { Subcategory } from "@/types/projects";
import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

type Props = {
    categories: Category[];
    subcategories: Subcategory[];
    ctgrId?: number;
    subctgrId?: number;
};

export default function Crumbs({ categories, subcategories, ctgrId, subctgrId }: Props) {
    const cat = ctgrId ? categories.find((c) => c.ctgrId === ctgrId)?.ctgrName : undefined;
    const sub = ctgrId && subctgrId ? subcategories.find((s) => s.ctgrId === ctgrId && s.subctgrId === subctgrId)?.subctgrName : undefined;
    
    return (
        <div className="flex items-center gap-2 text-sm text-black-500 mb-4">
            <NavLink to="/project">프로젝트</NavLink>
                {ctgrId && (
                <>
                    <ChevronRight className="h-4 w-4" />
                    <a href={`/project/category/${ctgrId}`}>{cat ?? "카테고리"}</a>
                </>
                )}
                {subctgrId && (
                <>
                    <ChevronRight className="h-4 w-4" />
                    <span>{sub ?? "세부카테고리"}</span>
                </>
                )}
        </div>
    );
}