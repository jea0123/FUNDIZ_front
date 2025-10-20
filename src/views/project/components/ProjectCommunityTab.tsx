import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, MessageSquarePlus, Siren, X } from "lucide-react";
import { endpoints, getData, postData } from "@/api/apis";
import { getByteLen, getDaysBefore, toastSuccess, toPublicUrl } from "@/utils/utils";
import type { CommunityDto, Cursor, CursorPage } from "@/types/community";
import type { ReplyDto } from "@/types/reply";

type Props = {
    projectId: number;
    active?: boolean;
    ensureLogin: () => boolean;
    onCreated?: () => void;
};

const CM_MAX = 1000;

export default function ProjectCommunityTab({ projectId, active = false, ensureLogin, onCreated }: Props) {
    /* ----------------------------- Refs ----------------------------- */
    const communitySentinelRef = useRef<HTMLDivElement | null>(null);
    const replySentinelRef = useRef<Record<number, HTMLDivElement | null>>({});
    const communityLoadingLockRef = useRef(false);
    const replyLoadingLockRef = useRef<Record<number, boolean>>({});
    const exceededAlertedRef = useRef(false);

    /* ----------------------------- State ---------------------------- */
    const [community, setCommunity] = useState<CommunityDto[]>([]);
    const [communityCursor, setCommunityCursor] = useState<Cursor | null>(null);
    const [loadingCommunity, setLoadingCommunity] = useState(false);

    // 댓글
    const [reply, setReply] = useState<Record<number, ReplyDto[]>>({});
    const [replyCursor, setReplyCursor] = useState<Record<number, Cursor | null>>({});
    const [loadingReply, setLoadingReply] = useState<Record<number, boolean>>({});
    const [openReply, setOpenReply] = useState<Record<number, boolean>>({});
    const [postingReply, setPostingReply] = useState<Record<number, boolean>>({});
    const [replyInput, setReplyInput] = useState<Record<number, string>>({});
    const [replySecret, setReplySecret] = useState<Record<number, boolean>>({});

    // 글쓰기 모달
    const [openCm, setOpenCm] = useState(false);
    const [cmContent, setCmContent] = useState("");
    const [postingCm, setPostingCm] = useState(false);

    /* ---------------------------- Derived --------------------------- */
    const replyText = useCallback((id: number) => (typeof replyInput?.[id] === "string" ? replyInput[id] : ""), [replyInput]);

    /* --------------------------- Fetchers --------------------------- */
    const communityData = useCallback(
        async (cursor: Cursor | null) => {
            if (!projectId) return;
            setLoadingCommunity(true);
            try {
                const params = new URLSearchParams();
                if (cursor) {
                    if (cursor.lastCreatedAt) params.set("lastCreatedAt", cursor.lastCreatedAt);
                    if (cursor.lastId != null) params.set("lastId", String(cursor.lastId));
                }
                params.set("size", "10");

                const url = `${endpoints.getCommunityList(projectId)}?${params.toString()}`;
                const { status, data } = await getData(url);

                if (status !== 200 || !data) {
                    if (!cursor) setCommunity([]); // 첫 로드 실패면 초기화
                    setCommunityCursor(null);
                    return;
                }
                const page = data as CursorPage<CommunityDto>;
                const items = Array.isArray(page?.items) ? page.items : [];
                setCommunity((prev) => (cursor ? [...prev, ...items] : items));
                setCommunityCursor(page?.nextCursor ?? null);
            } finally {
                setLoadingCommunity(false);
            }
        },
        [projectId]
    );

    const replyData = useCallback(async (cmId: number, cursor: Cursor | null) => {
        setLoadingReply((prev) => ({ ...prev, [cmId]: true }));
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
                if (!cursor) setReply((prev) => ({ ...prev, [cmId]: [] }));
                setReplyCursor((prev) => ({ ...prev, [cmId]: null }));
                return;
            }
            const page = data as CursorPage<ReplyDto>;
            const items = Array.isArray(page?.items) ? page.items.filter(Boolean) : [];
            setReply((prev) => ({ ...prev, [cmId]: cursor ? ([...(prev[cmId] ?? []), ...items]) : items }));
            setReplyCursor((prev) => ({ ...prev, [cmId]: page?.nextCursor ?? null }));
        } finally {
            setLoadingReply((prev) => ({ ...prev, [cmId]: false }));
        }
    }, []);

    /* --------------------------- Handlers --------------------------- */
    const openCommunityModal = useCallback(() => {
        if (!projectId) return;
        if (!ensureLogin()) return;
        setOpenCm(true);
    }, [projectId, ensureLogin]);

    const handleCommunityOpenChange = useCallback((open: boolean) => {
        setOpenCm(open);
        if (!open) {
            setCmContent("");
            exceededAlertedRef.current = false;
        }
    }, []);

    const handleChangeCm = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let next = e.target.value;
        if (getByteLen(next) <= CM_MAX) {
            setCmContent(next);
            return;
        }
        while (getByteLen(next) > CM_MAX) next = next.slice(0, -1);
        setCmContent(next);
        if (!exceededAlertedRef.current) {
            exceededAlertedRef.current = true;
            alert("최대 " + CM_MAX + "바이트(333자)까지 입력할 수 있습니다.");
        }
    }, []);

    const handleTextareaFocus = useCallback(() => {
        exceededAlertedRef.current = false;
    }, []);

    const handleSubmitCommunity = useCallback(async () => {
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
            const url = endpoints.postCommunity(projectId);
            const body = { cmContent: content };
            const response = await postData(url, body);
            if (response.status === 200) {
                setOpenCm(false);
                setCmContent("");
                setCommunity([]);   // 첫 페이지부터 리로드
                setCommunityCursor(null);
                await communityData(null);
                toastSuccess("등록되었습니다.");
                onCreated?.();
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

    const toggleReplies = useCallback(
        (cmId: number) => {
            setOpenReply((prev) => ({ ...prev, [cmId]: !prev?.[cmId] }));
            setReply((prev) => ({ ...prev, [cmId]: Array.isArray(prev?.[cmId]) ? prev[cmId] : [] }));
            setReplyInput((prev) => ({ ...prev, [cmId]: typeof prev?.[cmId] === "string" ? prev[cmId] : "" }));
            setReplySecret((prev) => ({ ...prev, [cmId]: prev[cmId] ?? false }));
            setLoadingReply((prev) => ({ ...prev, [cmId]: !!prev?.[cmId] }));
            if (!reply?.[cmId]) replyData(cmId, null);
        },
        [reply, replyData]
    );

    const submitReply = useCallback(
        async (cmId: number) => {
            if (!ensureLogin()) return;
            const content = (replyInput[cmId] ?? "").trim();
            if (content.length === 0) return;
            if (getByteLen(content) > CM_MAX) {
                alert("최대 " + CM_MAX + "바이트(333자)까지 입력할 수 있습니다.");
                return;
            }

            setPostingReply((prev) => ({ ...prev, [cmId]: true }));
            try {
                const body = { content, isSecret: replySecret[cmId] ? "Y" : "N" };
                const response = await postData(endpoints.postReply(cmId), body);
                if (response.status === 200) {
                    const posted = response.data as ReplyDto;
                    if (posted) {
                        setReply((prev) => ({ ...prev, [cmId]: [posted, ...(prev[cmId] ?? [])] }));
                        setCommunity((prev) => prev.map((item) =>
                            item.cmId === cmId ? { ...item, replyCnt: (item.replyCnt ?? 0) + 1 } : item)
                        );
                    } else {
                        setReplyCursor((prev) => ({ ...prev, [cmId]: null }));
                        await replyData(cmId, null);
                    }
                    setReplyInput((prev) => ({ ...prev, [cmId]: "" }));
                    setReplySecret((prev) => ({ ...prev, [cmId]: false }));
                } else {
                    alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
                }
            } catch (err) {
                console.error(err);
                alert("네트워크 오류가 발생했습니다.");
            } finally {
                setPostingReply((prev) => ({ ...prev, [cmId]: false }));
            }
        },
        [ensureLogin, replyInput, replySecret, replyData]
    );

    /* ---------------------------- Effects --------------------------- */
    // 최초/프로젝트 변경 시 초기 로드
    useEffect(() => {
        setCommunity([]);
        setCommunityCursor(null);
        communityData(null);
    }, [projectId, communityData]);

    // 커뮤니티 무한스크롤
    useEffect(() => {
        if (!active) return; // 탭이 활성일 때만
        const el = communitySentinelRef.current;
        if (!el || !communityCursor || loadingCommunity) return;

        const io = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && !communityLoadingLockRef.current) {
                    communityLoadingLockRef.current = true;
                    communityData(communityCursor).finally(() => {
                        communityLoadingLockRef.current = false;
                    });
                }
            },
            { root: null, rootMargin: "300px", threshold: 0.01 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [active, communityCursor, loadingCommunity, communityData]);

    // 댓글 무한스크롤 (커뮤니티 탭 활성시에만)
    useEffect(() => {
        if (!active) return;
        const observers: IntersectionObserver[] = [];

        Object.entries(replySentinelRef.current).forEach(([id, el]) => {
            const cmId = Number(id);
            if (!el) return;
            const cursor = replyCursor[cmId];
            const isLoading = loadingReply[cmId];
            if (!cursor || isLoading) return;

            const io = new IntersectionObserver(
                (entries) => {
                    const first = entries[0];
                    if (first.isIntersecting && !replyLoadingLockRef.current[cmId]) {
                        replyLoadingLockRef.current[cmId] = true;
                        replyData(cmId, cursor).finally(() => {
                            replyLoadingLockRef.current[cmId] = false;
                        });
                    }
                },
                { root: null, rootMargin: "300px", threshold: 0.01 }
            );

            io.observe(el);
            observers.push(io);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, [active, replyCursor, loadingReply, replyData]);

    /* ---------------------------- Render ---------------------------- */
    return (
        <>
            {/* 글쓰기 모달 */}
            <Dialog open={openCm} onOpenChange={handleCommunityOpenChange}>
                <DialogContent className="w-[min(92vw,40rem)] sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>커뮤니티 글쓰기</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">프로젝트에 대한 응원, 소식을 공유해보세요.</span>
                            <span className="text-xs text-gray-500">
                                {getByteLen(cmContent)}/1000 바이트 · {cmContent.length} 자
                            </span>
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
                            <Button variant="outline" disabled={postingCm}>
                                취소
                            </Button>
                        </DialogClose>
                        <Button onClick={handleSubmitCommunity} disabled={postingCm || cmContent.trim().length === 0}>
                            {postingCm ? "등록중" : "등록"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 목록 */}
            {!Array.isArray(community) || community.length === 0 ? (
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
                                            <AvatarImage src={toPublicUrl(cm.profileImg)} />
                                            <AvatarFallback>{(cm.nickname ?? "U").slice(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium truncate">{cm.nickname}</span>
                                                <a href="/cs/report"><Siren className="w-4 h-4" /></a>
                                                <span className="text-sm text-gray-500">{getDaysBefore(cm.createdAt)} 전</span>
                                            </div>
                                            <p className="text-sm w-full max-w-full whitespace-pre-wrap [overflow-wrap:anywhere]">
                                                {cm.cmContent}
                                            </p>

                                            <div className="flex items-center gap-2 mt-3">
                                                <Button variant="ghost" size="sm" onClick={() => toggleReplies(cm.cmId)}>
                                                    <MessageCircle className="h-3 w-3 mr-1" />
                                                    댓글
                                                    <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1 rounded-full
                                                                    bg-blue-50 text-blue-700 text-[10px] font-semibold ring-1 ring-blue-200
                                                                    leading-none tabular-nums"
                                                    >
                                                        {cm.replyCnt ?? 0}
                                                    </span>
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
                                                            setOpenReply((prev) => ({ ...prev, [cm.cmId]: false }));
                                                            setReplyInput((prev) => ({ ...prev, [cm.cmId]: "" }));
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>

                                                    {/* 목록 렌더 */}
                                                    {!loadingReply?.[cm.cmId] && (!Array.isArray(reply?.[cm.cmId]) || reply[cm.cmId].length === 0) ? (
                                                        <div className="text-xs text-muted-foreground pr-8">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {(reply?.[cm.cmId] ?? [])
                                                                .filter(Boolean)
                                                                .map((rp) => (
                                                                    <div key={rp.replyId} className="flex items-start gap-2">
                                                                        {/* TODO: 이미지 */}
                                                                        <Avatar className="w-7 h-7">
                                                                            {rp?.profileImg ? <AvatarImage src={rp.profileImg} /> : null}
                                                                            <AvatarFallback>{(rp.nickname ?? "U").slice(0, 2)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-medium truncate">{rp.nickname}</span>
                                                                                <span className="text-[11px] text-gray-500">{getDaysBefore(rp.createdAt)} 전</span>
                                                                            </div>
                                                                            <p className="text-sm whitespace-pre-wrap [overflow-wrap:anywhere]">{rp.content}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                            {loadingReply?.[cm.cmId] && (
                                                                <div className="space-y-2">
                                                                    <div className="h-12 animate-pulse rounded-md bg-gray-100" />
                                                                    <div className="h-12 animate-pulse rounded-md bg-gray-100" />
                                                                </div>
                                                            )}

                                                            {/* 댓글 무한스크롤 sentinel */}
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
                                                                <span className="text-[12px] text-gray-500 ml-2">약 {replyText(cm.cmId).length}자</span>
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

                    {/* 커뮤니티 무한스크롤 sentinel */}
                    {communityCursor && <div ref={communitySentinelRef} className="h-1 w-full" />}
                </>
            )}
        </>
    );
}