import type { Category } from "@/types/admin";
import type { Subcategory } from "@/types/projects";
import { ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

type Props = {
    categories: Category[];
    subcategories: Subcategory[];
    ctgrId?: number;
    subctgrId?: number;
    label?: string;
};

export default function ProjectsCrumbs({ categories, subcategories, ctgrId, subctgrId, label }: Props) {
    const { pathname } = useLocation();

    const isUpcoming = pathname.includes("/project/upcoming");
    const basePath = isUpcoming ? "/project/upcoming" : "/project";
    const rootLabel = isUpcoming ? "오픈예정" : "프로젝트";

    const cat = ctgrId ? categories.find((c) => c.ctgrId === ctgrId)?.ctgrName : undefined;
    const sub = ctgrId && subctgrId ? subcategories.find((s) => s.ctgrId === ctgrId && s.subctgrId === subctgrId)?.subctgrName : undefined;

    return (
        <div className="flex items-center gap-2 text-sm text-black-500 mb-4">
            <NavLink to={basePath}>{label ?? rootLabel}</NavLink>
            {ctgrId && (
                <>
                    <ChevronRight className="h-4 w-4" />
                    <NavLink to={`${basePath}/category/${ctgrId}`}>{cat ?? "카테고리"}</NavLink>
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