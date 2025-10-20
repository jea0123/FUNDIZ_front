import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { endpoints, getData } from "@/api/apis";
import type { ReviewCursor, ReviewItem, SearchReviewsParams } from "@/types/community";

type Props = { creatorId: number };

export default function CreatorReviews({ creatorId }: Props) {
    const [items, setItems] = useState<ReviewItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [nextCursor, setNextCursor] = useState<ReviewCursor | null>(null);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);
    const [projectOptions, setProjectOptions] = useState<Array<{ projectId: number; title: string }>>([]);
    const [selectedProject, setSelectedProject] = useState<"all" | number>("all");
    const [photoOnly, setPhotoOnly] = useState(false);
    const size = 10;

    const inFlightRef = useRef(false);
    const loadingRef = useRef(false);
    const hasNextRef = useRef(true);
    const cursorRef = useRef<ReviewCursor | null>(null);
    const initialReqRef = useRef(false)
    const seenProjectsRef = useRef<Map<number, string>>(new Map());

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = useCallback((images: string[], idx: number) => {
        if (images?.length) {
            setLightboxImages(images);
            setLightboxIndex(idx);
            setLightboxOpen(true);
        }
    }, []);

    const closeLightbox = useCallback(() => setLightboxOpen(false), []);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => { hasNextRef.current = hasNext; }, [hasNext]);
    useEffect(() => { loadingRef.current = loading; }, [loading]);

    useEffect(() => {
        setItems([]);
        setNextCursor(null);
        setHasNext(true);
        cursorRef.current = null;
        inFlightRef.current = false;
        loadingRef.current = false;
        initialReqRef.current = false;
    }, [creatorId, selectedProject, photoOnly]);

    const fetchReviews = useCallback(async () => {
        if (inFlightRef.current || loadingRef.current || !hasNextRef.current) return;

        inFlightRef.current = true;
        loadingRef.current = true;
        setLoading(true);

        try {
            const query: SearchReviewsParams = { size };
            const c = cursorRef.current;
            if (c?.lastId) query.lastId = c.lastId;
            if (c?.lastCreatedAt) query.lastCreatedAt = new Date(c.lastCreatedAt);
            if (selectedProject !== "all") query.projectId = selectedProject;
            if (photoOnly) query.photoOnly = true;

            const res = await getData(endpoints.getCreatorReviews(creatorId, query));

            setItems(prev => {
                const merged = [...prev, ...res.data.items];
                const seen = new Set<number>();
                return merged.filter(it => !seen.has(it.cmId) && seen.add(it.cmId));
            });

            setNextCursor(res.data.nextCursor || null);
            setHasNext(Boolean(res.data.hasNext && res.data.nextCursor));
            setTotalCount(res.data.totalCount || 0);

            const pageItems = res.data.items as ReviewItem[];

            for (const r of pageItems) {
                const pid = r.project?.projectId;
                const title = r.project?.title ?? "";
                if (pid) seenProjectsRef.current.set(pid, title);
            }
            setProjectOptions(Array.from(seenProjectsRef.current.entries()).map(([projectId, title]) => ({ projectId, title })));

            cursorRef.current = res.data.nextCursor || null;
            hasNextRef.current = Boolean(res.data.hasNext && res.data.nextCursor);
        } catch (e) {
            console.error(e);
            setHasNext(false);
            hasNextRef.current = false;
        } finally {
            setLoading(false);
            loadingRef.current = false;
            inFlightRef.current = false;
        }
    }, [creatorId, selectedProject, photoOnly, size]);

    useEffect(() => {
        if (initialReqRef.current) return;
        initialReqRef.current = true;
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        if (items.length === 0 && hasNext && !loading) fetchReviews();
    }, [items.length, hasNext, fetchReviews]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const io = new IntersectionObserver((entries) => {
            const e = entries[0];
            if (!e.isIntersecting) return;

            if (!cursorRef.current) return;

            if (!loadingRef.current && hasNextRef.current) {
                io.unobserve(el);
                fetchReviews().finally(() => {
                    if (el && hasNextRef.current) io.observe(el);
                });
            }
        }, { rootMargin: "200px" });

        io.observe(el);
        return () => io.disconnect();
    }, [fetchReviews]);

    useEffect(() => {
        seenProjectsRef.current.clear();
        setProjectOptions([]);
    }, [creatorId]);

    const onChangeProject = useCallback((value: string) => {
        setSelectedProject(value === "all" ? "all" : Number(value));
    }, []);

    return (
        <>
            {loading && (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <Loader2 className="animate-spin mr-2" /> 불러오는 중…
                </div>
            )}
            {items.length === 0 && !loading && (
                <div className="text-center text-sm text-muted-foreground py-6">후기가 없어요.</div>
            )}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">총 {totalCount}개</div>
                    <div className="flex items-center gap-2">
                        <Select value={String(selectedProject)} onValueChange={onChangeProject}>
                            <SelectTrigger className="h-9 w-[220px]">
                                <SelectValue placeholder="프로젝트 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 프로젝트</SelectItem>
                                {projectOptions.map(opt => (
                                    <SelectItem key={opt.projectId} value={String(opt.projectId)}>
                                        {opt.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="photo-only"
                                checked={photoOnly}
                                onCheckedChange={(val) => setPhotoOnly(!!val)}
                            />
                            <label htmlFor="photo-only" className="text-sm text-muted-foreground cursor-pointer select-none">
                                포토 후기만
                            </label>
                        </div>
                    </div>
                </div>

                {items.map((rv) => (
                    <Card key={rv.cmId} className="p-5">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={rv.user.profileImg || ""} />
                                <AvatarFallback>{rv.user.nickname.slice(0, 2)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium">{rv.user.nickname}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(rv.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <p className="mt-3 text-[15px] leading-7 whitespace-pre-line">{rv.cmContent}</p>
                                {rv.images?.length > 0 && (
                                    <div className="mt-4 grid grid-cols-7 gap-2">
                                        {rv.images.map((src, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => openLightbox(rv.images!, idx)}
                                                className="group relative rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <img
                                                    src={src}
                                                    alt=""
                                                    className="rounded-md object-cover w-full h-full transition-transform group-hover:scale-[1.02]"
                                                    loading="lazy"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <a
                                    href={`/project/${rv.project.projectId}`}
                                    className="mt-5 flex items-center gap-3 w-fit rounded-md border p-2 pr-3 hover:bg-muted/50 transition-colors"
                                >
                                    <img
                                        src={rv.project.thumbnail || "https://placehold.co/60x40"}
                                        alt=""
                                        className="h-12 w-16 object-cover rounded"
                                    />
                                    <span className="text-sm font-medium line-clamp-1">{rv.project.title}</span>
                                </a>
                            </div>
                        </div>
                    </Card>
                ))}
                <div ref={sentinelRef} />
            </div>

            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="bg-transparent border-0 shadow-none p-0 flex items-center justify-center max-w-[96vw] max-h-[96vh]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>후기 이미지 미리보기</DialogTitle>
                    </DialogHeader>

                    <div className="absolute right-3 top-3 z-10">
                        <DialogClose asChild>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogClose>
                    </div>
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            key={lightboxImages[lightboxIndex]}
                            src={lightboxImages[lightboxIndex]}
                            alt=""
                            className="max-h-[92vh] max-w-[92vw] object-contain rounded-md select-none"
                            draggable={false}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
