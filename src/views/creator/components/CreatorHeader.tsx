import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CreatorSummary } from "@/types/creator";
import { formatNumber, toastSuccess } from "@/utils/utils";
import { Share2, Plus, UserMinus, Loader2 } from "lucide-react";
import { useMemo } from "react";
import defaultProfile from '@/assets/images/default-profile.webp'

type CreatorCore = {
    creatorName: string;
    profileImg?: string | null;
    bio?: string | null;
};

type Props = {
    data: CreatorSummary & {
        creator: CreatorCore;
        lastLogin?: Date | null;
        isFollowed: boolean;
        followerCount: number;
    };
    onFollow: () => void;
    onUnfollow: () => void;
    followLoading?: boolean;
    unfollowLoading?: boolean;
};

export default function CreatorHeader({ data, onFollow, onUnfollow, followLoading, unfollowLoading }: Props) {
    const initials = useMemo(
        () => (data.creator.creatorName || "").slice(0, 2),
        [data.creator.creatorName]
    );

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toastSuccess("링크가 복사됐어요.");
        } catch { }
    };

    return (
        <Card className="p-6 lg:p-7">
            <div className="grid grid-cols-[104px_1fr_auto] items-start gap-6">
                <div className="flex items-start">
                    <Avatar className="h-[88px] w-[88px] rounded-2xl shadow-sm ring-1 ring-border">
                        <AvatarImage src={data.creator.profileImg || defaultProfile} />
                        <AvatarFallback className="rounded-2xl text-lg">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {data.creator.creatorName}
                        </h1>
                        {data.isFollowed && (
                            <span className="text-xs rounded-full px-2 py-[2px] bg-primary/10 text-primary">
                                팔로잉 중
                            </span>
                        )}
                    </div>
                    {data.lastLogin && (
                        <div className="mt-1 text-xs text-muted-foreground">
                            {data.lastLogin.toLocaleString()}
                        </div>
                    )}

                    <div className="mt-5 grid grid-cols-3 gap-6 max-w-[520px]">
                        <StatBlock label="팔로워" value={formatNumber(data.followerCount)} link />
                        <StatBlock label="누적 후원자" value={formatNumber(data.stats.totalBackers)} info />
                        <StatBlock label="총 후원 금액" value={formatNumber(data.stats.totalAmount)} info />
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <Button variant="outline" onClick={copyLink} className="h-10 px-4">
                        <Share2 className="h-4 w-4 mr-2" /> 공유
                    </Button>

                    {!data.isFollowed ? (
                        <Button onClick={onFollow} disabled={!!followLoading} className="h-11 px-6" variant="default">
                            {followLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4 mr-2" />
                            )}
                            팔로우
                        </Button>
                    ) : (
                        <Button onClick={onUnfollow} disabled={!!unfollowLoading} className="h-11 px-6 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" variant="outline">
                            {unfollowLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <UserMinus className="h-4 w-4 mr-2" />
                            )}
                            언팔로우
                        </Button>
                    )}
                </div>
            </div>

            {data.creator.bio && (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                    <p className="text-sm whitespace-pre-line leading-7 text-foreground/90">
                        {data.creator.bio}
                    </p>
                </div>
            )}
        </Card>
    );
}

function StatBlock({ label, value, link, info }: { label: string; value: string; link?: boolean; info?: boolean; }) {
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
            <div className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
                {value}
            </div>
        </div>
    );
}
