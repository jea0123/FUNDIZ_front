
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, ChevronRight, ChevronLeft } from "lucide-react";
import { endpoints, getData } from "@/api/apis";
import type { Featured, RecentTop10, RecentView } from "@/types/projects";
import { toWonPlus, getDaysLeft } from "@/utils/utils";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

export const img = "https://gongu.copyright.or.kr/gongu/wrt/cmmn/wrtFileImageView.do?wrtSn=9046601&filePath=L2Rpc2sxL25ld2RhdGEvMjAxNC8yMS9DTFM2L2FzYWRhbFBob3RvXzI0MTRfMjAxNDA0MTY=&thumbAt=Y&thumbSe=b_tbumb&wrtTy=10004";

export default function Main() {
    const [cookie] = useCookies();
    const [featuredProjects, setFeaturedProjects] = useState<Featured[]>([]);

    /**
     * @description 주목할 만한 프로젝트 불러오기
     * @example
     * getFeaturedProjects();
     */
    const getFeaturedProjects = async () => {
        const response = await getData(endpoints.getFeatured);
        if (response.status === 200) {
            setFeaturedProjects(response.data);
        }
    };

    useEffect(() => {
        getFeaturedProjects();
    }, []);

    return (
        // TODO: max-w-[1160px] -> container
        <div className="mx-auto max-w-[1160px] px-4 py-6 space-y-10">
            {/* 좌측: Hero + 주목할 만한 프로젝트 / 우측: 인기 프로젝트 사이드바 */}
            {/* TODO: gap-15 -> gap-?? */}
            <div className="grid grid-cols-1 gap-15 lg:grid-cols-[1fr_320px] lg:items-start">
                <div className="space-y-8">
                    <Hero />

                    <section className="space-y-4 mt-0">
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-lg font-semibold md:text-xl">주목할 만한 프로젝트</h3>
                                <p className="text-sm text-muted-foreground">오늘 뜨는 프로젝트를 만나보세요.</p>
                            </div>
                            <Button variant="ghost" className="h-8 px-2 text-xs">
                                전체보기 <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-7 md:grid-cols-3 lg:grid-cols-4">
                            {featuredProjects.map((it) => (
                                <ProjectCard key={it.projectId} items={it} />
                            ))}
                        </div>
                    </section>
                </div>

                <PopularSidebar />
            </div>

            <Separator />

            {cookie.accessToken && (
                <RecentView title="최근 본 프로젝트" />
            )}
        </div>
    );
}

/* -------------------------------- Hero ----------------------------------- */
function Hero() {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="relative h-[220px] md:h-[260px] rounded-t-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center justify-between px-5 py-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-semibold leading-tight">메인메인 메인 메인메인 메인메인</h2>
                    <p className="mt-1 text-sm text-muted-foreground">소제목 소제목 소제목 소제목</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full border bg-background">1 / 5</span>
                    <Button size="icon" variant="secondary" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button size="icon" variant="secondary" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------ Popular Sidebar -------------------------- */
function PopularSidebar() {
    const navigate = useNavigate();

    const [recentProjects, setRecentProjects] = useState<RecentTop10[]>([]);

    /**
     * @description 인기 프로젝트 불러오기
     * @example
     * getRecentProjects();
     */
    const getRecentProjects = async () => {
        const response = await getData(endpoints.getRecentTop10);
        if (response.status === 200) {
            setRecentProjects(response.data);
        }
    };

    useEffect(() => {
        getRecentProjects();
    }, []);

    /**
     * @description 카드 클릭 핸들러
     * @param {number} projectId - 프로젝트 ID
     * @example
     * onClickCard(1);
     */
    function onClickCard(projectId: number) {
        navigate(`/project/${projectId}`);
    }

    return (
        // TODO: pl-7 -> pl-??
        <aside className="rounded-xl border bg-card p-4 pl-7 h-full flex flex-col">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">인기 프로젝트</h3>
                <Button variant="ghost" className="h-6 px-1 text-xs">전체보기</Button>
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground">{new Date().toLocaleString()} 기준</p>

            <div className="space-y-5">
                {recentProjects.length == 0 && <p className="text-sm text-muted-foreground">인기 프로젝트이 없습니다.</p>}
                {recentProjects.length > 0 && recentProjects.map((it, idx) => (
                    <div key={it.projectId} className="flex gap-3 cursor-pointer" onClick={() => onClickCard(it.projectId)}>
                        {/* 썸네일 */}
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted group">
                            {/* <img src={it.thumbnail} className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-115" /> */}
                            <img src={img} className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-115" />
                        </div>

                        {/* 정보 */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="font-bold text-red-600">{idx + 1}</span>
                                <span className="truncate">{it.creatorName ?? "크리에이터"}</span>
                            </div>
                            <p className="line-clamp-2 text-sm font-medium leading-snug">{it.title}</p>
                            <div className="mt-1 font-semibold text-red-600 flex flex-wrap gap-2 text-xs">{it.percentNow}% 달성</div>
                            <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-bold whitespace-nowrap h-[18px]">
                                <div className="text-muted-foreground px-2 bg-[#f0f0f0]">{toWonPlus(it.currAmount)}</div>
                                <div className="text-muted-foreground px-2 bg-[#f0f0f0]">{getDaysLeft(it.endDate)}일 남음</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}

/* ------------------------------- Recent View ---------------------------- */
export function RecentView({ title, perRow = 5, }: { title?: string; perRow?: number; }) {
    const [recentView, setRecentView] = useState<RecentView[]>([]);

    const pages = useMemo(() => chunk(recentView ?? [], perRow), [recentView, perRow]);
    const [page, setPage] = useState(0);
    const [cookie] = useCookies();

    /**
     * @description 최근 본 프로젝트 불러오기
     * @example
     * getRecentViewProjects();
     */
    const getRecentViewProjects = async () => {
        const response = await getData(endpoints.getRecentView, cookie.accessToken);
        if (response.status === 200) {
            setRecentView(response.data);
        }
    };

    useEffect(() => {
        getRecentViewProjects();
    }, [cookie.accessToken]);

    const canPrev = page > 0;
    const canNext = page < Math.max(pages.length - 1, 0);

    const goPrev = useCallback(() => canPrev && setPage(p => p - 1), [canPrev]);
    const goNext = useCallback(() => canNext && setPage(p => p + 1), [canNext]);

    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
        };
        el.addEventListener("keydown", onKey);
        return () => el.removeEventListener("keydown", onKey);
    }, [goPrev, goNext]);

    if(!recentView || recentView.length === 0) return <></>;

    return (
        <section className="space-y-4" ref={wrapRef} tabIndex={0}>
            <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold">{title}</h4>
                {pages.length > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {page + 1} / {pages.length}
                        </span>
                        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={goPrev} disabled={!canPrev} aria-label="이전">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={goNext} disabled={!canNext} aria-label="다음">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            {/* 슬라이더 */}
            <div className="relative overflow-hidden">
                <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${page * 100}%)` }}>
                    {pages.map((group, idx) => (
                        <div key={idx} className="w-full shrink-0 px-0">
                            {/* TODO: gap-10 -> gap-?? */}
                            <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-5">
                                {group.map((it) => (
                                    <ProjectCard items={it} key={it.projectId} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------- Project Card ---------------------------- */
export function ProjectCard({ items }: { items: any; }) {
    const navigate = useNavigate();

    function onClickCard(projectId: number) {
        navigate(`/project/${projectId}`);
    }
    if (!items) return
    <></>;
    {
        return (
            <div className="overflow-hidden cursor-pointer" onClick={() => onClickCard(items.projectId)}>
                <div className="relative aspect-[1] w-full overflow-hidden rounded-lg group">
                    {/* <img src={items.thumbnail} alt={items.title} className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-115" /> */}
                    <img src={img} alt={items.title} className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-115" />
                    <button aria-label="찜" className="absolute right-2 top-2 bg-transparent p-2">
                        <Heart className="h-4 w-4 text-white" />
                    </button>
                </div>
                <div className="space-y-1 py-3">
                    <p className="text-[11px] text-muted-foreground m-0">{items.creatorName}</p>
                    <p className="line-clamp-1 text-[14px] font-medium leading-snug text-ellipsis m-0">{items.title}</p>
                    <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="text-[14px] font-bold text-red-600 bg-none">{items.percentNow}% 달성</div>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-bold whitespace-nowrap h-[18px]">
                        {items.endDate && <span className="text-muted-foreground px-2 bg-[#f0f0f0]">{getDaysLeft(items.endDate)}일 남음</span>}
                        {items.currAmount && <span className="text-muted-foreground px-2 bg-[#f0f0f0]">{toWonPlus(items.currAmount)}</span>}
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * @description 배열을 청크 단위로 나누기
 * @param {T[]} arr 나눌 배열
 * @param {number} size 청크 크기
 * @returns {T[][]} 청크 배열
 */
function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}
