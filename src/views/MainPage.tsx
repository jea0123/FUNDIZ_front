
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { endpoints, getData } from "@/api/apis";
import type { Featured, RecentTop10, RecentView } from "@/types/projects";
import { toWonPlus, getDaysLeft } from "@/utils/utils";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import banner1 from "@/assets/images/banner1.webp";
import banner2 from "@/assets/images/banner2.webp";
import banner3 from "@/assets/images/banner3.webp";


export default function Main() {
    const [cookie] = useCookies();
    const [featuredProjects, setFeaturedProjects] = useState<Featured[]>([]);
    const navigate = useNavigate();

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
        <div className="mx-auto max-w-[1232px] py-6 space-y-5">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px] lg:items-start">
                <div className="divide-y divide-border">
                    <Hero />
                    <section className="space-y-6 pt-8">
                        <div className="border-b pb-3">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold md:text-xl">주목할 만한 프로젝트</h3>
                                </div>
                                <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => navigate("/project")}>
                                    전체보기 <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
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
            {cookie.accessToken && (
                <RecentView title="최근 본 프로젝트" />
            )}
        </div>
    );
}

function Hero() {
    const banners = [banner1, banner2, banner3];
    const [idx, setIdx] = useState(0);

    const next = useCallback(() => setIdx(i => (i + 1) % banners.length), [banners.length]);
    const prev = useCallback(() => setIdx(i => (i - 1 + banners.length) % banners.length), [banners.length]);

    useEffect(() => {
        // const t = setInterval(next, 5000); // 5초 자동 슬라이드
        // return () => clearInterval(t);
    }, [next]);


    return (
        <div className="relative h-[340px] overflow-hidden rounded-sm border bg-card shadow-sm">
            <div
                className="flex h-full w-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${idx * 100}%)` }}
            >
                {banners.map((src, i) => (
                    <img key={i} src={src} className="h-[340px] w-full shrink-0 object-cover" alt={`banner-${i + 1}`} draggable={false} />
                ))}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
                <Button size="icon" variant="secondary" className="pointer-events-auto h-8 w-8 opacity-90" onClick={prev} aria-label="이전">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="pointer-events-auto h-8 w-8 opacity-90" onClick={next} aria-label="다음">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                {banners.map((_, i) => (
                    <button key={i} onClick={() => setIdx(i)} aria-label={`배너 ${i + 1}`} className={`h-2 w-2 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`} />
                ))}
            </div>
        </div>
    );
}

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
        <aside className="rounded-sm h-full flex flex-col lg:border-l border-border lg:pl-10">
            <div className="mb-1 flex items-center justify-between">
                <h3 className="text-lg font-semibold">인기 프로젝트</h3>
                <Button variant="ghost" className="h-6 px-1 text-xs" onClick={() => navigate("/project")}>
                    전체보기
                </Button>
            </div>
            <p className="mb-3 text-[12px] text-muted-foreground">{new Date().toLocaleString()} 기준</p>

            <div className="rounded-sm">
                {recentProjects.length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">인기 프로젝트가 없습니다.</p>
                )}

                {recentProjects.length > 0 &&
                    recentProjects.map((it, idx) => (
                        <div key={it.projectId} className="flex gap-4 cursor-pointer py-2" >
                            <div className="relative w-28 h-28 shrink-0 overflow-hidden rounded-md bg-muted group">
                                <img
                                    src={it.thumbnail}
                                    className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                                    onClick={() => onClickCard(it.projectId)}
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
                                    <span className="font-bold text-red-600">{idx + 1}</span>
                                    <span className="truncate text-[10px] z-100 hover:underline" onClick={() => navigate(`/creator/${it.creatorId}`)}>{it.creatorName ?? "크리에이터"}</span>
                                </div>

                                <p className="line-clamp-2 text-base text-[14px] font-normal leading-relaxed">
                                    {it.title}
                                </p>
                                <div className="mt-1 font-medium text-red-600 text-sm">{it.percentNow}% 달성</div>
                                <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold whitespace-nowrap h-[22px]">
                                    <div className="text-muted-foreground px-2 py-[2px] bg-[#f0f0f0] rounded">
                                        {toWonPlus(it.currAmount)}
                                    </div>
                                    <div className="text-muted-foreground px-2 py-[2px] bg-[#f0f0f0] rounded">
                                        {getDaysLeft(it.endDate)}일 남음
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </aside>
    );
}

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
        const response = await getData(endpoints.getRecentView(), cookie.accessToken);
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

    if (!recentView || recentView.length === 0) return <></>;

    return (
        <section className="space-y-6" ref={wrapRef} tabIndex={0}>
            <Separator />
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">{title}</h4>
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

export function ProjectCard({ items }: { items: any; }) {
    const navigate = useNavigate();

    function onClickCard(projectId: number) {
        navigate(`/project/${projectId}`);
    }
    if (!items) return
    <></>;
    {
        return (
            <div className="overflow-hidden cursor-pointer">
                <div className="relative aspect-[1] w-full overflow-hidden rounded-sm group" onClick={() => onClickCard(items.projectId)}>
                    <img src={items.thumbnail} alt={items.title} className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-115" />
                </div>
                <div className="space-y-1 py-3">
                    <p className="text-[11px] text-muted-foreground m-0 z-100 hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/creator/${items.creatorId}`); }}>{items.creatorName}</p>
                    <p className="line-clamp-1 text-sm leading-snug text-ellipsis m-0">{items.title}</p>
                    <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="text-[14px] font-medium text-red-600 bg-none">{items.percentNow}% 달성</div>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-bold whitespace-nowrap h-[18px]">
                        <span className="text-muted-foreground px-1 bg-[#f0f0f0]">{getDaysLeft(items.endDate)}일 남음</span>
                        <span className="text-muted-foreground px-1 bg-[#f0f0f0]">{toWonPlus(items.currAmount)}</span>
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
export function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}
