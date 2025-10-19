import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CreatorSummary } from "@/mocks/creatorApi";
import { toastSuccess } from "@/utils/utils";
import { Share2, Plus } from "lucide-react";
import { useMemo } from "react";

type Props = {
    data: CreatorSummary, onToggleFollow: () => void; followLoading?: boolean;
};

export default function CreatorHeader({ data, onToggleFollow, followLoading }: Props) {
    const initials = useMemo(() => data.creator.creatorName.slice(0, 2), [data]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toastSuccess("링크가 복사됐어요.");
        } catch { }
    };

    return (
        <Card className="p-6 lg:p-7">
            <div className="grid grid-cols-[104px_1fr_auto] items-start gap-6">
                {/* 좌측: 브랜드 로고/아바타 */}
                <div className="flex items-start">
                    <Avatar className="h-[88px] w-[88px] rounded-2xl shadow-sm ring-1 ring-border">
                        <AvatarImage src={data.creator.profileImg || ""} />
                        <AvatarFallback className="rounded-2xl text-lg">{initials}</AvatarFallback>
                    </Avatar>
                </div>

                {/* 중앙: 이름/배지/로그인 + 통계 3칸 */}
                <div className="min-w-0">
                    {/* 상단: 배지 + 이름 + 부가텍스트 */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight">{data.creator.creatorName}</h1>
                    </div>
                    {data.lastLogin && (
                        <div className="mt-1 text-xs text-muted-foreground">{data.lastLogin.toLocaleString()}</div>
                    )}

                    {/* 통계 3칸: 팔로워 / 누적 후원자 */}
                    <div className="mt-5 grid grid-cols-3 gap-6 max-w-[520px]">
                        <StatBlock label="팔로워" value={String(data.followerCount ?? 0)} link />
                        <StatBlock label="누적 후원자" value={String(data.stats.totalBackers)} info />
                        <StatBlock label="총 후원 금액" value={String(data.stats.totalAmount)} info />
                    </div>
                </div>

                {/* 우측: 공유 / 팔로우 버튼 스택 */}
                <div className="flex flex-col items-end gap-3">
                    <Button variant="outline" onClick={copyLink} className="h-10 px-4">
                        <Share2 className="h-4 w-4 mr-2" /> 공유
                    </Button>
                    <Button onClick={onToggleFollow} disabled={followLoading} className="h-11 px-6">
                        <Plus className="h-4 w-4 mr-2" />
                        {data.isFollowed ? "팔로잉 중" : "팔로우"}
                    </Button>
                </div>
            </div>

            {/* 소개문 + 외부 링크는 기존처럼 하단에 배치(텀블벅은 오른쪽 버튼과 수평) */}
            {(data.creator.bio) && (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                    {data.creator.bio && (
                        <p className="text-sm whitespace-pre-line leading-7 text-foreground/90">
                            {data.creator.bio}
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
}

function StatBlock({
    label,
    value,
    link,
    info,
}: {
    label: string;
    value: string;
    link?: boolean;
    info?: boolean;
}) {
    return (
        <div className="select-none">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
                <span>{label}</span>
                {link ? <span className="ml-1 text-xs">›</span> : null}
                {info ? (
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full border text-[10px] text-muted-foreground/80">
                        i
                    </span>
                ) : null}
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums tracking-tight">{value}</div>
        </div>
    );
}
