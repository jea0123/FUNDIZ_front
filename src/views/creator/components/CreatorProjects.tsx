import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { percent, toWon } from "@/utils/utils";
import { endpoints, getData } from "@/api/apis";
import type { PageResult } from "@/types/projects";
import type { ProjectCard } from "@/types/creator";

type Props = { creatorId: number };

export default function CreatorProjects({ creatorId }: Props) {
    const [sort, setSort] = useState<"recent" | "popular" | "percent">("recent");
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<PageResult<ProjectCard> | null>(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const size = 8;

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            const res = await getData(endpoints.getCreatorProjects(creatorId, sort, page, size));
            if (!mounted) return;
            if (res.status === 200) {
                setItems(res.data as PageResult<ProjectCard>);
                setTotal(res.data.totalElements);
            }
            setLoading(false);
        })();
        return () => { mounted = false; };
    }, [creatorId, sort, page]);

    if (!items) return null;

    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center py-14 text-muted-foreground">
                    <Loader2 className="animate-spin mr-2" /> 불러오는 중…
                </div>
            ) : items.items.length === 0 ? (
                <div className="flex items-center justify-center py-14 text-muted-foreground">
                    등록된 프로젝트가 없어요.
                </div>
            ) : total > size ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">총 {total}개</div>
                        <div className="flex gap-2">
                            <Button size="sm" variant={sort === "recent" ? "default" : "outline"} onClick={() => { setPage(1); setSort("recent"); }}>최신순</Button>
                            <Button size="sm" variant={sort === "popular" ? "default" : "outline"} onClick={() => { setPage(1); setSort("popular"); }}>인기순</Button>
                            <Button size="sm" variant={sort === "percent" ? "default" : "outline"} onClick={() => { setPage(1); setSort("percent"); }}>후원율순</Button>
                        </div>
                    </div>
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {items.items.map(p => (
                                <Card key={p.projectId} className="overflow-hidden group cursor-pointer">
                                    <div className="aspect-[4/3] bg-muted/50">
                                        <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                                    </div>
                                    <CardContent className="p-4 space-y-2">
                                        <h4 className="font-medium line-clamp-2">{p.title}</h4>
                                        <div className="text-xs text-muted-foreground">후원 {toWon(p.backerCnt)}명</div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-semibold">{percent(p.currAmount, p.goalAmount)}%</span>
                                            <span className="text-muted-foreground">{toWon(p.currAmount)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {total > size && (
                            <div className="flex items-center justify-center space-x-2 mt-4">
                                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>이전</Button>
                                <span className="text-sm text-muted-foreground">페이지 {page}</span>
                                <Button size="sm" variant="outline" disabled={page * size >= total} onClick={() => setPage(page + 1)}>다음</Button>
                            </div>
                        )}
                    </>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.items.map(p => (
                        <Card key={p.projectId} className="overflow-hidden group cursor-pointer">
                            <div className="aspect-[4/3] bg-muted/50">
                                <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                            </div>
                            <CardContent className="p-4 space-y-2">
                                <h4 className="font-medium line-clamp-2">{p.title}</h4>
                                <div className="text-xs text-muted-foreground">후원 {toWon(p.backerCnt)}명</div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">{percent(p.currAmount, p.goalAmount)}%</span>
                                    <span className="text-muted-foreground">{toWon(p.currAmount)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )
            }
        </>
    );
}
