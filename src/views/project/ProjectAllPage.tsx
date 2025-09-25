import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/admin";
import type { Featured, SearchProjectParams, Subcategory } from "@/types/projects";
import { endpoints, getData } from "@/api/apis";
import type { SortKey } from "./components/SortBar";
import { ProjectCard } from "../MainPage";
import Crumbs from "./components/Crumbs";
import CategoryChips from "./components/CategoryChips";
import SortBar from "./components/SortBar";
import SubcategoryTabs from "./components/SubcategoryTabs";

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

    //URL -> 상태 동기화
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "20", 10));
    const keyword = searchParams.get("keyword") || "";
    const sort = (searchParams.get("sort") as SortKey) || "recent";

    //상태 -> URL 동기화
    const setParam = (k: string, v?: string) => {
        const next = new URLSearchParams(searchParams);

        if (v && v.length) next.set(k, v);
        else next.delete(k);

        setSearchParams(next, { replace: true });
    };

    const setPage = (p: number) => setParam("page", String(p));
    const setSize = (s: number) => setParam("size", String(s));
    const setKeyword = (k: string) => { setParam("keyword", k); setParam("page", "1"); };
    const setSort = (s: SortKey) => { setParam("sort", s); setParam("page", "1"); };

    return { page, size, keyword, sort, setPage, setSize, setKeyword, setSort };
}

function useProject(params: SearchProjectParams) {
    const [items, setItems] = useState<Featured[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<boolean>(false);

    const url = useMemo(() => {
        return endpoints.searchProject(params);
    }, [params]);

    useEffect(() => {
        let cancel = false;

        (async () => {
            try {
                setLoading(true);
                setError(false);

                const { status, data } = await getData(url);

                if (cancel) return;
                if (status !== 200) throw new Error("조회 실패");

                setItems(Array.isArray(data.items) ? data.items : []);
                setTotal(typeof data.totalElements === "number" ? data.totalElements : 0);
            } catch (err: any) {
                if (cancel) return;
                setError(true);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [url]);

    return { items, total, loading, error };
}

/* ------------------------------ UI component ------------------------------ */

function Pagination({ page, size, total, onPage }: { page: number; size: number; total: number; onPage: (p: number) => void }) {
    const lastPage = Math.max(1, Math.ceil(total / size));

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
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

export default function ProjectAllPage() {
    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, setPage } = useQueryState();
    const { items, total, loading, error } = useProject({ page, size, keyword, sort });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Crumbs categories={categories} subcategories={subcategories} />
            <CategoryChips categories={categories} activeCatId="all" />
            <SortBar value={sort} onChange={setSort} total={total} />

            {loading && <p className="text-gray-500">불러오는 중…</p>}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <ProjectGrid items={items} />}

            <Pagination page={page} size={size} total={total} onPage={setPage} />
        </div>
    );
}

export function ProjectByCategoryPage() {
    const { ctgrId: catParam } = useParams();
    const ctgrId = catParam ? Number(catParam) : undefined;
    
    if (!ctgrId) return null;

    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, setPage } = useQueryState();
    const { items, total, loading, error } = useProject({ page, size, keyword, sort, ctgrId });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Crumbs categories={categories} subcategories={subcategories} ctgrId={ctgrId} />
            <CategoryChips categories={categories} activeCatId={ctgrId} />
            <SubcategoryTabs ctgrId={ctgrId} subcategories={subcategories} activeSubId="all" />
            <SortBar value={sort} onChange={setSort} total={total} />

            {loading && <p className="text-gray-500">불러오는 중…</p>}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <ProjectGrid items={items} />}

            <Pagination page={page} size={size} total={total} onPage={setPage} />
        </div>
    );
}

export function ProjectBySubcategoryPage() {
    const { ctgrId: catParam, subctgrId: subParam } = useParams();
    const ctgrId = catParam ? Number(catParam) : undefined;
    const subctgrId = subParam ? Number(subParam) : undefined;

    if (!ctgrId || !subctgrId) return null;

    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, setPage } = useQueryState();
    const { items, total, loading, error } = useProject({ page, size, keyword, sort, ctgrId, subctgrId});

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Crumbs categories={categories} subcategories={subcategories} ctgrId={ctgrId} subctgrId={subctgrId} />
            <CategoryChips categories={categories} activeCatId={ctgrId} />
            <SubcategoryTabs ctgrId={ctgrId} subcategories={subcategories} activeSubId={subctgrId} />
            <SortBar value={sort} onChange={setSort} total={total} />

            {loading && <p className="text-gray-500">불러오는 중…</p>}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <ProjectGrid items={items} />}

            <Pagination page={page} size={size} total={total} onPage={setPage} />
        </div>
    );
}
