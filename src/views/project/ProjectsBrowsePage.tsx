import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/admin";
import type { Featured, SearchProjectParams, Subcategory } from "@/types/projects";
import { endpoints, getData } from "@/api/apis";
import { ProjectCard } from "../MainPage";
import ProjectsCrumbs from "./components/ProjectsCrumbs";
import ProjectsCategoryChips from "./components/ProjectsCategoryChips";
import ProjectsSortBar from "./components/ProjectsSortBar";
import ProjectsSubcategoryTabs from "./components/ProjectsSubcategoryTabs";
import FundingLoader from "@/components/FundingLoader";
import { Pagination } from "@/utils/pagination";
import { useBrowseQueryState } from "@/utils/usePagingQueryState";

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

function useProject(params: SearchProjectParams) {
    const { page, size, keyword, sort, ctgrId, subctgrId } = params;
    const [items, setItems] = useState<Featured[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<boolean>(false);

    const url = useMemo(() => {
        return endpoints.searchProject({ page, size, keyword, sort, ctgrId, subctgrId });
    }, [page, size, keyword, sort, ctgrId, subctgrId]);

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
                setError(err);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [url]);

    return { items, total, loading, error };
}

/* ------------------------------ UI component ------------------------------ */
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

export default function ProjectsBrowsePage() {
    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, bindUserPagination } = useBrowseQueryState();
    const { items, total, loading, error } = useProject({ page, size, keyword, sort });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProjectsCrumbs categories={categories} subcategories={subcategories} />
            <ProjectsCategoryChips categories={categories} activeCatId="all" />
            <ProjectsSortBar value={sort} onChange={setSort} total={total} />

            {loading && <FundingLoader />}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <ProjectGrid items={items} />}

            <Pagination {...bindUserPagination(total)} />
        </div>
    );
}

export function ProjectsSearchPage() {
    const { sort, page, size, keyword, setSort, setKeyword, bindUserPagination } = useBrowseQueryState();
    const { items, total, loading, error } = useProject({ page, size, keyword, sort });

    const navigate = useNavigate();

    useEffect(() => {
        if (!keyword.length) navigate("/project");
    }, [keyword, navigate]);

    if (!keyword.length) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-4 text-sm text-gray-700">
                검색어: <span className="font-medium">{keyword}</span>
                <Button variant="link" size="sm" className="ml-2" onClick={() => setKeyword("")}>검색어 지우기</Button>
            </div>
            <ProjectsSortBar value={sort} onChange={setSort} total={total} />
            {loading && <FundingLoader />}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <ProjectGrid items={items} />}

            <Pagination {...bindUserPagination(total)} />
        </div>
    );
}

export function ProjectsByCategoryPage() {
    const { ctgrId: catParam } = useParams();
    const ctgrId = catParam ? Number(catParam) : undefined;

    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, bindUserPagination } = useBrowseQueryState();
    const { items, total, loading, error } = useProject({ page, size, keyword, sort, ctgrId });

    if (!ctgrId) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProjectsCrumbs categories={categories} subcategories={subcategories} ctgrId={ctgrId} />
            <ProjectsCategoryChips categories={categories} activeCatId={ctgrId} />
            <ProjectsSubcategoryTabs ctgrId={ctgrId} subcategories={subcategories} activeSubId="all" />
            <ProjectsSortBar value={sort} onChange={setSort} total={total} />

            {loading && <FundingLoader />}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <ProjectGrid items={items} />}

            <Pagination {...bindUserPagination(total)} />
        </div>
    );
}

export function ProjectsBySubcategoryPage() {
    const { ctgrId: catParam, subctgrId: subParam } = useParams();
    const ctgrId = catParam ? Number(catParam) : undefined;
    const subctgrId = subParam ? Number(subParam) : undefined;

    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, bindUserPagination } = useBrowseQueryState();
    const { items, total, loading, error } = useProject({ page, size, keyword, sort, ctgrId, subctgrId });

    if (!ctgrId || !subctgrId) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProjectsCrumbs categories={categories} subcategories={subcategories} ctgrId={ctgrId} subctgrId={subctgrId} />
            <ProjectsCategoryChips categories={categories} activeCatId={ctgrId} />
            <ProjectsSubcategoryTabs ctgrId={ctgrId} subcategories={subcategories} activeSubId={subctgrId} />
            <ProjectsSortBar value={sort} onChange={setSort} total={total} />

            {loading && <FundingLoader />}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <ProjectGrid items={items} />}

            <Pagination {...bindUserPagination(total)} />
        </div>
    );
}
