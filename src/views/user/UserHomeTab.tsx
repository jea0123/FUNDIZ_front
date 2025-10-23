import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Heart, Bell, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { endpoints, getData } from "@/api/apis";
import type { Featured } from "@/types/projects";
import { useNavigate } from "react-router-dom";
import { useLoginUserStore } from "@/store/LoginUserStore.store";
import { useCookies } from "react-cookie";

type Stat = { label: string; value: number | string; href: string | null; icon: ReactNode };

export default function UserHomeTab() {
    const { loginUser, resetLoginUser } = useLoginUserStore();
    const [cookie, setCookie] = useCookies();

    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("user");
    const [stats, setStats] = useState({ backingCnt: 0, likeCnt: 0, followCnt: 0, notiCnt: 0 });

    const [recentViews, setRecentViews] = useState<Featured[]>([]);
    const [recommended, setRecommended] = useState<Featured[]>([]);

    const perRow = 5;
    const rvPages = useMemo(() => chunk(recentViews ?? [], perRow), [recentViews]);
    const recPages = useMemo(() => chunk(recommended ?? [], perRow), [recommended]);

    const [rvPage, setRvPage] = useState(0);
    const [recPage, setRecPage] = useState(0);

    const rvWrapRef = useRef<HTMLDivElement>(null);
    const recWrapRef = useRef<HTMLDivElement>(null);

    const rvCanPrev = rvPage > 0;
    const rvCanNext = rvPage < Math.max(rvPages.length - 1, 0);
    const recCanPrev = recPage > 0;
    const recCanNext = recPage < Math.max(recPages.length - 1, 0);

    const rvPrev = useCallback(() => rvCanPrev && setRvPage((p) => p - 1), [rvCanPrev]);
    const rvNext = useCallback(() => rvCanNext && setRvPage((p) => p + 1), [rvCanNext]);
    const recPrev = useCallback(() => recCanPrev && setRecPage((p) => p - 1), [recCanPrev]);
    const recNext = useCallback(() => recCanNext && setRecPage((p) => p + 1), [recCanNext]);

    const navigate = useNavigate();

    useEffect(() => {
        const keyHandler = (e: KeyboardEvent) => {
            if (document.activeElement === rvWrapRef.current) {
                if (e.key === "ArrowLeft") rvPrev();
                if (e.key === "ArrowRight") rvNext();
            }
            if (document.activeElement === recWrapRef.current) {
                if (e.key === "ArrowLeft") recPrev();
                if (e.key === "ArrowRight") recNext();
            }
        };
        document.addEventListener("keydown", keyHandler);
        return () => document.removeEventListener("keydown", keyHandler);
    }, [rvPrev, rvNext, recPrev, recNext]);

    useEffect(() => {
        if (loginUser == null || !cookie.accessToken) {
            alert('로그인이 필요합니다.');
            resetLoginUser();
            setCookie('accessToken', '', { path: '/' });
            location.href = '/auth/login';
        }
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const [summary, recent, featured] = await Promise.all([
                    getData(endpoints.getUserSummary, cookie.accessToken),
                    getData(endpoints.getRecentView(30), cookie.accessToken),
                    getData(endpoints.getFeatured)
                ]);
                if (!mounted) return;

                setUserName(loginUser?.nickname ?? "user");
                setStats({
                    backingCnt: summary?.data?.backingCount ?? 0,
                    likeCnt: summary?.data?.likedCount ?? 0,
                    followCnt: summary?.data?.followCreatorCount ?? 0,
                    notiCnt: summary?.data?.notificationCount ?? 0,
                });
                setRecentViews((recent?.data ?? []) as Featured[]);
                setRecommended((featured?.data ?? []) as Featured[]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [cookie.accessToken, loginUser?.nickname]);

    const quickStats: Stat[] = useMemo(
        () => [
            { label: "펀딩+", value: stats.backingCnt, href: "/user/support", icon: <Wallet className="h-4 w-4"/> },
            { label: "좋아요", value: stats.likeCnt, href: "/user/wishlist", icon: <Heart className="h-4 w-4" /> },
            { label: "팔로우", value: stats.followCnt, href: null, icon: <Users className="h-4 w-4" /> },
            { label: "알림", value: stats.notiCnt, href: "/user/notifications", icon: <Bell className="h-4 w-4" /> },
        ],
        [stats]
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">{userName}님, 서포터 활동을 이어가세요.</p>
                            <h2 className="text-xl font-semibold">마이페이지 메인</h2>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {quickStats.map((s) => (
                            <Card key={s.label} className="shadow-none border-muted">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {s.icon}
                                        <span>{s.label}</span>
                                    </div>
                                    <div className="mt-1 text-xl font-semibold cursor-pointer hover:underline w-max" onClick={() => s.href && navigate(s.href)}>{s.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <SliderSection
                refEl={rvWrapRef}
                title="최근 본 프로젝트"
                page={rvPage}
                pages={rvPages}
                canPrev={rvCanPrev}
                canNext={rvCanNext}
                onPrev={rvPrev}
                onNext={rvNext}
                loading={loading}
                emptyText="최근 본 프로젝트가 없습니다."
            />

            <SliderSection
                refEl={recWrapRef}
                title="추천 프로젝트"
                page={recPage}
                pages={recPages}
                canPrev={recCanPrev}
                canNext={recCanNext}
                onPrev={recPrev}
                onNext={recNext}
                loading={loading}
                emptyText="추천 프로젝트가 없습니다."
            />
        </div>
    );
}

function SliderSection({ refEl, title, page, pages, canPrev, canNext, onPrev, onNext, loading, emptyText, }: {
    refEl: RefObject<HTMLDivElement | null>; title: string; page: number; pages: Featured[][]; canPrev: boolean; canNext: boolean;
    onPrev: () => void; onNext: () => void; loading?: boolean; emptyText: string;
}) {
    if (!loading && (!pages || pages.length === 0)) {
        return (
            <Section title={title}>
                <EmptyCard text={emptyText} />
            </Section>
        );
    }

    return (
        <div className="space-y-2 mx-5">
            {pages.length > 0 && (
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">{title}</h3>
                    <div className="mb-3 flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">{page + 1} / {pages.length}</span>
                        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={onPrev} disabled={!canPrev} aria-label="이전">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={onNext} disabled={!canNext} aria-label="다음">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <div className="relative overflow-hidden" ref={refEl} tabIndex={0}>
                <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${page * 100}%)` }}>
                    {loading ? (
                        <div className="w-full shrink-0 px-0">
                            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
                                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        </div>
                    ) : (
                        pages.map((group, idx) => (
                            <div key={idx} className="w-full shrink-0 px-0">
                                <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
                                    {group.map((it) => <ProjectCard key={it.projectId} item={it} />)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="space-y-3 mx-5">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{title}</h3>
            </div>
            {children}
        </section>
    );
}

function SkeletonCard() {
    return (
        <div className="min-w-0">
            <div className="aspect-[1] w-full animate-pulse rounded-md bg-muted" />
            <div className="space-y-2 p-3">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-2 w-1/2 animate-pulse rounded bg-muted" />
            </div>
        </div>
    );
}

function EmptyCard({ text }: { text: string }) {
    return (
        <div className="min-w-0">
            <CardContent className="p-6 text-sm text-muted-foreground">{text}</CardContent>
        </div>
    );
}

function ProjectCard({ item }: { item: Featured }) {
    const navigate = useNavigate();
    if (!item) return null;

    return (
        <div
            className="overflow-hidden cursor-pointer"
            onClick={() => navigate(`/project/${item.projectId}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/project/${item.projectId}`)}
        >
            <div className={`relative w-full overflow-hidden bg-muted group aspect-[1] rounded-md`}>
                <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                    loading="lazy"
                />
            </div>

            <div className="space-y-1 py-1">
                <div className="flex items-center justify-between pt-1">
                    <div className={`text-[15px] font-medium text-red-600 bg-none`}>{Math.floor(item.percentNow)}% 달성</div>
                </div>
                <p className={`line-clamp-2 leading-snug text-[13px]`}>{item.title}</p>
            </div>
        </div>
    );
}

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}
