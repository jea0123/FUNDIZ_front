import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Share2, Calendar, Users, UserMinus, Loader2 } from 'lucide-react';
import type { ProjectDetail } from '@/types/projects';
import { deleteData, endpoints, getData, postData } from '@/api/apis';
import { useParams } from 'react-router-dom';
import { formatDate, formatNumber, formatPrice, getDaysLeft, toastError, toastSuccess, toPublicUrl } from '@/utils/utils';
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
import { QnaCreateModal } from './components/QnaCreateModal';
import ProjectCommunityTab from './components/ProjectCommunityTab';
import ProjectReviewsTab from './components/ProjectReviewsTab';
import { ProjectDetailViewer } from '../creator/components/ProjectDetailViewer';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store/LoginUserStore.store';
import { log } from 'console';

export function ProjectDetailsPage() {

    /* ----------------------------- Router helpers ----------------------------- */
    const navigate = useNavigate();
    const { projectId } = useParams();

    /* --------------------------------- Refs ---------------------------------- */

    const cartRef = useRef<HTMLDivElement>(null);

    /* --------------------------------- States --------------------------------- */

    const [cookie] = useCookies();
    const [project, setProject] = useState<ProjectDetail>();
    const [loadingProject, setLoadingProject] = useState(false);

    const [isLiked, setIsLiked] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);

    const [likeCnt, setLikeCnt] = useState(0);
    const [followerCnt, setFollowerCnt] = useState(0);
    const [communityCnt, setCommunityCnt] = useState(0);
    const [reviewCnt, setReviewCnt] = useState(0);

    const [tab, setTab] = useState<"description" | "news" | "community" | "review">("description");

    const [cart, setCart] = useState<Record<number, number>>({});
    const [cartPing, setCartPing] = useState(false);
    const [qtyByReward, setQtyByReward] = useState<Record<number, number>>({});

    const [loadingLike, setLoadingLike] = useState(false);
    const [mutatingLike, setMutatingLike] = useState(false);

    const [loadingFollow, setLoadingFollow] = useState(false);
    const [mutatingFollow, setMutatingFollow] = useState(false);

    const { loginUser } = useLoginUserStore();

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

    const thumbnailUrl = useMemo(() =>
        toPublicUrl(project?.thumbnail ?? null), [project?.thumbnail]
    );

    const profileImgUrl = useMemo(() =>
        toPublicUrl(project?.profileImg ?? null), [project?.profileImg]
    );

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

    const likeProject = useCallback(async (projectId: number) => {
        if (!projectId) return;
        setMutatingLike(true);
        try {
            const res = await postData(endpoints.likeProject(projectId), {}, cookie.accessToken);
            if (res.status === 200) {
                setIsLiked(true);
                await getLikeCnt(projectId);
                toastSuccess('프로젝트를 좋아합니다.');
            }
        } finally {
            setMutatingLike(false);
        }
    }, []);

    const dislikeProject = useCallback(async (projectId: number) => {
        if (!projectId) return;
        setMutatingLike(true);
        try {
            const res = await deleteData(endpoints.dislikeProject(projectId), cookie.accessToken);
            if (res.status === 200) {
                setIsLiked(false);
                await getLikeCnt(projectId);
                toastSuccess('프로젝트 좋아요를 취소합니다.');
            }
        } finally {
            setMutatingLike(false);
        }
    }, []);

    const checkLiked = async (projectId: number) => {
        if (!projectId) return;
        const response = await getData(endpoints.checkLiked(projectId), cookie.accessToken);
        if (response.status === 200) {
            setIsLiked(response.data);
        }
    }

    const getLikeCnt = async (projectId: number) => {
        if (!projectId) return;
        const response = await getData(endpoints.getLikeCnt(projectId));
        if (response.status === 200) {
            setLikeCnt(response.data);
        }
    };

    const followCreator = useCallback(async (creatorId: number) => {
        if (!creatorId) return;
        if (creatorId === loginUser?.creatorId) {
            toastError('본인 크리에이터는 팔로우할 수 없습니다.');
            return;
        }
        setMutatingFollow(true);
        try {
            const res = await postData(endpoints.followCreator(creatorId), {}, cookie.accessToken);
            if (res.status === 200) {
                setIsFollowed(true);
                await getFollowerCnt(creatorId);
                toastSuccess('크리에이터를 팔로우합니다.');
            }
        } finally {
            setMutatingFollow(false);
        }
    }, []);

    const unfollowCreator = useCallback(async (creatorId: number) => {
        if (!creatorId) return;
        if (creatorId !== loginUser?.creatorId) {
            toastError('본인 크리에이터는 언팔로우할 수 없습니다.');
            return;
        }
        setMutatingFollow(true);
        try {
            const res = await deleteData(endpoints.unfollowCreator(creatorId), cookie.accessToken);
            if (res.status === 200) {
                setIsFollowed(false);
                await getFollowerCnt(creatorId);
                toastSuccess('크리에이터 팔로우를 취소합니다.');
            }
        } finally {
            setMutatingFollow(false);
        }
    }, []);

    const checkFollowed = async (creatorId: number) => {
        if (!creatorId) return;
        const response = await getData(endpoints.checkFollowed(creatorId), cookie.accessToken);
        if (response.status === 200) {
            setIsFollowed(response.data);
        }
    }

    const getFollowerCnt = async (creatorId: number) => {
        if (!creatorId) return;
        const response = await getData(endpoints.getFollowerCnt(creatorId));
        if (response.status === 200) {
            setFollowerCnt(response.data);
        }
    };

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
    const backThisProject = useCallback(() => {
        if (!projectId) return;
        if (!cookie.accessToken) {
            const isLogin = confirm('로그인 후 사용해주세요.');
            if (isLogin) navigate('/auth/login');
            return false;
        }
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

    // 탭에서 이벤트가 있을 때 총계만 보정
    const incCommunity = useCallback((d: number) => setCommunityCnt(v => Math.max(0, v + d)), []);

    /* -------------------------------- Effects -------------------------------- */

    useEffect(() => {
        projectData();
    }, [projectId, projectData]);

    // 커뮤니티/후기 총합 초기 로드
    useEffect(() => {
        if (!projectId) return;
        (async () => {
            const { status, data } = await getData(endpoints.getCounts(Number(projectId)));
            if (status === 200) {
                setCommunityCnt(data.community.total);
                setReviewCnt(data.review.total);
            } else {
                setCommunityCnt(0); setReviewCnt(0);
            }
        })();
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        let canceled = false;
        (async () => {
            setLoadingLike(true);
            try {
                await Promise.all([checkLiked(Number(projectId)), getLikeCnt(Number(projectId)),]);
            } finally {
                if (!canceled) setLoadingLike(false);
            }
        })();
        return () => { canceled = true };
    }, [projectId]);

    useEffect(() => {
        const cid = project?.creatorId;
        if (!cid) return;
        let canceled = false;
        (async () => {
            setLoadingFollow(true);
            try {
                await Promise.all([checkFollowed(cid), getFollowerCnt(cid),]);
            } finally {
                if (!canceled) setLoadingFollow(false);
            }
        })();
        return () => { canceled = true };
    }, [project?.creatorId]);

    useEffect(() => {
        if (!projectId) return;
        const recentView = async () => {
            await postData(endpoints.addRecentView(Number(projectId)), {}, cookie.accessToken);
        }
        recentView();
    }, [projectId]);

    /* --------------------------------- Render --------------------------------- */

    if (!projectId || !project || loadingProject) {
        return <FundingLoader />;
    }

    console.log(getDaysLeft(project.endDate))

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="relative mb-6">
                        <ImageWithFallback
                            src={thumbnailUrl}
                            alt={project.title}
                            className="w-full h-96 object-cover rounded-lg"
                        />
                        <div className="absolute top-4 right-4 flex space-x-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={loadingLike || mutatingLike}
                                onClick={() => (isLiked ? dislikeProject(Number(projectId)) : likeProject(Number(projectId)))}
                                className={isLiked ? 'text-red-500' : ''}
                            >
                                {(loadingLike || mutatingLike)
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />}
                                <span className="ml-1">{likeCnt}</span>
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
                                <AvatarImage src={profileImgUrl} />
                                <AvatarFallback>{project.creatorName}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h4 className="font-semibold">{project.creatorName}</h4>
                                <p className="text-sm text-gray-600">
                                    팔로워 {formatNumber(followerCnt)}명 · 프로젝트 {project.projectCnt}개
                                </p>
                            </div>
                            {loginUser?.creatorId === project.creatorId ? null : (
                                isFollowed ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={loadingFollow || mutatingFollow}
                                        onClick={() => unfollowCreator(project.creatorId)}
                                        className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                    >
                                        {(loadingFollow || mutatingFollow)
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <UserMinus className="h-4 w-4" />}
                                        <span className="ml-1">언팔로우</span>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={loadingFollow || mutatingFollow}
                                        onClick={() => followCreator(project.creatorId)}
                                        className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                                    >
                                        {(loadingFollow || mutatingFollow)
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <Users className="h-4 w-4" />}
                                        <span className="ml-1">팔로우</span>
                                    </Button>
                                )
                            )}
                            <QnaCreateModal />
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
                                    {communityCnt}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger value="review" className="min-w-0 flex items-center justify-center gap-1 truncate">
                                <span className="truncate">후기</span>
                                <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                                    {reviewCnt}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        {/* 프로젝트 소개 */}
                        <TabsContent value="description" className="mt-6">
                            <ProjectDetailViewer data={project.contentBlocks} />
                        </TabsContent>

                        {/* 새소식 */}
                        <TabsContent value="news">
                            {project.newsList.length == 0 ? (
                                <div className="text-sm text-muted-foreground">게시글이 존재하지 않습니다.</div>
                            ) : (
                                <>
                                    {project.newsList.map((news) => (
                                        <div key={news.newsId} className="space-y-4 mt-6">
                                            <Card>
                                                <CardContent>
                                                    <div className="whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
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

                        {/* 커뮤니티 */}
                        <TabsContent value="community">
                            <ProjectCommunityTab
                                projectId={Number(projectId)}
                                active={tab === "community"}
                                onCreated={() => incCommunity(+1)}
                            />
                        </TabsContent>

                        {/* 후기 */}
                        <TabsContent value="review">
                            <ProjectReviewsTab
                                projectId={Number(projectId)}
                                active={tab === "review"}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* 오른쪽 사이드 */}
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
                                        <div className="text-xl font-bold">{formatNumber(project.currAmount)}원</div>
                                        <div className="text-sm text-gray-500">목표 {formatNumber(project.goalAmount)}원</div>
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
                                                                {formatNumber(r.price)}원 · {r.rewardCnt > 0 ? `잔여 ${max}개` : "무제한"}
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
                                            <span className="text-lg font-bold">{formatPrice(cartSummary.totalAmount)}원</span>
                                        </div>

                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={backThisProject}
                                            disabled={cartSummary.totalQty === 0}
                                        >
                                            {formatPrice(cartSummary.totalAmount)}원 후원하기
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
                                            <span className="text-lg font-semibold">{formatNumber(reward.price)}원</span>
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
                                onClick={backThisProject}
                                disabled={cartSummary.totalQty === 0}
                            >
                                {cartSummary.totalQty > 0 ? `${formatPrice(cartSummary.totalAmount)}원 후원하기` : '리워드를 선택하세요'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
