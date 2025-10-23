import { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { percent, toWon } from "@/utils/utils";
import { endpoints, getData } from "@/api/apis";
import type { PageResult } from "@/types/projects";
import type { ProjectCard } from "@/types/creator";
import { useNavigate } from "react-router-dom";

type Props = { creatorId: number };

export default function CreatorProjects({ creatorId }: Props) {
    const [sort, setSort] = useState<"recent" | "popular" | "percent">("recent");
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<PageResult<ProjectCard> | null>(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
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
            ) : total > size && (
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
                                <div key={p.projectId} className="overflow-hidden group cursor-pointer" onClick={() => navigate(`/project/${p.projectId}`)}>
                                    <div className="relative aspect-[1] w-full overflow-hidden rounded-sm group">
                                        <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" />
                                    </div>
                                    <CardContent className="p-4 space-y-2">
                                        <h4 className="font-medium line-clamp-2 h-[48px]">{p.title}</h4>
                                        <div className="text-xs text-muted-foreground">후원 {toWon(p.backerCnt)}명</div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[14px] font-semibold text-red-600">{percent(p.currAmount, p.goalAmount)}%</span>
                                            <span className="text-muted-foreground">{toWon(p.currAmount)}</span>
                                        </div>

                                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200">
                                            <div
                                                className="h-1.5 rounded-full bg-red-500 transition-all"
                                                style={{ width: `${percent(p.currAmount, p.goalAmount)}%` }}
                                            />
                                        </div>

                                        {p.isSuccess && (
                                            <div className="mt-2 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                                                프로젝트 성공
                                            </div>
                                        )}
                                        {(!p.isSuccess && p.projectStatus === "FAILED") && (
                                            <div className="mt-2 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                                목표 미달
                                            </div>
                                        )}
                                    </CardContent>
                                </div>

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
            )}
        </>
    );
}
