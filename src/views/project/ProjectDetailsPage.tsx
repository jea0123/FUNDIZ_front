import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Share2, Calendar, Users, UserMinus, Loader2, Hash } from 'lucide-react';
import type { ProjectDetail } from '@/types/projects';
import { deleteData, endpoints, getData, postData } from '@/api/apis';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate, formatNumber, formatPrice, getDaysLeft, toastError, toastSuccess, toPublicUrl } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Reward } from '@/types/reward';
import FundingLoader from '@/components/FundingLoader';
import { QnaCreateModal } from './components/QnaCreateModal';
import ProjectCommunityTab from './components/ProjectCommunityTab';
import ProjectReviewsTab from './components/ProjectReviewsTab';
import { ProjectDetailViewer } from '../creator/components/ProjectDetailViewer';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store/LoginUserStore.store';
import { ProjectThumb } from '../creator/pages/CreatorProjectListPage';

export function ProjectDetailsPage() {
    const { loginUser } = useLoginUserStore();

    const navigate = useNavigate();
    const { projectId } = useParams();

    const cartRef = useRef<HTMLDivElement>(null);
    const thumbWrapRef = useRef<HTMLDivElement>(null);

    const [cookie] = useCookies();
    const [project, setProject] = useState<ProjectDetail>();
    const [loadingProject, setLoadingProject] = useState(false);

    const [isLiked, setIsLiked] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);

    const [likeCnt, setLikeCnt] = useState(0);
    const [followerCnt, setFollowerCnt] = useState(0);
    const [communityCnt, setCommunityCnt] = useState(0);
    const [reviewCnt, setReviewCnt] = useState(0);

    const [tab, setTab] = useState<'description' | 'news' | 'community' | 'review'>('description');

    const [cart, setCart] = useState<Record<number, number>>({});
    const [cartPing, setCartPing] = useState(false);
    const [qtyByReward, setQtyByReward] = useState<Record<number, number>>({});

    const [loadingLike, setLoadingLike] = useState(false);
    const [mutatingLike, setMutatingLike] = useState(false);

    const [loadingFollow, setLoadingFollow] = useState(false);
    const [mutatingFollow, setMutatingFollow] = useState(false);

    const [thumbHeight, setThumbHeight] = useState<number | null>(null);

    const cartSummary = useMemo(() => {
        if (!project) return { totalQty: 0, totalAmount: 0 };
        let totalQty = 0, totalAmount = 0;
        for (const [ridStr, qty] of Object.entries(cart)) {
            const rid = Number(ridStr);
            const r = project.rewardList.find((rr) => rr.rewardId === rid);
            if (!r) continue;
            totalQty += qty;
            totalAmount += r.price * qty;
        }
        return { totalQty, totalAmount };
    }, [project, cart]);

    const thumbnailUrl = useMemo(() => toPublicUrl(project?.thumbnail ?? null), [project?.thumbnail]);
    const profileImgUrl = useMemo(() => toPublicUrl(project?.profileImg ?? null), [project?.profileImg]);

    const projectData = useCallback(async () => {
        if (!projectId) return;
        setLoadingProject(true);
        try {
            const res = await getData(endpoints.getProjectDetail(Number(projectId)));
            if (res.status === 200) setProject(res.data);
        } finally { setLoadingProject(false); }
    }, [projectId]);

    const likeProject = useCallback(async (pid: number) => {
        if (!pid) return;
        setMutatingLike(true);
        try {
            const res = await postData(endpoints.likeProject(pid), {}, cookie.accessToken);
            if (res.status === 200) { setIsLiked(true); await getLikeCnt(pid); toastSuccess('프로젝트를 좋아합니다.'); }
        } finally { setMutatingLike(false); }
    }, []);
    const dislikeProject = useCallback(async (pid: number) => {
        if (!pid) return;
        setMutatingLike(true);
        try {
            const res = await deleteData(endpoints.dislikeProject(pid), cookie.accessToken);
            if (res.status === 200) { setIsLiked(false); await getLikeCnt(pid); toastSuccess('프로젝트 좋아요를 취소합니다.'); }
        } finally { setMutatingLike(false); }
    }, []);
    const checkLiked = async (pid: number) => {
        if (!pid) return;
        const res = await getData(endpoints.checkLiked(pid), cookie.accessToken);
        if (res.status === 200) setIsLiked(res.data);
    };
    const getLikeCnt = async (pid: number) => {
        if (!pid) return;
        const res = await getData(endpoints.getLikeCnt(pid));
        if (res.status === 200) setLikeCnt(res.data);
    };

    const followCreator = useCallback(async (cid: number) => {
        if (!cid) return;
        if (cid === loginUser?.creatorId) return toastError('본인 크리에이터는 팔로우할 수 없습니다.');
        if (!loginUser) return toastError('로그인 후 사용해주세요.');
        setMutatingFollow(true);
        try {
            const res = await postData(endpoints.followCreator(cid), {}, cookie.accessToken);
            if (res.status === 200) { setIsFollowed(true); await getFollowerCnt(cid); toastSuccess('크리에이터를 팔로우합니다.'); }
        } finally { setMutatingFollow(false); }
    }, []);
    const unfollowCreator = useCallback(async (cid: number) => {
        if (!cid) return;
        if (cid === loginUser?.creatorId) return toastError('본인 크리에이터는 언팔로우할 수 없습니다.');
        if (!loginUser) return toastError('로그인 후 사용해주세요.');
        setMutatingFollow(true);
        try {
            const res = await deleteData(endpoints.unfollowCreator(cid), cookie.accessToken);
            if (res.status === 200) { setIsFollowed(false); await getFollowerCnt(cid); toastSuccess('크리에이터 팔로우를 취소합니다.'); }
        } finally { setMutatingFollow(false); }
    }, []);
    const checkFollowed = async (cid: number) => {
        if (!cid) return;
        const res = await getData(endpoints.checkFollowed(cid), cookie.accessToken);
        if (res.status === 200) setIsFollowed(res.data);
    };
    const getFollowerCnt = async (cid: number) => {
        if (!cid) return;
        const res = await getData(endpoints.getFollowerCnt(cid));
        if (res.status === 200) setFollowerCnt(res.data);
    };

    const getRemain = useCallback((r: Reward) => (r.rewardCnt > 0 ? Math.max(0, r.remain) : 99), []);
    const incQty = useCallback((rid: number, max: number) => setQtyByReward((p) => ({ ...p, [rid]: Math.min((p[rid] ?? 1) + 1, max) })), []);
    const decQty = useCallback((rid: number) => setQtyByReward((p) => ({ ...p, [rid]: Math.max(1, (p[rid] ?? 1) - 1) })), []);
    const addToCart = useCallback((reward: Reward, qtyToAdd: number) => {
        if (qtyToAdd <= 0) return;
        const remain = getRemain(reward);
        setCart((prev) => {
            const current = prev[reward.rewardId] ?? 0;
            const nextQty = Math.min(remain, current + qtyToAdd);
            return { ...prev, [reward.rewardId]: nextQty };
        });
        requestAnimationFrame(() => {
            cartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setCartPing(true); setTimeout(() => setCartPing(false), 800);
        });
        setQtyByReward((p) => ({ ...p, [reward.rewardId]: 1 }));
    }, [getRemain]);
    const setCartQty = useCallback((rid: number, next: number) => {
        setCart((prev) => {
            if (next <= 0) { const { [rid]: _, ...rest } = prev; return rest; }
            const reward = project?.rewardList.find((r) => r.rewardId === rid);
            const remain = reward ? getRemain(reward) : 1;
            return { ...prev, [rid]: Math.min(remain, next) };
        });
    }, [project, getRemain]);
    const removeFromCart = useCallback((rid: number) => setCart((prev) => { const { [rid]: _, ...rest } = prev; return rest; }), []);

    const backThisProject = useCallback(() => {
        if (!projectId) return;
        if (!cookie.accessToken) {
            const isLogin = confirm('로그인 후 사용해주세요.');
            if (isLogin) navigate('/auth/login');
            return;
        }
        const entries = Object.entries(cart).filter(([_, q]) => q > 0);
        if (!entries.length) return;
        const items = entries.map(([rid, q]) => `${rid}x${q}`).join(',');
        const params = new URLSearchParams(); params.set('items', items);
        navigate(`/project/${projectId}/backing?${params.toString()}`);
    }, [cart, navigate, projectId]);

    const handleShare = useCallback(() => { navigator.clipboard.writeText(window.location.href); alert('링크가 복사되었습니다.'); }, []);
    const incCommunity = useCallback((d: number) => setCommunityCnt((v) => Math.max(0, v + d)), []);

    useEffect(() => {
        projectData();
    }, [projectId, projectData]);

    useEffect(() => {
        if (!projectId) return;
        (async () => {
            const { status, data } = await getData(endpoints.getCounts(Number(projectId)));
            if (status === 200) { setCommunityCnt(data.community.total); setReviewCnt(data.review.total); }
            else { setCommunityCnt(0); setReviewCnt(0); }
        })();
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        let canceled = false;
        (async () => {
            setLoadingLike(true);
            try { await Promise.all([checkLiked(Number(projectId)), getLikeCnt(Number(projectId))]); }
            finally { if (!canceled) setLoadingLike(false); }
        })();
        return () => { canceled = true; };
    }, [projectId]);

    useEffect(() => {
        const cid = project?.creatorId; if (!cid) return;
        let canceled = false;
        (async () => {
            setLoadingFollow(true);
            try { await Promise.all([checkFollowed(cid), getFollowerCnt(cid)]); }
            finally { if (!canceled) setLoadingFollow(false); }
        })();
        return () => { canceled = true; };
    }, [project?.creatorId]);

    useEffect(() => {
        if (projectId) {
            postData(endpoints.addRecentView(Number(projectId)), {}, cookie.accessToken);
        }
    }, [projectId]);

    useEffect(() => {
        if (!thumbWrapRef.current) return;
        const el = thumbWrapRef.current;
        const obs = new ResizeObserver(([entry]) => {
            const h = entry.contentRect.height;
            setThumbHeight(h);
        });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    if (!projectId || !project || loadingProject) return <FundingLoader />;

    const isUpComing = project.projectStatus === 'UPCOMING' || project.projectStatus === 'VERIFYING';
    const isClosed = project.projectStatus === 'SUCCESS' || project.projectStatus === 'FAILED' || project.projectStatus === 'CANCELED' || project.projectStatus === 'SETTLED' || project.projectStatus === 'CLOSED';
    const toKDate = (d: string | Date) =>
        new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* ===== 헤더: 좌 썸네일 / 우 정보 ===== */}
            <div className="flex flex-col lg:flex-row gap-y-8 lg:gap-y-8 lg:gap-x-16">
                <div ref={thumbWrapRef} className="lg:basis-[62%] lg:min-w-0">
                    <ProjectThumb
                        src={thumbnailUrl}
                        alt={project.title}
                        className="aspect-square w-full max-w-xl object-cover rounded-lg mx-auto"
                    />
                </div>

                <div className="lg:basis-[38%] lg:min-w-0">
                    {/* 카테고리 > 세부카테고리 + 태그 */}
                    <div className="text-[15px] text-gray-500 flex flex-wrap items-center gap-1 pb-3 border-b border-gray-200 mt-2">
                        <span className="leading-none">{project.ctgrName}</span>
                        <span className="px-1 text-gray-300 leading-none">›</span>
                        <span className="leading-none">{project.subctgrName}</span>

                        {project.tagList?.length ? (
                            <span className="ml-2 flex flex-wrap items-center gap-1">
                                {project.tagList.map((t) => (
                                    <span
                                        key={t.tagId}
                                        className="inline-flex items-center gap-1 text-gray-600 leading-none"
                                    >
                                        <Hash className="h-3 w-3 shrink-0 relative top-[1px]" />
                                        <span className="leading-none">{t.tagName}</span>
                                    </span>
                                ))}
                            </span>
                        ) : null}
                    </div>

                    <h1 className="text-2xl font-semibold leading-tight mt-6">{project.title}</h1>

                    {/* OPEN 아닐 때: 오픈 예정 배너 */}
                    {isUpComing && (
                        <div className="mt-4 rounded-md bg-blue-50 text-blue-700 px-3 py-2 text-sm font-medium">
                            {toKDate(project.startDate)} 오픈 예정
                        </div>
                    )}

                    {/* CLOSED 일 때: 종료 배너 */}
                    {isClosed && (
                        <div className="mt-4 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm font-medium">
                            종료된 프로젝트입니다.
                        </div>
                    )}

                    {/* 금액/달성률 */}
                    {!isUpComing && (
                        <div className="mt-5 flex items-baseline gap-3 whitespace-nowrap">
                            <span className="text-[24px] font-semibold">
                                {formatNumber(project.currAmount)}<span className="ml-1">원</span>
                            </span>
                            <span className="text-[22px] text-blue-600 font-bold">{project.percentNow}%</span>
                        </div>
                    )}

                    {/* 메트릭 */}
                    {!isUpComing && (
                        <div className="mt-1">
                            <div className="text-sm text-gray-500 mb-6">
                                목표 금액 {formatNumber(project.goalAmount)}원
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y mt-3">
                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <Users className="h-4 w-4 mr-2" />
                                        <span className="font-semibold">{project.backerCnt}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">후원자</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span className="font-semibold">{getDaysLeft(project.endDate)}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">일 남음</div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm mt-5">
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
                    )}

                    {/* 좋아요/공유 + 후원하기 */}
                    <div className="mt-6 flex items-center gap-2 min-w-0">
                        <Button
                            variant="secondary"
                            disabled={loadingLike || mutatingLike}
                            onClick={() =>
                                isLiked ? dislikeProject(Number(projectId)) : likeProject(Number(projectId))
                            }
                            className={`h-12 px-4 text-base shrink-0 ${isLiked ? 'text-red-500' : ''}`}
                        >
                            {loadingLike || mutatingLike ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                            )}
                            <span className="ml-2">{likeCnt}</span>
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            aria-label="공유"
                            onClick={handleShare}
                            className="h-12 w-12 shrink-0"
                        >
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={backThisProject}
                            disabled={cartSummary.totalQty === 0 || isUpComing || isClosed}
                            className={!isClosed ? `flex-1 min-w-0 h-12 text-base rounded-lg
                                bg-blue-600 text-white hover:bg-blue-700
                                focus-visible:ring-2 focus-visible:ring-blue-600/30
                                disabled:opacity-100 disabled:bg-blue-600 disabled:text-white disabled:hover:bg-blue-600
                                disabled:cursor-not-allowed
                            ` : `flex-1 min-w-0 h-12 text-base rounded-lg
                                bg-gray-400 text-white hover:bg-gray-500
                                disabled:opacity-100 disabled:bg-gray-400 disabled:text-white disabled:hover:bg-gray-400
                                disabled:cursor-not-allowed
                            `}
                            title={cartSummary.totalQty === 0 ? '리워드를 선택하세요' : undefined}
                        >
                            {isUpComing ? '오픈 예정' : isClosed ? '펀딩 종료' : '후원하기'}
                        </Button>

                    </div>

                    {/* 창작자 정보 카드 */}
                    <Card className="mt-6">
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={profileImgUrl} />
                                    <AvatarFallback>{project.creatorName}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div
                                        className="w-fit cursor-pointer"
                                        onClick={() => navigate(`/creator/${project.creatorId}`)}
                                    >
                                        <h4 className="font-semibold hover:underline truncate">{project.creatorName}</h4>
                                        <p className="text-sm text-gray-600">
                                            팔로워 {formatNumber(followerCnt)}명 · 프로젝트 {project.projectCnt}개
                                        </p>
                                    </div>
                                </div>

                                {loginUser?.creatorId === project.creatorId ? null : isFollowed ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={loadingFollow || mutatingFollow}
                                        onClick={() => unfollowCreator(project.creatorId)}
                                        className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                    >
                                        {loadingFollow || mutatingFollow ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <UserMinus className="h-4 w-4" />
                                        )}
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
                                        <Users className="h-4 w-4" />
                                        <span className="ml-1">팔로우</span>
                                    </Button>
                                )}
                            </div>

                            {/* 문의하기 버튼 */}
                            {loginUser?.creatorId !== project.creatorId && (
                                <div className="mt-3">
                                    <QnaCreateModal />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ===== 전역 탭 + 본문/사이드 ===== */}
            <div className="mt-12 flex flex-col lg:flex-row gap-y-8 lg:gap-y-8 lg:gap-x-16">
                <div className="lg:basis-[62%] lg:min-w-0">
                    <Tabs defaultValue="description" onValueChange={(v) => setTab(v as any)}>
                        <div>
                            <TabsList style={{ width: '100%' }} className="w-full grid grid-cols-4 sm:w-auto sm:inline-grid sm:auto-cols-max sm:grid-flow-col gap-2 overflow-x-auto">
                                <TabsTrigger value="description">프로젝트 소개</TabsTrigger>
                                <TabsTrigger value="news">
                                    새소식
                                    <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                                        {project.newsList.length}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="community">
                                    커뮤니티
                                    <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                                        {communityCnt}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="review">
                                    후기
                                    <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                                        {reviewCnt}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* 탭 컨텐츠 */}
                        <div className="mt-6">
                            <TabsContent value="description" className="mt-0">
                                <h2 className="text-xl sm:text-2xl font-semibold flex items-center mb-9">
                                    <span className="text-gray-600">|</span>
                                    <span className="ml-3">프로젝트 소개</span>
                                </h2>
                                <ProjectDetailViewer data={project.contentBlocks} />
                            </TabsContent>

                            <TabsContent value="news">
                                {project.newsList.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">게시글이 존재하지 않습니다.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {project.newsList.map((news) => (
                                            <Card key={news.newsId}>
                                                <CardContent className="p-4">
                                                    <div className="whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                                                        {news.content}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-2">{formatDate(news.createdAt)}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="community">
                                <ProjectCommunityTab
                                    projectId={Number(projectId)}
                                    active={tab === 'community'}
                                    onCreated={() => incCommunity(+1)}
                                />
                            </TabsContent>

                            <TabsContent value="review">
                                <ProjectReviewsTab projectId={Number(projectId)} active={tab === 'review'} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* 우측 사이드바 */}
                <aside
                    className="lg:basis-[38%] lg:min-w-0 lg:sticky lg:top-6 self-start space-y-6 flex flex-col"
                    style={thumbHeight ? { height: `${thumbHeight}px` } : undefined}
                >
                    {/* 카트 */}
                    <Card
                        ref={cartRef}
                        className={`bt-white transition ${cartPing ? 'ring-2 ring-blue-500/50 shadow-md' : ''}`}
                    >
                        <CardContent className="p-4 space-y-4">
                            {Object.keys(cart).length === 0 ? (
                                <div className="text-sm text-gray-500">리워드를 담으면 이곳에 표시됩니다.</div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {Object.entries(cart).map(([ridStr, qty]) => {
                                            const rid = Number(ridStr);
                                            const r = project.rewardList.find((rr) => rr.rewardId === rid);
                                            if (!r) return null;
                                            const max = getRemain(r);
                                            const soldOut = max <= 0;

                                            return (
                                                <div key={rid} className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="font-semibold truncate">{r.rewardName}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {formatNumber(r.price)}원 · {r.rewardCnt > 0 ? `잔여 ${max}개` : '무제한'}
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
                                        className={isClosed ? `w-full flex-1 min-w-0 h-12 text-base rounded-lg
                                            bg-gray-400 text-white hover:bg-gray-500
                                            disabled:opacity-100 disabled:bg-gray-400 disabled:text-white disabled:hover:bg-gray-400
                                            disabled:cursor-not-allowed
                                        ` : `
                                            w-full flex-1 min-w-0 h-12 text-base rounded-lg
                                            bg-blue-600 text-white hover:bg-blue-700
                                            focus-visible:ring-2 focus-visible:ring-blue-600/30
                                            disabled:opacity-100 disabled:bg-blue-600 disabled:text-white disabled:hover:bg-blue-600
                                            disabled:cursor-not-allowed
                                        `}
                                        size="lg"
                                        onClick={backThisProject}
                                        disabled={cartSummary.totalQty === 0 || isUpComing || isClosed}
                                    >
                                        {isUpComing
                                            ? '오픈 예정'
                                            : isClosed
                                                ? '펀딩 종료'
                                                : (cartSummary.totalQty > 0
                                                    ? `${formatNumber(cartSummary.totalAmount)}원 후원하기`
                                                    : '후원하기')}
                                    </Button>

                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* 리워드 목록(스크롤 박스) */}
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="max-h-80 md:max-h-96 lg:max-h-[520px] overflow-y-auto divide-y">
                                {project.rewardList.map((reward) => {
                                    const max = getRemain(reward);
                                    const soldOut = max <= 0;
                                    const inputQty = qtyByReward[reward.rewardId] ?? 1;
                                    const safeQty = Math.min(inputQty, Math.max(1, max));

                                    return (
                                        <div
                                            key={reward.rewardId}
                                            className={`p-4 ${soldOut ? 'opacity-60 pointer-events-none' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-semibold">{formatNumber(reward.price)}원</span>
                                                        {reward.rewardCnt > 0 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {soldOut ? '품절' : `잔여 ${reward.remain}개`}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h4 className="font-medium mt-1">{reward.rewardName}</h4>
                                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line break-words line-clamp-10">
                                                        {reward.rewardContent}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        예상 발송: {formatDate(reward.deliveryDate)}
                                                    </p>
                                                </div>

                                                <div className="shrink-0 flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => decQty(reward.rewardId)}
                                                            disabled={soldOut}
                                                        >
                                                            -
                                                        </Button>
                                                        <span className="min-w-8 text-center">{safeQty}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => incQty(reward.rewardId, max)}
                                                            disabled={soldOut || safeQty >= max}
                                                        >
                                                            +
                                                        </Button>
                                                    </div>
                                                    <Button size="sm" onClick={() => addToCart(reward, safeQty)} disabled={soldOut || project.projectStatus !== 'OPEN'}>
                                                        담기
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 하단 후원 버튼 */}
                    <Button
                        className={isClosed ? `w-full min-w-0 h-12 text-base rounded-lg
                            bg-gray-400 text-white hover:bg-gray-500
                            disabled:opacity-100 disabled:bg-gray-400 disabled:text-white disabled:hover:bg-gray-400
                            disabled:cursor-not-allowed
                        ` : `
                            w-full min-w-0 h-12 text-base rounded-lg
                            bg-blue-600 text-white hover:bg-blue-700
                            focus-visible:ring-2 focus-visible:ring-blue-600/30
                            disabled:opacity-100 disabled:bg-blue-600 disabled:text-white disabled:hover:bg-blue-600
                            disabled:cursor-not-allowed
                        `}
                        size="lg"
                        onClick={backThisProject}
                        disabled={cartSummary.totalQty === 0 || isUpComing || isClosed}
                    >
                        {isUpComing
                            ? '오픈 예정'
                            : isClosed
                                ? '펀딩 종료'
                                : (cartSummary.totalQty > 0
                                    ? `${formatNumber(cartSummary.totalAmount)}원 후원하기`
                                    : '후원하기')}
                    </Button>
                </aside>
            </div>
        </div>
    );
}
