import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchFollowers, type FollowerItem } from "@/mocks/creatorApi";

type Props = { creatorId: number };

export default function CreatorFollowers({ creatorId }: Props) {
    const [items, setItems] = useState<FollowerItem[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const size = 20;

    useEffect(() => {
        let mounted = true;
        (async () => {
            const { items, total } = await fetchFollowers(creatorId, page, size);
            if (!mounted) return;
            setItems(items);
            setTotal(total);
        })();
        return () => { mounted = false; };
    }, [creatorId, page]);

    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground">총 {total}명</div>
            <Card className="divide-y">
                {items.map(u => (
                    <div key={u.userId} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8"><AvatarImage src={u.profileImg || ""} /><AvatarFallback>{u.nickname.slice(0, 2)}</AvatarFallback></Avatar>
                            <div className="text-sm">{u.nickname}</div>
                        </div>
                        <Button variant={u.isFollowed ? "secondary" : "outline"} size="sm">
                            {u.isFollowed ? "팔로잉" : "팔로우"}
                        </Button>
                    </div>
                ))}
            </Card>

            <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>이전</Button>
                <span className="text-xs text-muted-foreground">페이지 {page} / {Math.max(1, Math.ceil(total / size))}</span>
                <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / size)} onClick={() => setPage(p => p + 1)}>다음</Button>
            </div>
        </div>
    );
}
