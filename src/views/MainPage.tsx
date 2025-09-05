import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, ChevronRight, ChevronLeft } from "lucide-react";
import { endpoints, getData } from "@/api/apis";
import type { Featured, RecentTop10 } from "@/types/projects";
import { toWonPlus, getDaysLeft } from "@/utils/utils";

export const img = "https://gongu.copyright.or.kr/gongu/wrt/cmmn/wrtFileImageView.do?wrtSn=9046601&filePath=L2Rpc2sxL25ld2RhdGEvMjAxNC8yMS9DTFM2L2FzYWRhbFBob3RvXzI0MTRfMjAxNDA0MTY=&thumbAt=Y&thumbSe=b_tbumb&wrtTy=10004";

export default function Main() {

    const mdPick = useMemo(
        () =>
            Array.from({ length: 15 }).map((_, i) => ({
                id: `md-${i}`,
                title: `MD Pick 카드 ${i + 1}`,
                creator: "크리에이터",
                percent: [83, 94, 120, 182, 88, 56, 213, 449][i % 8],
            })),
        []
    );

    const [recentProjects, setRecentProjects] = useState<RecentTop10[]>([]);
    const [featuredProjects, setFeaturedProjects] = useState<Featured[]>([]);

    useEffect(() => {
        const getRecentProjects = async () => {
            const response = await getData(endpoints.getRecentTop10);
            if (response.status === 200) {
                setRecentProjects(response.data);
            }
        };

        const getFeaturedProjects = async () => {
            const response = await getData(endpoints.getFeatured);
            if (response.status === 200) {
                setFeaturedProjects(response.data);
            }
        };

        getFeaturedProjects();
        getRecentProjects();
    }, []);

    return (
        <div className="mx-auto max-w-[1280px] px-4 py-6 space-y-10">
            {/* 좌측: Hero + 주목할 만한 프로젝트 / 우측: 인기 프로젝트 사이드바 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
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
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {featuredProjects.map((it) => (
                                <ProjectCard key={it.projectId} items={it} />
                            ))}
                        </div>
                    </section>
                </div>

                <PopularSidebar items={recentProjects} />
            </div>

            <Separator />

            {/* MD Pick: 5개씩 나열 */}
            <MDPickRows items={mdPick} perRow={5} title="MD Pick" />
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
function PopularSidebar({ items }: { items: RecentTop10[] }) {

    const top10 = useMemo(
        () => [...items].sort((a, b) => b.trendScore - a.trendScore).slice(0, 10),
        [items]
    );

    return (
        <aside className="rounded-xl border bg-card p-4 h-full flex flex-col">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">인기 프로젝트</h3>
                <Button variant="ghost" className="h-6 px-1 text-xs">전체보기</Button>
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground">{new Date().toLocaleString()} 기준</p>

            <div className="space-y-5">
                {top10.map((it, idx) => (
                    <div key={it.projectId} className="flex gap-3">
                        {/* 썸네일 */}
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                            {/* <img src={it.thumbnail} className="h-full w-full object-cover" /> */}
                            <img src={img} className="h-full w-full object-cover" />
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

/* ------------------------------- Project Card ---------------------------- */
function ProjectCard({ items }: { items: Featured }) {
    {
        return (
            <div className="overflow-hidden">
                <div className="relative aspect-[1] w-full">
                        {/* <img src={items.thumbnail} alt={items.title} className="h-full w-full object-cover rounded-lg" /> */}
                        <img src={img} alt={items.title} className="h-full w-full object-cover rounded-lg" />
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

/* ------------------------------- MD Pick Rows ---------------------------- */
function MDPickRows({
    items,
    perRow = 5,
    title,
}: {
    items: { id: string; title: string; creator: string; percent: number }[];
    perRow?: number;
    title?: string;
}) {
    const rows: typeof items[] = [];
    for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow));

    return (
        <section className="space-y-8">
            {rows.map((row, idx) => (
                <div key={`mdrow-${idx}`} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold">{title}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        {/* {row.map((it) => (
                            <ProjectCard key={it.id} {...it} />
                        ))} */}
                    </div>
                </div>
            ))}
        </section>
    );
}
