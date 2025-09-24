import { Button } from "@/components/ui/button";
import type { Subcategory } from "@/types/projects";
import { Link } from "react-router-dom";

type Props = {
    categoryId: Number;
    subcategories: Subcategory[];
    activeSubId?: number | "all";
};

export default function SubcategoryTabs({ categoryId, subcategories, activeSubId }: Props) {
  if (!categoryId) return null;

  const subs = subcategories.filter((s) => s.ctgrId === categoryId);
  if (subs.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
        <Button asChild size="sm" variant={activeSubId === "all" ? "default" : "ghost"} className="rounded-full">
            <Link to={`/project/category/${categoryId}`}>전체</Link>
        </Button>

        {subs.map((s) => (
            <Button key={s.subctgrId} asChild size="sm" variant={activeSubId === s.subctgrId ? "default" : "ghost"} className="rounded-full">
                <Link to={`/project/category/${categoryId}/subcategory/${s.subctgrId}`}>{s.subctgrName}</Link>
            </Button>
        ))}
    </div>
  );
}