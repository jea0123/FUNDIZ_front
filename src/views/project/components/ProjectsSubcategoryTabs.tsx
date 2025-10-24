import { Button } from "@/components/ui/button";
import type { Subcategory } from "@/types/projects";
import { Link, useLocation } from "react-router-dom";

type Props = {
    ctgrId: number;
    subcategories: Subcategory[];
    activeSubId?: number | "all";
};

export default function ProjectsSubcategoryTabs({ ctgrId, subcategories, activeSubId }: Props) {
    if (!ctgrId) return null;

    const { pathname } = useLocation();

    const isUpcoming = pathname.includes("/project/upcoming");
    const basePath = isUpcoming ? "/project/upcoming" : "/project";

    const subs = subcategories
        .filter((s) => s.ctgrId === ctgrId)
        .sort((a, b) => a.subctgrName.localeCompare(b.subctgrName, "ko"));
    if (subs.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            <Button asChild size="sm" variant={activeSubId === "all" ? "default" : "ghost"} className="rounded-full">
                <Link to={`${basePath}/category/${ctgrId}`}>전체</Link>
            </Button>

            {subs.map((s) => (
                <Button key={s.subctgrId} asChild size="sm" variant={activeSubId === s.subctgrId ? "default" : "ghost"} className="rounded-full">
                    <Link to={`${basePath}/category/${ctgrId}/subcategory/${s.subctgrId}`}>{s.subctgrName}</Link>
                </Button>
            ))}
        </div>
    );
}