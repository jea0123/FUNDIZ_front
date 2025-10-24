import { Button } from "@/components/ui/button";
import type { Category } from "@/types/admin";
import { Link, useLocation } from "react-router-dom";

type Props = {
    categories: Category[];
    activeCatId?: number | "all";
};

export default function ProjectsCategoryChips({ categories, activeCatId = "all" }: Props) {
    const { pathname } = useLocation();
    const basePath = pathname.startsWith("/project/upcoming") ? "/project/upcoming" : "/project";

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <Button asChild variant={activeCatId === "all" ? "default" : "outline"} className="rounded-full">
                <Link to={`${basePath}`}>전체</Link>
            </Button>

            {categories.map((c) => (
                <Button key={c.ctgrId} asChild variant={activeCatId === c.ctgrId ? "default" : "outline"} className="rounded-full">
                    <Link to={`${basePath}/category/${c.ctgrId}`}>{c.ctgrName}</Link>
                </Button>
            ))}
        </div>
    );
}