import { useEffect, useMemo, useState } from "react";
import { endpoints, getData } from "@/api/apis";
import type { Featured, SearchProjectParams } from "@/types/projects";
import { ProjectGrid, useCatalogData } from "./ProjectsBrowsePage";
import ProjectsSortBar from "./components/ProjectsSortBar";
import ProjectsCategoryChips from "./components/ProjectsCategoryChips";
import ProjectsCrumbs from "./components/ProjectsCrumbs";
import ProjectsSubcategoryTabs from "./components/ProjectsSubcategoryTabs";
import FundingLoader from "@/components/FundingLoader";
import { Pagination } from "@/utils/pagination";
import { useNavigate, useParams } from "react-router-dom";
import { useBrowseQueryState } from "@/utils/usePagingQueryState";
import { Button } from "@/components/ui/button";
import { getDday } from "@/utils/utils";

export function useUpcomingProjects(params: SearchProjectParams) {
    const { page, size, keyword, sort, ctgrId, subctgrId } = params;
    const [items, setItems] = useState<Featured[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<boolean>(false);

    const url = useMemo(() => {
        return endpoints.searchUpComingProjects({ page, size, keyword, sort, ctgrId, subctgrId });
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
                if (!cancel) setError(err);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [url]);

    return { items, total, loading, error };
}

export function UpcomingBrowsePage() {
    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, bindUserPagination } = useBrowseQueryState();
    const { items, total, loading, error } = useUpcomingProjects({ page, size, keyword, sort });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProjectsCrumbs categories={categories} subcategories={subcategories} label="오픈예정" />
            <ProjectsCategoryChips categories={categories} activeCatId="all" />
            <ProjectsSortBar value={sort} onChange={setSort} total={total} />
            {loading && <FundingLoader />}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <UpcomingProjectGrid items={items} />}
            <Pagination {...bindUserPagination(total)} />
        </div>
    );
}

export function UpcomingSearchPage() {
    const { sort, page, size, keyword, setSort, setKeyword, bindUserPagination } = useBrowseQueryState();
    const { items, total, loading, error } = useUpcomingProjects({ page, size, keyword, sort });
    const navigate = useNavigate();

    useEffect(() => { if (!keyword.length) navigate("/project/upcoming"); }, [keyword, navigate]);
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
            {!loading && !error && <UpcomingProjectGrid items={items} />}
            <Pagination {...bindUserPagination(total)} />
        </div>
    );
}

export function UpcomingByCategoryPage() {
    const { ctgrId: catParam } = useParams();
    const ctgrId = catParam ? Number(catParam) : undefined;

    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, bindUserPagination } = useBrowseQueryState();
    const { items, total, loading, error } = useUpcomingProjects({ page, size, keyword, sort, ctgrId });
    if (!ctgrId) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProjectsCrumbs categories={categories} subcategories={subcategories} ctgrId={ctgrId} label="오픈예정" />
            <ProjectsCategoryChips categories={categories} activeCatId={ctgrId} />
            <ProjectsSubcategoryTabs ctgrId={ctgrId} subcategories={subcategories} activeSubId="all" />
            <ProjectsSortBar value={sort} onChange={setSort} total={total} />
            {loading && <FundingLoader />}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <UpcomingProjectGrid items={items} />}
            <Pagination {...bindUserPagination(total)} />
        </div>
    );
}

export function UpcomingBySubcategoryPage() {
    const { ctgrId: catParam, subctgrId: subParam } = useParams();
    const ctgrId = catParam ? Number(catParam) : undefined;
    const subctgrId = subParam ? Number(subParam) : undefined;

    const { categories, subcategories } = useCatalogData();
    const { sort, page, size, keyword, setSort, bindUserPagination } = useBrowseQueryState();
    const { items, total, loading, error } = useUpcomingProjects({ page, size, keyword, sort, ctgrId, subctgrId });
    if (!ctgrId || !subctgrId) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProjectsCrumbs categories={categories} subcategories={subcategories} ctgrId={ctgrId} subctgrId={subctgrId} label="오픈예정" />
            <ProjectsCategoryChips categories={categories} activeCatId={ctgrId} />
            <ProjectsSubcategoryTabs ctgrId={ctgrId} subcategories={subcategories} activeSubId={subctgrId} />
            <ProjectsSortBar value={sort} onChange={setSort} total={total} />
            {loading && <FundingLoader />}
            {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
            {!loading && !error && <UpcomingProjectGrid items={items} />}
            <Pagination {...bindUserPagination(total)} />
        </div>
    );
}

export function UpcomingProjectGrid({ items }: { items: Featured[] }) {
    if (!items?.length) {
        return <p className="py-10 text-center text-sm text-muted-foreground">공개예정 프로젝트가 없습니다.</p>;
    }
    return (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {items.map((it) => (
                <UpcomingProjectCard key={it.projectId} item={it} />
            ))}
        </div>
    );
}

export function UpcomingProjectCard({ item }: { item: Featured }) {
    const navigate = useNavigate();
    if (!item) return null;

    return (
        <div className="overflow-hidden cursor-pointer" onClick={() => navigate(`/project/${item.projectId}`)}>
            <div className="relative aspect-[1] w-full overflow-hidden rounded-sm group">
                <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-115"
                />

            </div>

            <div className="space-y-1 py-3">
                <p
                    className="text-[11px] text-muted-foreground m-0 hover:underline"
                    onClick={(e) => { e.stopPropagation(); navigate(`/creator/${item.creatorId}`); }}
                >
                    {item.creatorName}
                </p>
                <p className="line-clamp-1 text-sm leading-snug m-0">{item.title}</p>
                <span className="rounded-sm bg-red-600 px-2 py-0.5 text-[12px] font-bold text-white">
                    {getDday(item.startDate)}
                </span>
            </div>
        </div>
    );
}
