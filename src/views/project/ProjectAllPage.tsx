import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/admin";
import type { Featured, SearchProject, Subcategory } from "@/types/projects";
import { endpoints, getData } from "@/api/apis";
import type { SortKey } from "./components/SortBar";
import { ProjectCard } from "../MainPage";
import Crumbs from "./components/Crumbs";
import CategoryChips from "./components/CategoryChips";
import SortBar from "./components/SortBar";
import SubcategoryTabs from "./components/SubcategoryTabs";

// 프런트 정렬키 → 백엔드 dto.sort 매핑
const SORT_MAP: Record<SortKey, "recent" | "liked" | "amount" | "deadline" | "percent" | "view"> = {
    recent: "recent",
    liked: "liked",
    amount: "amount",
    deadline: "deadline",
    percent: "percent",
    view: "view",
};

/* ------------------------------ Common hook ------------------------------ */

function useCatalogData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [catRes, subRes] = await Promise.all([
            getData(endpoints.getCategories),
            getData(endpoints.getSubcategories)
        ]);

        const catData = catRes?.data;
        const subData = subRes?.data;

        const cats = Array.isArray(catData) ? catData : [];
        const subs = Array.isArray(subData) ? subData : [];

        if (!alive) return;
        setCategories(cats);
        setSubcategories(subs);
      } catch {
        // 상단 필터 UI만 비어보이게 두기
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { categories, subcategories };
}

function useQueryState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const sort = (searchParams.get("sort") as SortKey) || "recent";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "10", 10));
    const keyword = searchParams.get("keyword") || "";

    const setParam = (k: string, v?: string) => {
        const next = new URLSearchParams(searchParams);

        if (v && v.length) {
            next.set(k, v);
        } else {
            next.delete(k);
        }
        setSearchParams(next, { replace: true });
    };

    const setSort = (s: SortKey) => setParam("sort", s);
    const setPage = (p: number) => setParam("page", String(p));
    const setSize = (s: number) => setParam("size", String(s));
    const setKeyword = (k: string) => { setParam("keyword", k); setParam("page", "1"); };

    return { sort, page, size, keyword, setSort, setPage, setSize, setKeyword };
}

function useProject(dto: SearchProject & { page: number; size: number; sort: SortKey; }) {
    const [items, setItems] = useState<Featured[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<boolean>(false);

    const { keyword, sort = "recent", page = 1, size = 10 } = dto;

    const { ctgrId, subctgrId } = useParams();

    useEffect(() => {
        const controller = new AbortController();

        async function run() {
            setLoading(true);
            setError(false);
            try {
                const param = new URLSearchParams();
                if (keyword && keyword.trim()) param.set("keyword", keyword.trim());
                if (ctgrId !== undefined && ctgrId !== null && !Number.isNaN(ctgrId)) param.set("ctgrId", String(ctgrId));
                if (subctgrId !== undefined && subctgrId != null && !Number.isNaN(subctgrId)) param.set("subctgrId", String(subctgrId));
                param.set("sort", SORT_MAP[sort]);
                param.set("page", String(page));
                param.set("size", String(size));

                console.log("[useProject] query", Object.fromEntries(param.entries()));

                const url = `/project/search?${param.toString()}`;
                const res = await getData(url);
                const list = Array.isArray(res.data?.items) ? res.data.items : [];
                setItems(list);
                setTotal(res.data?.totalElements ?? list.length);
                } catch (err: any) {
                    if (err?.name !== "CanceledError") setError(err);
                } finally {
                    setLoading(false);
            }
        }

        run();
    
        return () => controller.abort();
    }, [keyword, ctgrId, subctgrId, sort, page, size]);

    return { items, total, loading, error };
}

/* ------------------------------ UI component ------------------------------ */

function Pagination({ page, size, total, onPage }: { page: number; size: number; total: number; onPage: (p: number) => void }) {
  const lastPage = Math.max(1, Math.ceil(total / size));

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>이전</Button>
      <span className="text-sm text-gray-600">{page} / {lastPage}</span>
      <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>다음</Button>
    </div>
  );
}

function ProjectGrid({ items }: { items: Featured[] }) {
    if (!items.length) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">검색된 프로젝트가 없습니다.</p>
        );
    }
    return (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {items.map((it) => (
                <ProjectCard key={it.projectId} items={it} />
            ))}
        </div>
    );
}

/* --------------------------------- Pages --------------------------------- */

export function ProjectAllPage() {
    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, setPage } = useQueryState();
    const { items, total, loading, error } = useProject({ sort, page, size, keyword });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Crumbs categories={categories} subcategories={subcategories} />
            <CategoryChips categories={categories} activeCategoryId="all" />
            <SortBar value={sort} onChange={setSort} total={total} />

            {loading && <p className="text-gray-500">불러오는 중…</p>}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <ProjectGrid items={items} />}

            <Pagination page={page} size={size} total={total} onPage={setPage} />
        </div>
    );
}

export function ProjectByCategoryPage() {
    const { ctgrId } = useParams();
    const categoryId = ctgrId ? Number(ctgrId) : undefined;
    console.log("[CategoryPage] categoryId=", categoryId);
    
    if (!categoryId) return null;

    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, setPage } = useQueryState();
    const { items, total, loading, error } = useProject({ sort, page, size, keyword, ctgrId: categoryId });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Crumbs categories={categories} subcategories={subcategories} />
            <CategoryChips categories={categories} activeCategoryId={categoryId} />
            <SubcategoryTabs categoryId={categoryId} subcategories={subcategories} activeSubId="all" />
            <SortBar value={sort} onChange={setSort} total={total} />

            {loading && <p className="text-gray-500">불러오는 중…</p>}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <ProjectGrid items={items} />}

            <Pagination page={page} size={size} total={total} onPage={setPage} />
        </div>
    );
}

export function ProjectBySubcategoryPage() {
    const { categoryId: catStr, subcategoryId: subStr } = useParams();
    const categoryId = catStr ? Number(catStr) : undefined;
    const subcategoryId = subStr ? Number(subStr) : undefined;

    if (!categoryId || !subcategoryId) return null;

    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, setPage } = useQueryState();
    const { items, total, loading, error } = useProject({ sort, page, size, keyword, ctgrId: categoryId, subctgrId: subcategoryId });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Crumbs categories={categories} subcategories={subcategories} categoryId={categoryId} subcategoryId={subcategoryId} />
            <CategoryChips categories={categories} activeCategoryId={categoryId} />
            <SubcategoryTabs categoryId={categoryId} subcategories={subcategories} activeSubId={subcategoryId} />
            <SortBar value={sort} onChange={setSort} total={total} />

            {loading && <p className="text-gray-500">불러오는 중…</p>}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <ProjectGrid items={items} />}

            <Pagination page={page} size={size} total={total} onPage={setPage} />
        </div>
    );
}

export default ProjectAllPage;
