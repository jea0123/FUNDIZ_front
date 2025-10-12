import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Share2, Calendar, Users, MessageCircle, Star, MessageSquarePlus, Pencil } from 'lucide-react';
import type { ProjectDetail } from '@/types/projects';
import { endpoints, getData, postData } from '@/api/apis';
import { useLocation, useParams } from 'react-router-dom';
import { formatDate, getDaysBefore, getDaysLeft } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import type { Reward } from '@/types/reward';
import FundingLoader from '@/components/FundingLoader';
import type { CommunityDto, Cursor, CursorPage, ReviewDto } from '@/types/community';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const CM_MAX = 1000;
const getByteLen = (s: string) => new TextEncoder().encode(s).length;
const formatCurrency = (amount: number) => { return new Intl.NumberFormat('ko-KR').format(amount); };

export function ProjectDetailPage() {

    /* ----------------------------- Router helpers ----------------------------- */

    const navigate = useNavigate();
    const location = useLocation();
    const { projectId } = useParams();

    /* --------------------------------- Auth helper ---------------------------------- */

    const ensureLogin = useCallback(() => {
        const token = localStorage.getItem("access_token");
        // if (!token) {
        //     navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
        //     return false;
        // }
        return true; //TODO: 임시 우회 나중에 위 주석 풀기
    }, [/* navigate, location.pathname, location.search */])

    /* --------------------------------- Refs ---------------------------------- */

    const cartRef = useRef<HTMLDivElement>(null);
    const communitySentinelRef = useRef<HTMLDivElement | null>(null);
    const reviewSentinelRef = useRef<HTMLDivElement | null>(null);

    // 중복 호출 방지용 락
    const communityLoadingLockRef = useRef(false);
    const reviewLoadingLockRef = useRef(false);

    // 글자수 초과 알림 1회 제한
    const exceededAlertedRef = useRef(false);

    /* --------------------------------- State --------------------------------- */

    const [project, setProject] = useState<ProjectDetail>();
    const [community, setCommunity] = useState<CommunityDto[]>([]);
    const [communityCursor, setCommunityCursor] = useState<Cursor | null>(null);
    const [review, setReview] = useState<ReviewDto[]>([]);
    const [reviewCursor, setReviewCursor] = useState<Cursor | null>(null);
    const [tab, setTab] = useState<"description" | "news" | "community" | "review">("description");
    const [isLiked, setIsLiked] = useState(false);

    const [loadingProject, setLoadingProject] = useState(false);
    const [loadingCommunity, setLoadingCommunity] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);

    const [cart, setCart] = useState<Record<number, number>>({});
    const [cartPing, setCartPing] = useState(false);
    const [qtyByReward, setQtyByReward] = useState<Record<number, number>>({});

    // 커뮤니티 글쓰기
    const [openCm, setOpenCm] = useState(false);
    const [cmContent, setCmContent] = useState("");
    const [postingCm, setPostingCm] = useState(false);

    /* ------------------------------- Derived ---------------------------------- */

    const cartSummary = useMemo(() => {
        if (!project) return { totalQty: 0, totalAmount: 0 };
        let totalQty = 0, totalAmount = 0;
        for (const [ridStr, qty] of Object.entries(cart)) {
            const rid = Number(ridStr);
            const r = project.rewardList.find(rr => rr.rewardId === rid);
            if (!r) continue;
            totalQty += qty;
            totalAmount += r.price * qty;
        }
        return { totalQty, totalAmount };
    }, [project, cart]);

    /* ----------------------------- Data fetchers ----------------------------- */

    const projectData = useCallback(async () => {
        if (!projectId) return;
        setLoadingProject(true);
        try {
            const response = await getData(endpoints.getProjectDetail(Number(projectId)));
            if (response.status === 200) {
                setProject(response.data);
            }
        } finally {
            setLoadingProject(false);
        }
    }, [projectId]);

    const communityData = useCallback(async (cursor: Cursor | null) => {
        if (!projectId) return;
        setLoadingCommunity(true);
        try {
            const params = new URLSearchParams();
            if (cursor) {
                if (cursor.lastCreatedAt) params.set("lastCreatedAt", cursor.lastCreatedAt);
                if (cursor.lastId != null) params.set("lastId", String(cursor.lastId));
            }
            params.set("size", "10");

            const url = `${endpoints.getCommunityList(Number(projectId))}?${params.toString()}`
            const { status, data } = await getData(url);

            if (status !== 200 || !data) {
                if (!cursor) setCommunity([]); //첫 로드 실패하면 초기화
                setCommunityCursor(null);
                return;
            }
            const page = data as CursorPage<CommunityDto>;
            const items = Array.isArray(page?.items) ? page.items : [];
            setCommunity(prev => (cursor ? [...prev, ...items] : items)); //커서 있으면 append, 없으면 replace
            setCommunityCursor(page?.nextCursor ?? null);
        } finally {
            setLoadingCommunity(false);
        }
    }, [projectId]);

    const reviewData = useCallback(async (cursor: Cursor | null) => {
        if (!projectId) return;
        setLoadingReview(true);
        try {
            const params = new URLSearchParams();
            if (cursor) {
                if (cursor.lastCreatedAt) params.set("lastCreatedAt", cursor.lastCreatedAt);
                if (cursor.lastId != null) params.set("lastId", String(cursor.lastId));
            }
            params.set("size", "10");

            const url = `${endpoints.getReviewList(Number(projectId))}?${params.toString()}`;
            const { status, data } = await getData(url);

            if (status !== 200 || !data) {
                if (!cursor) setReview([]); //첫 로드 실패하면 초기화
                setReviewCursor(null);
                return;
            }
            const page = data as CursorPage<ReviewDto>;
            const items = Array.isArray(page?.items) ? page.items : [];
            setReview(prev => (cursor ? [...prev, ...items] : items)); //커서 있으면 append, 없으면 replace
            setReviewCursor(page.nextCursor ?? null);
        } finally {
            setLoadingReview(false);
        }
    }, [projectId]);

    /* ------------------------------- UI handlers ---------------------------------- */

    /* START 리워드 카트 */
    const getRemain = useCallback((r: Reward) => (r.rewardCnt > 0 ? Math.max(0, r.remain) : 99), []);

    const incQty = useCallback((rewardId: number, max: number) => {
        setQtyByReward(prev => ({ ...prev, [rewardId]: Math.min((prev[rewardId] ?? 1) + 1, max) }));
    }, []);

    const decQty = useCallback((rewardId: number) => {
        setQtyByReward(prev => ({ ...prev, [rewardId]: Math.max(1, (prev[rewardId] ?? 1) - 1) }));
    }, []);

    const addToCart = useCallback((reward: Reward, qtyToAdd: number) => {
        if (qtyToAdd <= 0) return;
        const remain = getRemain(reward);
        setCart(prev => {
            const current = prev[reward.rewardId] ?? 0;
            const nextQty = Math.min(remain, current + qtyToAdd);
            return { ...prev, [reward.rewardId]: nextQty };
        });

        requestAnimationFrame(() => {
            cartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            setCartPing(true);
            setTimeout(() => setCartPing(false), 800);
        });
        setQtyByReward(prev => ({ ...prev, [reward.rewardId]: 1 }));
    }, [getRemain]);

    const setCartQty = useCallback((rewardId: number, nextQty: number) => {
        setCart(prev => {
            if (nextQty <= 0) {
                const { [rewardId]: _, ...rest } = prev;
                return rest;
            }
            const reward = project?.rewardList.find(r => r.rewardId === rewardId);
            const remain = reward ? getRemain(reward) : 1;
            return { ...prev, [rewardId]: Math.min(remain, nextQty) };
        });
    }, [project, getRemain]);

    const removeFromCart = useCallback((rewardId: number) => {
        setCart(prev => {
            const { [rewardId]: _, ...rest } = prev;
            return rest;
        });
    }, []);
    /* END 리워드 카트 */

    // 후원하기
    const handleCheckout = useCallback(() => {
        if (!projectId) return;
        const entries = Object.entries(cart).filter(([_, q]) => q > 0);
        if (entries.length === 0) return;
        const items = entries.map(([rid, q]) => `${rid}x${q}`).join(",");
        const params = new URLSearchParams();
        params.set("items", items);
        navigate(`/project/${projectId}/backing?${params.toString()}`);
    }, [cart, navigate, projectId]);

    // 링크 복사
    const handleShare = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다.');
    }, []);

    // 커뮤니티 모달
    const openCommunityModal = useCallback(() => {
        if (!projectId) return;
        if (!ensureLogin()) return;
        setOpenCm(true);
    }, [projectId, ensureLogin]);

    // 커뮤니티 글자수
    const handleChangeCm = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let next = e.target.value;
        if (getByteLen(next) <= CM_MAX) {
            setCmContent(next);
            return;
        }

        // 초과: 잘라내기
        while (getByteLen(next) > CM_MAX) {
            next = next.slice(0, -1);
        }
        setCmContent(next);

        if (!exceededAlertedRef.current) {
            exceededAlertedRef.current = true;
            alert("최대 (한글 약 330자)까지 입력할 수 있습니다.");
        }
    }, []);

    const handleTextareaFocus = useCallback(() => {
        exceededAlertedRef.current = false; // 포커스 때 리셋
    }, []);

    // 커뮤니티 등록
    const handleSubmitCommunity = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!projectId) return;
        if (!ensureLogin()) return;

        const content = cmContent.trim();
        if (content.length === 0) {
            alert("내용을 입력하세요.");
            return;
        }
        if (getByteLen(content) > CM_MAX) {
            alert("내용은 (한글 약 330자) 이내로 입력해 주세요.");
            return;
        }

        setPostingCm(true);
        try {
            const url = endpoints.postCommunity(Number(projectId));
            const body = { cmContent };
            const response = await postData(url, body);
            if (response.status === 200) {
                setOpenCm(false);
                setCmContent(""); //초기화

                // 커서를 리셋하고 첫 페이지 다시 로드
                setCommunity([]);
                setCommunityCursor(null);
                await communityData(null);
            } else {
                alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        } catch (err) {
            console.error(err);
            alert("네트워크 오류가 발생했습니다.");
        } finally {
            setPostingCm(false);
        }
    }, [projectId, ensureLogin, cmContent, communityData]);

    // 후기 페이지
    const handleWriteReview = useCallback(() => {
        if (!projectId || !project) return;
        if (!ensureLogin()) return;

        //TODO: 후원자 전용 가드 (나중에 주석 해제)
        // if (!project.isBackedByMe) {
        //     alert("후원자만 작성할 수 있습니다.");
        //     return;
        // }
        // if (!project.canWriteReview) {
        //     alert("아직 후기를 작성할 수 있는 상태가 아닙니다.");
        //     return;
        // }
    }, [projectId, project, ensureLogin]);

    /* -------------------------------- Effects -------------------------------- */

    useEffect(() => {
        projectData();
        setCommunity([]);
        setCommunityCursor(null);
        communityData(null);

        setReview([]);
        setReviewCursor(null);
        reviewData(null);
    }, [projectId, projectData, communityData, reviewData]);

    useEffect(() => {
        if (tab !== "community") return; //옵저버 탭이 켜졌을 때만 붙이기
        const el = communitySentinelRef.current;
        if (!el || !communityCursor || loadingCommunity) return;

        const io = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting && !communityLoadingLockRef.current) {
                communityLoadingLockRef.current = true;
                communityData(communityCursor).finally(() => {
                    communityLoadingLockRef.current = false;
                });
            }
        }, { root: null, rootMargin: "300px", threshold: 0.01 });

        io.observe(el);
        return () => io.disconnect();
    }, [tab, communityCursor, loadingCommunity, communityData]);

    useEffect(() => {
        if (tab !== "review") return; //옵저버 탭이 켜졌을 때만 붙이기
        const el = reviewSentinelRef.current;
        if (!el || !reviewCursor || loadingReview) return;

        const io = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting && !reviewLoadingLockRef.current) {
                reviewLoadingLockRef.current = true;
                reviewData(reviewCursor).finally(() => {
                    reviewLoadingLockRef.current = false;
                });
            }
        }, { root: null, rootMargin: "300px", threshold: 0.01 });

        io.observe(el);
        return () => io.disconnect();
    }, [tab, reviewCursor, loadingReview, reviewData]);

    /* --------------------------------- Render --------------------------------- */

    if (!projectId || !project || loadingProject) {
        return <FundingLoader />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="relative mb-6">
                        <ImageWithFallback
                            src={project.thumbnail}
                            alt={project.title}
                            className="w-full h-96 object-cover rounded-lg"
                        />
                        <div className="absolute top-4 right-4 flex space-x-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsLiked(!isLiked)}
                                className={isLiked ? 'text-red-500' : ''}
                            >
                                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="ml-1">{project.likeCnt}</span>
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleShare}>
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary">{project.ctgrName}</Badge>
                            <Badge variant="secondary">{project.subctgrName}</Badge>
                            {project.tagList.map((tag) => (
                                <Badge key={tag.tagId} variant="outline">
                                    {tag.tagName}
                                </Badge>
                            ))}
                        </div>
                        <h1 className="text-3xl mb-3">{project.title}</h1>

                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <Avatar>
                                <AvatarImage src={project.profileImg} />
                                <AvatarFallback>{project.creatorName}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h4 className="font-semibold">{project.creatorName}</h4>
                                <p className="text-sm text-gray-600">
                                    팔로워 {formatCurrency(project.followerCnt)}명 · 프로젝트 {project.projectCnt}개
                                </p>
                            </div>
                            <Button variant="outline" size="sm">팔로우</Button>
                            <Button variant="outline" size="sm">문의하기</Button>
                        </div>
                    </div>

                    <Tabs defaultValue="description" className="mb-8" onValueChange={(v) => setTab(v as any)}>
                        <TabsList className="grid w-full grid-cols-4 gap-2">
                            <TabsTrigger value="description" className="min-w-0 flex items-center justify-center gap-1 truncate">
                                <span className="truncate">프로젝트 소개</span>
                            </TabsTrigger>

                            <TabsTrigger value="news" className="min-w-0 flex items-center justify-center gap-1 truncate">
                                <span className="truncate">새소식</span>
                                <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                                    {project.newsList.length}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger value="community" className="min-w-0 flex items-center justify-center gap-1 truncate">
                                <span className="truncate">커뮤니티</span>
                                <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                                    {community.length}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger value="review" className="min-w-0 flex items-center justify-center gap-1 truncate">
                                <span className="truncate">후기</span>
                                <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                                    {review.length}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="mt-6">
                            <div
                                className="prose max-w-none whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere]"
                                dangerouslySetInnerHTML={{ __html: project.content }}
                            />
                        </TabsContent>

                        <TabsContent value="news">
                            {project.newsList.length == 0 ? (
                                <div className="text-sm text-muted-foreground">게시글이 존재하지 않습니다.</div>
                            ) : (
                                <>
                                    {project.newsList.map((news) => (
                                        <div key={news.newsId} className="space-y-4 mt-6">
                                            <Card>
                                                <CardContent>
                                                    <div className="whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere]">
                                                        {news.content}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-2">{formatDate(news.createdAt)}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="community">
                            <div className="flex items-center justify-between mt-2">
                                <div className="text-sm text-muted-foreground">
                                    커뮤니티 <span className="font-medium text-foreground">{community.length}</span>개
                                </div>
                                <Button size="sm" onClick={openCommunityModal}>
                                    글쓰기
                                </Button>
                            </div>

                            <Dialog open={openCm} onOpenChange={setOpenCm}>
                                <DialogContent className="w-[min(92vw,40rem)] sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>커뮤니티 글쓰기</DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">프로젝트에 대한 응원, 소식을 공유해보세요.</span>
                                            <span className="text-xs text-gray-500">약 {cmContent.length}자</span>
                                        </div>

                                        <Textarea
                                            value={cmContent}
                                            onChange={handleChangeCm}
                                            onFocus={handleTextareaFocus}
                                            placeholder="내용을 입력하세요."
                                            className="min-h-[120px] w-full max-w-full resize-y overflow-auto break-words [overflow-wrap:anywhere] [word-break:break-word]"
                                        />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <Button variant="outline" onClick={() => setOpenCm(false)} disabled={postingCm}>취소</Button>
                                        <Button onClick={handleSubmitCommunity} disabled={postingCm || cmContent.trim().length === 0}>
                                            {postingCm ? "등록중" : "등록"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {!Array.isArray(community) || community.length == 0 ? (
                                <div className="mt-4 rounded-lg border p-6 text-center">
                                    <p className="text-sm text-muted-foreground mb-3">게시글이 존재하지 않습니다.</p>
                                    <Button size="sm" onClick={openCommunityModal}>
                                        <MessageSquarePlus className="h-4 w-4 mr-1" /> 첫 글 남기기
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {community.map((cm) => (
                                        <div key={cm.cmId} className="space-y-4 mt-6">
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start space-x-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback>{cm.profileImg}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className="font-medium truncate">{cm.nickname}</span>
                                                                <span className="text-sm text-gray-500">{getDaysBefore(cm.createdAt)} 전</span>
                                                            </div>
                                                            <p className="text-sm w-full max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                                                {cm.cmContent}
                                                            </p>
                                                            <div className="flex items-center space-x-2 mt-2">
                                                                <Button variant="ghost" size="sm">
                                                                    <MessageCircle className="h-3 w-3 mr-1" />
                                                                    댓글
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}

                                    {loadingCommunity && (
                                        <div className="mt-4 space-y-2">
                                            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                                            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                                        </div>
                                    )}

                                    {communityCursor && <div ref={communitySentinelRef} className="h-1 w-full" />}
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="review">
                            <TooltipProvider>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="text-sm text-muted-foreground">
                                        후기 <span className="font-medium text-foreground">{review.length}</span>개
                                    </div>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    size="sm"
                                                    onClick={handleWriteReview}
                                                    disabled={!project?.isBackedByMe || !project?.canWriteReview}
                                                >
                                                    후기 작성
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {!project?.isBackedByMe ? (
                                            <TooltipContent>후원자만 작성할 수 있습니다</TooltipContent>
                                        ) : !project?.canWriteReview ? (
                                            <TooltipContent>아직 후기를 작성할 수 있는 상태가 아닙니다</TooltipContent>
                                        ) : null}
                                    </Tooltip>
                                </div>
                            </TooltipProvider>

                            {review.length == 0 ? (
                                <div className="mt-4 rounded-lg border p-6 text-center">
                                    <p className="text-sm text-muted-foreground mb-3">게시글이 존재하지 않습니다.</p>
                                    <Button size="sm" onClick={handleWriteReview}>
                                        <Pencil className="h-4 w-4 mr-1" />
                                        첫 후기 남기기
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {review.map((rv) => (
                                        <div key={rv.cmId} className="space-y-4 mt-6">
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start space-x-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback>{rv.profileImg}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className="font-medium">{rv.nickname}</span>
                                                                <div className="flex items-center">
                                                                    {[...Array(rv.rating)].map((_, i) => (
                                                                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm text-gray-500">{getDaysBefore(rv.createdAt)} 전</span>
                                                            </div>
                                                            <p className="text-sm">{rv.cmContent}</p>
                                                            <div className="flex items-center space-x-2 mt-2">
                                                                <Button variant="ghost" size="sm">
                                                                    <MessageCircle className="h-3 w-3 mr-1" />
                                                                    댓글
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}

                                    {loadingReview && (
                                        <div className="mt-4 space-y-2">
                                            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                                            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                                        </div>
                                    )}

                                    {reviewCursor && <div ref={reviewSentinelRef} className="h-1 w-full" />}
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="lg:col-span-1">
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-2xl font-bold text-blue-600">{project.percentNow}%</span>
                                            <span className="text-sm text-gray-500">달성</span>
                                        </div>
                                        <Progress value={project.percentNow} className="h-3 mb-3" />
                                        <div className="text-xl font-bold">{formatCurrency(project.currAmount)}원</div>
                                        <div className="text-sm text-gray-500">목표 {formatCurrency(project.goalAmount)}원</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center mb-1">
                                                <Users className="h-4 w-4 mr-1" />
                                                <span className="font-semibold">{project.backerCnt}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">후원자</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center mb-1">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                <span className="font-semibold">{getDaysLeft(project.endDate)}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">일 남음</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">펀딩 기간</span>
                                            <span>{formatDate(project.startDate)} ~ {formatDate(project.endDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">결제일</span>
                                            <span>{formatDate(project.paymentDate)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            ref={cartRef}
                            className={`bt-white transition ${cartPing ? "ring-2 ring-blue-500/50 shadow-md" : ""}`}
                        >
                            <CardContent className="p-4 space-y-4">
                                {Object.keys(cart).length === 0 ? (
                                    <div className="text-sm text-gray-500">리워드를 담으면 이곳에 표시됩니다.</div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {Object.entries(cart).map(([ridStr, qty]) => {
                                                const rid = Number(ridStr);
                                                const r = project.rewardList.find(rr => rr.rewardId === rid);
                                                if (!r) return null;
                                                const max = getRemain(r);
                                                const soldOut = max <= 0;

                                                return (
                                                    <div key={rid} className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <div className="font-semibold truncate">{r.rewardName}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {formatCurrency(r.price)}원 · {r.rewardCnt > 0 ? `잔여 ${max}개` : "무제한"}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => setCartQty(rid, qty - 1)}
                                                                disabled={qty <= 1}
                                                            >
                                                                -
                                                            </Button>
                                                            <span className="w-6 text-center">{qty}</span>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => setCartQty(rid, Math.min(max, qty + 1))}
                                                                disabled={qty >= max || soldOut}
                                                            >
                                                                +
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(rid)}>
                                                                X
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <span className="font-semibold">합계</span>
                                            <span className="text-lg font-bold">{formatCurrency(cartSummary.totalAmount)}원</span>
                                        </div>

                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={handleCheckout}
                                            disabled={cartSummary.totalQty === 0}
                                        >
                                            {formatCurrency(cartSummary.totalAmount)}원 결제하기
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {project.rewardList.map(reward => {
                            const max = getRemain(reward);
                            const soldOut = max <= 0;
                            const inputQty = qtyByReward[reward.rewardId] ?? 1;

                            return (
                                <Card
                                    key={reward.rewardId}
                                    className={`transition-colors ${soldOut ? "opacity-60 pointer-events-none" : ""}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-lg font-semibold">{formatCurrency(reward.price)}원</span>
                                            {reward.rewardCnt > 0 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {soldOut ? "품절" : `잔여 ${reward.remain}개`}
                                                </Badge>
                                            )}
                                        </div>
                                        <h4 className="font-medium mb-2">{reward.rewardName}</h4>
                                        <p className="text-sm text-gray-600 mb-3">{reward.rewardContent}</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">예상 발송: {formatDate(reward.deliveryDate)}</span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => decQty(reward.rewardId)}
                                                    disabled={soldOut}
                                                >
                                                    -
                                                </Button>
                                                <span className="min-w-8 text-center">{Math.min(inputQty, Math.max(1, max))}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => incQty(reward.rewardId, max)}
                                                    disabled={soldOut || inputQty >= max}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            <Button
                                                onClick={() => addToCart(reward, Math.min(inputQty, Math.max(1, max)))}
                                                disabled={soldOut}
                                            >
                                                담기
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        <div className="pt-2">
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={cartSummary.totalQty === 0}
                            >
                                {cartSummary.totalQty > 0 ? `${formatCurrency(cartSummary.totalAmount)}원 후원하기` : '리워드를 선택하세요'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}