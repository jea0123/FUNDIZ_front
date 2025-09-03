import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, ChevronRight, ChevronLeft } from "lucide-react";

export default function Main() {
    const featured = useMemo(
        () =>
            Array.from({ length: 8 }).map((_, i) => ({
                id: `feat-${i}`,
                title: `주목 카드 타이틀 ${i + 1}`,
                creator: "크리에이터",
                percent: [50, 80, 90, 60, 88, 95, 70, 120][i % 8],
                goal: ["300만", "900만", "4천만", "7천만", "2천만", "3천만", "3천만", "6천만"][i % 8],
            })),
        []
    );

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

    const popular = useMemo(
        () =>
            Array.from({ length: 10 }).map((_, i) => ({
                id: `pop-${i}`,
                rank: i + 1,
                title: [
                    "진정·탄력·생기 한 병에, 4배 대용량",
                    "잡다해 쉬워져, 하지만 똑똑해진 [기계뷰]",
                    "호주 정원 설계의 거장에 도전해 보세요!",
                    "쿨한 밤으로 <자캐 커뮤니티 만들기>",
                    "9가지 선택! 147개 종지 작업 스샷",
                    "이어서 그려쓰는 로판 소재집",
                    "한국인의 특유의 누런끼를 겨울 톤으로",
                    "이름을 거둔 실반지, <쥬피드>",
                    "감성 가득 원목 다이어리",
                    "영화 같은 찰나 사진집"
                ][i % 10],
                percent: [160, 70, 69, 58, 52, 43, 17, 150, 96, 81][i % 10],
            })),
        []
    );

    return (
        <div className="mx-auto max-w-[1280px] px-4 py-6 space-y-10">
            {/* 좌측: Hero + 주목할 만한 프로젝트 / 우측: 인기 프로젝트 사이드바 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
                <div className="space-y-8">
                    <Hero />

                    <section className="space-y-4">
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
                            {featured.map((it) => (
                                <ProjectCard key={it.id} {...it} />
                            ))}
                        </div>
                    </section>
                </div>

                <PopularSidebar items={popular} />
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
                    <p className="mt-1 text-sm text-muted-foreground">소쩍쿄 소쩍쿄 소쩍쿄 소쩍쿄</p>
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
function PopularSidebar({
    items,
}: {
    items: { id: string; rank: number; title: string; percent: number; creator?: string; amount?: string }[];
}) {
    return (
        <aside className="rounded-xl border bg-card p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">인기 프로젝트</h3>
                <Button variant="ghost" className="h-6 px-1 text-xs">전체보기</Button>
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground">25.09.03 16:10 기준</p>
            <div className="space-y-5">
                {items.map((it) => (
                    <div key={it.id} className="flex gap-3">
                        {/* 썸네일 */}
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted" />

                        {/* 정보 */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="text-red-600 font-bold">{it.rank}</span>
                                <span className="truncate">{it.creator ?? "크리에이터"}</span>
                            </div>
                            <p className="line-clamp-2 text-sm font-medium leading-snug">{it.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-semibold text-red-600">{it.percent}% 달성</span>
                                <span className="text-muted-foreground">{it.amount ?? "930만+ 원"}</span>
                            </div>
                        </div>

                        {/* 하트 버튼 */}
                        <button aria-label="찜" className="shrink-0 self-start rounded-full p-1 hover:bg-muted">
                            <Heart className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    );
}

/* ------------------------------- Project Card ---------------------------- */
function ProjectCard({
    title,
    creator,
    percent,
    goal,
}: {
    title: string;
    creator: string;
    percent: number;
    goal?: string;
}) {
    return (
        <div className="overflow-hidden rounded-xl border">
            <div className="relative aspect-[1] w-full bg-indigo-600/90 dark:bg-indigo-500">
                <button aria-label="찜" className="absolute right-2 top-2 rounded-full bg-background/80 p-2 shadow">
                    <Heart className="h-4 w-4" />
                </button>
            </div>
            <div className="space-y-1 bg-muted px-4 py-3">
                <p className="line-clamp-1 text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{creator}</p>
                <div className="flex items-center justify-between pt-1 text-xs">
                    <Badge className="text-[10px]">{percent}% 달성</Badge>
                    {goal && <span className="text-muted-foreground">목표 {goal} 원</span>}
                </div>
            </div>
        </div>
    );
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
                        {row.map((it) => (
                            <ProjectCard key={it.id} {...it} />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}
