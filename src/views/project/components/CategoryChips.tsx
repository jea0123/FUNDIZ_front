import { Button } from "@/components/ui/button";
import type { Category } from "@/types/admin";
import { Link } from "react-router-dom";

type Props = {
    categories: Category[];
    activeCategoryId?: number | "all";
};

export default function CategoryChips({ categories, activeCategoryId = "all" }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
        <Button asChild variant={activeCategoryId === "all" ? "default" : "outline"} className="rounded-full">
            <Link to="/project">전체</Link>
        </Button>

        {categories.map((c) => (
            <Button key={c.ctgrId} asChild variant={activeCategoryId === c.ctgrId ? "default" : "outline"} className="rounded-full">
                <Link to={`/project/category/${c.ctgrId}`}>{c.ctgrName}</Link>
            </Button>
        ))}
    </div>
  );
}