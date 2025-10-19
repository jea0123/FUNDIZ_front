import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchCreatorProjectOptions, fetchCreatorReviews, type ReviewItem } from "@/mocks/creatorApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, } from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type Props = { creatorId: number };

export default function CreatorReviews({ creatorId }: Props) {
    const [items, setItems] = useState<ReviewItem[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [projectOptions, setProjectOptions] = useState<Array<{ projectId: number; title: string }>>([]);
    const [selectedProject, setSelectedProject] = useState<"all" | number>("all");
    const [photoOnly, setPhotoOnly] = useState(false);
    const size = 10;

    // 🔎 Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = useCallback((images: string[], idx: number) => {
        if (!images || images.length === 0) return;
        setLightboxImages(images);
        setLightboxIndex(idx);
        setLightboxOpen(true);
    }, []);

    const closeLightbox = useCallback(() => setLightboxOpen(false), []);
    const prevImg = useCallback(
        () => setLightboxIndex((i) => (i - 1 + lightboxImages.length) % lightboxImages.length),
        [lightboxImages.length]
    );
    const nextImg = useCallback(
        () => setLightboxIndex((i) => (i + 1) % lightboxImages.length),
        [lightboxImages.length]
    );

    // 키보드 네비게이션 (열렸을 때만)
    useEffect(() => {
        if (!lightboxOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prevImg();
            if (e.key === "ArrowRight") nextImg();
            if (e.key === "Escape") closeLightbox();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [lightboxOpen, prevImg, nextImg, closeLightbox]);

    // 무한스크롤
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            const pid = selectedProject === "all" ? undefined : Number(selectedProject);
            const { items: list, total } = await fetchCreatorReviews(creatorId, page, size, pid);
            let filtered = list;
            if (photoOnly) filtered = list.filter(r => r.images && r.images.length > 0);
            if (!mounted) return;
            setItems(prev => (page === 1 ? filtered : [...prev, ...filtered]));
            setTotal(total);
            setDone(page >= Math.ceil(total / size));
            setLoading(false);
        })();
        return () => { mounted = false; };
    }, [creatorId, page, selectedProject, photoOnly]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading && !done) setPage(p => p + 1);
        }, { rootMargin: "200px" });
        io.observe(el);
        return () => io.disconnect();
    }, [loading, done]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const opts = await fetchCreatorProjectOptions(creatorId);
            if (!mounted) return;
            setProjectOptions(opts);
        })();
        return () => { mounted = false; };
    }, [creatorId]);

    const onChangeProject = useCallback((value: string) => {
        setSelectedProject(value === "all" ? "all" : Number(value));
        setPage(1);
        setItems([]);
        setDone(false);
    }, []);

    return (
        <>
            <div className="space-y-4">
                {/* 상단 필터 바 */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        총 {total}개
                    </div>
                    <div className="flex items-center gap-2">
                        <Select
                            value={String(selectedProject)}
                            onValueChange={onChangeProject}
                        >
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
                                onCheckedChange={(val) => {
                                    setPhotoOnly(!!val);
                                    setPage(1);
                                    setItems([]);
                                    setDone(false);
                                }}
                            />
                            <label
                                htmlFor="photo-only"
                                className="text-sm text-muted-foreground cursor-pointer select-none"
                            >
                                포토 후기만
                            </label>
                        </div>
                    </div>
                </div>
                {items.map((rv) => (
                    <Card key={rv.cmId} className="p-5">
                        {/* 작성자 영역 */}
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

                                {/* 후기 텍스트 */}
                                <p className="mt-3 text-[15px] leading-7 whitespace-pre-line">{rv.cmContent}</p>

                                {/* 후기 이미지: 텍스트 아래 */}
                                {rv.images && rv.images.length > 0 && (
                                    <div className="mt-4 grid grid-cols-7 gap-2">
                                        {rv.images.map((src, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => openLightbox(rv.images!, idx)}
                                                className="group relative rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring"
                                                aria-label={`후기 이미지 ${idx + 1} 확대`}
                                            >
                                                <img
                                                    src={src}
                                                    alt=""
                                                    className="rounded-md object-cover w-full h-full transition-transform group-hover:scale-[1.01]"
                                                    loading="lazy"
                                                />
                                                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* 관련 프로젝트: 이미지 그리드 아래 */}
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
                {loading && (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <Loader2 className="animate-spin mr-2" /> 불러오는 중…
                    </div>
                )}
                {done && (
                    <div className="text-center text-xs text-muted-foreground py-4">마지막 후기예요.</div>
                )}
            </div >

            {/* 🖼 Lightbox */}
            < Dialog open={lightboxOpen} onOpenChange={setLightboxOpen} >
                <DialogContent
                    className="bg-transparent border-0 shadow-none p-0 flex items-center justify-center max-w-[96vw] max-h-[96vh]"
                >
                    <DialogHeader className="sr-only">
                        <DialogTitle>후기 이미지 미리보기</DialogTitle>
                    </DialogHeader>

                    {/* 닫기 버튼 */}
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

                    {/* 이미지 영역 */}
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
            </Dialog >

        </>
    );
}
