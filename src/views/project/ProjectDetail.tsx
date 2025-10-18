import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Share2, Calendar, Users, MessageCircle, Star, MessageSquarePlus, X, UserMinus, Loader2 } from 'lucide-react';
import type { ProjectDetail } from '@/types/projects';
import { deleteData, endpoints, getData, postData } from '@/api/apis';
import { useParams } from 'react-router-dom';
import { formatDate, formatPrice, getByteLen, getDaysBefore, getDaysLeft, toastSuccess } from '@/utils/utils';
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { ReplyDto } from '@/types/reply';
import type { QnaAddRequest } from "@/types/qna";

const CM_MAX = 1000;

export function ProjectDetailPage() {

    /* ----------------------------- Router helpers ----------------------------- */
    const navigate = useNavigate();
    const { projectId } = useParams();

    /* --------------------------------- Auth helper ---------------------------------- */

    //TODO: login 체크
    const ensureLogin = useCallback(() => {
        return true;
    }, [/* navigate, location.pathname, location.search */])

    /* --------------------------------- Refs ---------------------------------- */

    const cartRef = useRef<HTMLDivElement>(null);

    // 커뮤니티/후기 무한스크롤
    const communitySentinelRef = useRef<HTMLDivElement | null>(null);
    const reviewSentinelRef = useRef<HTMLDivElement | null>(null);
    const communityLoadingLockRef = useRef(false); // 중복 호출 방지용 락
    const reviewLoadingLockRef = useRef(false); // 중복 호출 방지용 락

    // 글자수 초과 알림 1회 제한
    const exceededAlertedRef = useRef(false);

    // 댓글 무한스크롤
    const replySentinelRef = useRef<Record<number, HTMLDivElement | null>>({});
    const replyLoadingLockRef = useRef<Record<number, boolean>>({}); // 중복 호출 방지용 락

    /* --------------------------------- States --------------------------------- */

    const [project, setProject] = useState<ProjectDetail>();
    const [likeCnt, setLikeCnt] = useState(0);
    const [followerCnt, setFollowerCnt] = useState(0);
    const [loadingProject, setLoadingProject] = useState(false);

    const [community, setCommunity] = useState<CommunityDto[]>([]);
    const [communityCursor, setCommunityCursor] = useState<Cursor | null>(null);
    const [loadingCommunity, setLoadingCommunity] = useState(false);

    const [review, setReview] = useState<ReviewDto[]>([]);
    const [reviewCursor, setReviewCursor] = useState<Cursor | null>(null);
    const [loadingReview, setLoadingReview] = useState(false);

    const [tab, setTab] = useState<"description" | "news" | "community" | "review">("description");
    const [isLiked, setIsLiked] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);

    const [cart, setCart] = useState<Record<number, number>>({});
    const [cartPing, setCartPing] = useState(false);
    const [qtyByReward, setQtyByReward] = useState<Record<number, number>>({});

    // 커뮤니티 글쓰기
    const [openCm, setOpenCm] = useState(false);
    const [cmContent, setCmContent] = useState("");
    const [postingCm, setPostingCm] = useState(false);

    // 댓글
    const [reply, setReply] = useState<Record<number, ReplyDto[]>>({});
    const [replyCursor, setReplyCursor] = useState<Record<number, Cursor | null>>({});
    const [loadingReply, setLoadingReply] = useState<Record<number, boolean>>({});
    const [openReply, setOpenReply] = useState<Record<number, boolean>>({});
    const [postingReply, setPostingReply] = useState<Record<number, boolean>>({});
    const [replyInput, setReplyInput] = useState<Record<number, string>>({});
    const [replySecret, setReplySecret] = useState<Record<number, boolean>>({});

    const [loadingLike, setLoadingLike] = useState(false);      // 좋아요 상태/카운트 조회중
    const [mutatingLike, setMutatingLike] = useState(false);    // 좋아요/취소 토글중

    const [loadingFollow, setLoadingFollow] = useState(false);  // 팔로우 상태/카운트 조회중
    const [mutatingFollow, setMutatingFollow] = useState(false);// 팔로우/언팔 토글중

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

    // 로컬 댓글 수
    const getLocalReplyCnt = (cmId: number) => (reply[cmId]?.length ?? 0);

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

    const replyData = useCallback(async (cmId: number, cursor: Cursor | null) => {
        setLoadingReply(prev => ({ ...prev, [cmId]: true }));
        try {
            const params = new URLSearchParams();
            if (cursor) {
                if (cursor.lastCreatedAt) params.set("lastCreatedAt", cursor.lastCreatedAt);
                if (cursor.lastId != null) params.set("lastId", String(cursor.lastId));
            }
            params.set("size", "10");

            const url = `${endpoints.getReplyList(cmId)}?${params.toString()}`;
            const { status, data } = await getData(url);

            if (status !== 200 || !data) {
                if (!cursor) setReply(prev => ({ ...prev, [cmId]: [] }));
                setReplyCursor(prev => ({ ...prev, [cmId]: null }));
                return;
            }
            const page = data as CursorPage<ReplyDto>;
            const items = Array.isArray(page?.items) ? page.items.filter(Boolean) : [];
            setReply(prev => ({ ...prev, [cmId]: cursor ? ([...(prev[cmId] ?? []), ...items]) : items }));
            setReplyCursor(prev => ({ ...prev, [cmId]: page?.nextCursor ?? null }));
        } finally {
            setLoadingReply(prev => ({ ...prev, [cmId]: false }));
        }
    }, []);

    const likeProject = useCallback(async (projectId: number) => {
        if (!projectId || !ensureLogin()) return;
        setMutatingLike(true);
        try {
            const res = await postData(endpoints.likeProject(projectId));
            if (res.status === 200) {
                setIsLiked(true);
                await getLikeCnt(projectId);
                toastSuccess('프로젝트를 좋아합니다.');
            }
        } finally {
            setMutatingLike(false);
        }
    }, [ensureLogin]);

    const dislikeProject = useCallback(async (projectId: number) => {
        if (!projectId || !ensureLogin()) return;
        setMutatingLike(true);
        try {
            const res = await deleteData(endpoints.dislikeProject(projectId));
            if (res.status === 200) {
                setIsLiked(false);
                await getLikeCnt(projectId);
                toastSuccess('프로젝트 좋아요를 취소합니다.');
            }
        } finally {
            setMutatingLike(false);
        }
    }, [ensureLogin]);

    const checkLiked = async (projectId: number) => {
        if (!projectId) return;
        if (!ensureLogin()) return;
        const response = await getData(endpoints.checkLiked(projectId));
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
        if (!creatorId || !ensureLogin()) return;
        setMutatingFollow(true);
        try {
            const res = await postData(endpoints.followCreator(creatorId));
            if (res.status === 200) {
                setIsFollowed(true);
                await getFollowerCnt(creatorId);
                toastSuccess('크리에이터를 팔로우합니다.');
            }
        } finally {
            setMutatingFollow(false);
        }
    }, [ensureLogin]);

    const unfollowCreator = useCallback(async (creatorId: number) => {
        if (!creatorId || !ensureLogin()) return;
        setMutatingFollow(true);
        try {
            const res = await deleteData(endpoints.unfollowCreator(creatorId));
            if (res.status === 200) {
                setIsFollowed(false);
                await getFollowerCnt(creatorId);
                toastSuccess('크리에이터 팔로우를 취소합니다.');
            }
        } finally {
            setMutatingFollow(false);
        }
    }, [ensureLogin]);

    const checkFollowed = async (creatorId: number) => {
        if (!creatorId) return;
        if (!ensureLogin()) return;
        const response = await getData(endpoints.checkFollowed(creatorId));
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
            alert("최대 " + CM_MAX + "바이트(333자)까지 입력할 수 있습니다.");
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
            alert("최대 " + CM_MAX + "바이트(333자)까지 입력할 수 있습니다.");
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

    // 렌더 시 문자열 강제
    const replyText = useCallback((id: number) => {
        const v = replyInput?.[id];
        return typeof v === "string" ? v : "";
    }, [replyInput]);

    // 커뮤니티 내용 초기화
    const handleCommunityOpenChange = useCallback((open: boolean) => {
        setOpenCm(open);
        if (!open) {
            setCmContent("");
            exceededAlertedRef.current = false;
        }
    }, []);

    // 댓글 패널 토글 (처음 열 때만 로드, 기본값 문자열로 강제)
    const toggleReplies = useCallback((cmId: number) => {
        setOpenReply(prev => ({ ...prev, [cmId]: !prev?.[cmId] }));

        setReply((prev) => ({ ...prev, [cmId]: Array.isArray(prev?.[cmId]) ? prev[cmId] : [] }));
        setReplyInput((prev) => ({ ...prev, [cmId]: typeof prev?.[cmId] === "string" ? prev[cmId] : "" }));
        setReplySecret((prev) => ({ ...prev, [cmId]: prev[cmId] ?? false }));
        setLoadingReply((prev) => ({ ...prev, [cmId]: !!prev?.[cmId] }));

        if (!reply?.[cmId]) replyData(cmId, null);
    }, [reply, replyData]);

    // 댓글 등록
    const submitReply = useCallback(async (cmId: number) => {
        if (!ensureLogin()) return;
        const content = (replyInput[cmId] ?? "").trim();
        if (content.length === 0) return;
        if (getByteLen(content) > 1000) {
            alert("최대 " + CM_MAX + "바이트(333자)까지 입력할 수 있습니다.");
            return;
        }

        setPostingReply(prev => ({ ...prev, [cmId]: true }));
        try {
            const body = { content, isSecret: replySecret[cmId] ? 'Y' : 'N' };
            const response = await postData(endpoints.postReply(cmId), body);
            if (response.status === 200) {
                const posted = response.data as ReplyDto;

                if (posted) {
                    setReply(prev => ({ ...prev, [cmId]: [posted, ...(prev[cmId] ?? [])] }));
                } else {
                    setReplyCursor(prev => ({ ...prev, [cmId]: null }));
                    await replyData(cmId, null);
                }

                setReplyInput(prev => ({ ...prev, [cmId]: "" }));
                setReplySecret(prev => ({ ...prev, [cmId]: false }));
            } else {
                alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        } catch (err) {
            console.error(err);
            alert("네트워크 오류가 발생했습니다.");
        } finally {
            setPostingReply(prev => ({ ...prev, [cmId]: false }));
        }
    }, [ensureLogin, replyInput, replySecret]);

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

    // 커뮤니티 무한스크롤
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

    // 후기 무한스크롤
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

    // 댓글 무한스크롤 (지금은 커뮤니티 댓글만)
    useEffect(() => {
        if (tab !== "community") return;

        const observers: IntersectionObserver[] = [];

        Object.entries(replySentinelRef.current).forEach(([id, el]) => {
            const cmId = Number(id);
            if (!el) return;
            const cursor = replyCursor[cmId];
            const isLoading = loadingReply[cmId];
            if (!cursor || isLoading) return;

            const io = new IntersectionObserver((entries) => {
                const first = entries[0];
                if (first.isIntersecting && !replyLoadingLockRef.current[cmId]) {
                    replyLoadingLockRef.current[cmId] = true;
                    replyData(cmId, cursor).finally(() => {
                        replyLoadingLockRef.current[cmId] = false;
                    });
                }
            }, { root: null, rootMargin: "300px", threshold: 0.01 });

            io.observe(el);
            observers.push(io);
        });
        return () => observers.forEach(o => o.disconnect());
    }, [tab, replyCursor, loadingReply, replyData]);

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
            await postData(endpoints.addRecentView(Number(projectId)));
        }
        recentView();
    }, [projectId]);

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
                                <AvatarImage src={project.profileImg} />
                                <AvatarFallback>{project.creatorName}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h4 className="font-semibold">{project.creatorName}</h4>
                                <p className="text-sm text-gray-600">
                                    팔로워 {formatPrice(followerCnt)}명 · 프로젝트 {project.projectCnt}개
                                </p>
                            </div>
                            {isFollowed ? (
                                <Button variant="outline" size="sm" disabled={loadingFollow || mutatingFollow}
                                    onClick={() => unfollowCreator(project.creatorId)}
                                    className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                    {(loadingFollow || mutatingFollow) ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                                    <span className="ml-1">언팔로우</span>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled={loadingFollow || mutatingFollow}
                                    onClick={() => followCreator(project.creatorId)}
                                    className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                                >
                                    {(loadingFollow || mutatingFollow) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                                    <span className="ml-1">팔로우</span>
                                </Button>
                            )}
                            <QnaAddModal />
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
                                className="prose max-w-none whitespace-pre-wrap break-all [overflow-wrap:anywhere]"
                                dangerouslySetInnerHTML={{ __html: project.content }}
                            />
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
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground rounded-md px-2 py-0.5 ring-1 ring-blue-100 bg-blue-50/40">
                                        커뮤니티
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-semibold ring-1 ring-blue-200">
                                        <MessageCircle className="h-3 w-3 mr-1" />{community.length}
                                    </span>
                                </div>
                                <Button size="sm" onClick={openCommunityModal}>글쓰기</Button>
                            </div>

                            <Dialog open={openCm} onOpenChange={handleCommunityOpenChange}>
                                <DialogContent className="w-[min(92vw,40rem)] sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>커뮤니티 글쓰기</DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">프로젝트에 대한 응원, 소식을 공유해보세요.</span>
                                            <span className="text-xs text-gray-500">{getByteLen(cmContent)}/1000 바이트 · {cmContent.length} 자</span>
                                        </div>

                                        <Textarea
                                            value={cmContent}
                                            onChange={handleChangeCm}
                                            onFocus={handleTextareaFocus}
                                            placeholder="내용을 입력하세요."
                                            className="min-h-[120px] w-full max-w-full resize-y overflow-auto [overflow-wrap:anywhere] [word-break:break-word]"
                                        />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={postingCm}>취소</Button>
                                        </DialogClose>
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
                                                            <p className="text-sm w-full max-w-full whitespace-pre-wrap [overflow-wrap:anywhere]">
                                                                {cm.cmContent}
                                                            </p>

                                                            <div className="flex items-center gap-2 mt-3">
                                                                <Button variant="ghost" size="sm" onClick={() => toggleReplies(cm.cmId)}>
                                                                    <MessageCircle className="h-3 w-3 mr-1" />
                                                                    댓글
                                                                    {getLocalReplyCnt(cm.cmId) > 0 && (
                                                                        <span className="ml-1 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
                                                                            {getLocalReplyCnt(cm.cmId)}
                                                                        </span>
                                                                    )}
                                                                </Button>
                                                            </div>

                                                            {/* 댓글 패널 */}
                                                            {openReply[cm.cmId] && (
                                                                <div className="mt-3 relative rounded-lg border bg-gray-50/70 p-3">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute right-2 top-2 h-7 w-7 text-gray-500 hover:text-gray-700"
                                                                        onClick={() => {
                                                                            setOpenReply((prev) => ({ ...prev, [cm.cmId]: false }))
                                                                            setReplyInput((prev) => ({ ...prev, [cm.cmId]: "" }))
                                                                        }}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                    {/* 목록 */}
                                                                    {(!loadingReply?.[cm.cmId] && (!Array.isArray(reply?.[cm.cmId]) || reply[cm.cmId].length === 0)) ? (
                                                                        <div className="text-xs text-muted-foreground pr-8">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</div>
                                                                    ) : (
                                                                        <div className="space-y-3">
                                                                            {(reply?.[cm.cmId] ?? []).filter(Boolean).map((rp) => (
                                                                                <div key={rp.replyId} className="flex items-start gap-2">
                                                                                    {/* TODO: 프로필 수정 필요 */}
                                                                                    <Avatar className="w-7 h-7">
                                                                                        {rp?.profileImg ? (
                                                                                            <AvatarImage src={rp.profileImg} />
                                                                                        ) : null}
                                                                                        <AvatarFallback>{(rp.nickname).slice(0, 2)}</AvatarFallback>
                                                                                    </Avatar>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-sm font-medium truncate">{rp.nickname}</span>
                                                                                            {rp.isSecret === 'Y' && (
                                                                                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 ring-1 ring-gray-200">
                                                                                                    🔒 비밀글
                                                                                                </span>
                                                                                            )}
                                                                                            <span className="text-[11px] text-gray-500">{getDaysBefore(rp.createdAt)} 전</span>
                                                                                        </div>
                                                                                        <p className="text-sm whitespace-pre-wrap [overflow-wrap:anywhere]">
                                                                                            {rp.content}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}

                                                                            {loadingReply?.[cm.cmId] && (
                                                                                <div className="space-y-2">
                                                                                    <div className="h-12 animate-pulse rounded-md bg-gray-100" />
                                                                                    <div className="h-12 animate-pulse rounded-md bg-gray-100" />
                                                                                </div>
                                                                            )}

                                                                            {/* 무한스크롤 sentinel */}
                                                                            {replyCursor?.[cm.cmId] && (
                                                                                <div
                                                                                    ref={(el) => {
                                                                                        if (!replySentinelRef.current) replySentinelRef.current = {};
                                                                                        replySentinelRef.current[cm.cmId] = el;
                                                                                    }}
                                                                                    className="h-1 w-full"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* 입력창 */}
                                                                    <div className="mt-3">
                                                                        <div className="rounded-md border bg-white">
                                                                            <Textarea
                                                                                value={replyText(cm.cmId)}
                                                                                onChange={(e) => setReplyInput((prev) => ({ ...prev, [cm.cmId]: e.target.value }))}
                                                                                placeholder="댓글을 입력하세요"
                                                                                className="min-h-[64px] resize-y"
                                                                            />
                                                                        </div>

                                                                        <div className="mt-2 flex items-center justify-between">
                                                                            <div className="flex items-center gap-3">
                                                                                {/* 비밀글 체크박스 */}
                                                                                <label className="flex items-center gap-2 text-xs text-gray-600">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={!!replySecret[cm.cmId]}
                                                                                        onChange={(e) => setReplySecret(prev => ({ ...prev, [cm.cmId]: e.target.checked }))}
                                                                                    />
                                                                                    비밀글
                                                                                </label>
                                                                                <span className="text-[11px] text-gray-500">
                                                                                    약 {replyText(cm.cmId).length}자
                                                                                </span>
                                                                            </div>

                                                                            <div className="flex items-center gap-3">
                                                                                {replyText(cm.cmId).trim().length > 0 && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setReplyInput((prev) => ({ ...prev, [cm.cmId]: "" }))}
                                                                                        className="text-xs text-gray-500 hover:underline"
                                                                                        disabled={!!postingReply?.[cm.cmId]}
                                                                                    >
                                                                                        지우기
                                                                                    </button>
                                                                                )}
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => submitReply(cm.cmId)}
                                                                                    disabled={!!postingReply?.[cm.cmId] || replyText(cm.cmId).trim().length === 0}
                                                                                >
                                                                                    {postingReply?.[cm.cmId] ? "등록중" : "등록"}
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
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

                                    {/* 무한스크롤 sentinel */}
                                    {communityCursor && <div ref={communitySentinelRef} className="h-1 w-full" />}
                                </>
                            )}
                        </TabsContent>

                        {/* 후기 */}
                        <TabsContent value="review">
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground rounded-md px-2 py-0.5 ring-1 ring-blue-100 bg-blue-50/40">
                                        후기
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-semibold ring-1 ring-blue-200">
                                        <MessageCircle className="h-3 w-3 mr-1" />{review.length}
                                    </span>
                                </div>
                            </div>

                            {review.length == 0 ? (
                                <div className="mt-4 rounded-lg border p-6 text-center">
                                    <p className="text-sm text-muted-foreground">게시글이 존재하지 않습니다.</p>
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
                                                                    <MessageCircle className="h-3 w-3 mr-1" /> 댓글
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

                                    {/* 무한스크롤 sentinel */}
                                    {reviewCursor && <div ref={reviewSentinelRef} className="h-1 w-full" />}
                                </>
                            )}
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
                                        <div className="text-xl font-bold">{formatPrice(project.currAmount)}원</div>
                                        <div className="text-sm text-gray-500">목표 {formatPrice(project.goalAmount)}원</div>
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
                                                                {formatPrice(r.price)}원 · {r.rewardCnt > 0 ? `잔여 ${max}개` : "무제한"}
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
                                            onClick={handleCheckout}
                                            disabled={cartSummary.totalQty === 0}
                                        >
                                            {formatPrice(cartSummary.totalAmount)}원 결제하기
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
                                            <span className="text-lg font-semibold">{formatPrice(reward.price)}원</span>
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
                                {cartSummary.totalQty > 0 ? `${formatPrice(cartSummary.totalAmount)}원 후원하기` : '리워드를 선택하세요'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function QnaAddModal() {
    const navigate = useNavigate();

    const tempUserId = 24;

    const { projectId: projectIdParam } = useParams<{ projectId: string }>();
    const projectId = useMemo<number | null>(() => {
        const num = Number(projectIdParam);
        return Number.isFinite(num) && num > 0 ? num : null;
    }, [projectIdParam]);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [qnaAdd, setQnaAdd] = useState<QnaAddRequest>({
        projectId: Number(projectId),
        userId: tempUserId,
        content: "",
        createdAt: new Date(Date.now())
    });

    const handleAddQna = async () => {
        const url = endpoints.addQuestion(Number(projectId), tempUserId);
        console.log(url);
        const response = await postData(url, qnaAdd);
        console.log(qnaAdd);
        if (response.status === 200) {
            alert("문의사항이 등록되었습니다.");
            setIsAddDialogOpen(false);
            navigate('/user/myqna');
        } else {
            alert("문의사항 등록 실패");
        }
    };

    return (
        <div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">문의하기</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Q&A 질문 등록</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        프로젝트에 관한 문의 사항을 적어주세요.
                    </DialogDescription>
                    <div className="space-y-3">
                        <Textarea
                            className="w-full border p-2 rounded"
                            value={qnaAdd.content}
                            onChange={(e) =>
                                setQnaAdd({ ...qnaAdd, content: e.target.value })
                            }
                            rows={20}
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">취소</Button>
                        </DialogClose>
                        <Button onClick={handleAddQna}>추가</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}