import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import CreatorHeader from "../components/CreatorHeader";
import CreatorProjects from "../components/CreatorProjects";
import CreatorReviews from "../components/CreatorReviews";
import CreatorFollowers from "../components/CreatorFollowers";
import { deleteData, endpoints, getData, postData } from "@/api/apis";
import { useCookies } from "react-cookie";
import { toastError, toastSuccess } from "@/utils/utils";
import type { CreatorSummary } from "@/types/creator";
import CreatorProfile from "../components/CreatorProfile";

const TAB_KEY = "creatorTab";

export default function CreatorPage() {
    const { creatorId: idParam } = useParams();
    const creatorId = Number(idParam || 250);

    const [totalCounts, setTotalCounts] = useState<{ totalReviews: number; totalProjects: number; totalFollowers: number; } | null>(null);
    const [summary, setSummary] = useState<CreatorSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [unfollowLoading, setUnfollowLoading] = useState(false);
    const [cookie] = useCookies();

    const [activeTab, setActiveTab] = useState(() => localStorage.getItem(TAB_KEY) || "profile");

    const handleTabChange = useCallback((val: string) => {
        setActiveTab(val);
        localStorage.setItem(TAB_KEY, val);
    }, []);

    useEffect(() => {
        return () => { localStorage.removeItem(TAB_KEY); };
    }, []);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        const res = await getData(endpoints.getCreatorSummary(creatorId), cookie.accessToken);
        if (res.status === 200) setSummary(res.data as CreatorSummary);
        setLoading(false);
    }, [creatorId]);

    const refreshFollowerCount = useCallback(async () => {
        const res = await getData(endpoints.getFollowerCnt(creatorId));
        if (res.status === 200) {
            setSummary(prev => prev ? { ...prev, followerCount: res.data } : prev);
        }
    }, [creatorId]);

    const fetchTotalCounts = useCallback(async () => {
        const res = await getData(endpoints.getTotalCounts(creatorId));
        if (res.status === 200) {
            setTotalCounts(res.data);
        }
    }, [creatorId]);

    useEffect(() => {
        fetchSummary();
        fetchTotalCounts();
    }, [fetchSummary]);

    const handleFollow = async () => {
        if (!summary) return;
        if (!cookie.accessToken) {
            toastError("로그인 후 이용해 주세요.");
            return;
        }
        setFollowLoading(true);
        try {
            const res = await postData(endpoints.followCreator(creatorId), {}, cookie.accessToken);
            if (res.status === 200) {
                setSummary({ ...summary, isFollowed: true });
                await refreshFollowerCount();
                toastSuccess("팔로우를 추가했어요.");
            } else {
                toastError("팔로우 추가에 실패했어요. 다시 시도해 주세요.");
            }
        } finally {
            setFollowLoading(false);
        }
    };

    const handleUnfollow = async () => {
        if (!summary) return;
        if (!cookie.accessToken) {
            toastError("로그인 후 이용해 주세요.");
            return;
        }
        setUnfollowLoading(true);
        try {
            const res = await deleteData(endpoints.unfollowCreator(creatorId), cookie.accessToken);
            if (res.status === 200) {
                setSummary({ ...summary, isFollowed: false });
                await refreshFollowerCount();
                toastSuccess("팔로우를 취소했어요.");
            } else {
                toastError("팔로우 취소에 실패했어요. 다시 시도해 주세요.");
            }
        } finally {
            setUnfollowLoading(false);
        }
    };

    if (loading || !summary) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10 flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" /> 불러오는 중…
            </div>
        );
    }

    return (
        <div className="w-[1232px] mx-auto py-8 space-y-8">
            <CreatorHeader data={summary} onFollow={handleFollow} onUnfollow={handleUnfollow} followLoading={followLoading} unfollowLoading={unfollowLoading} />

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="profile">프로필</TabsTrigger>
                    <TabsTrigger value="projects">올린 프로젝트
                        <span className="ml-1 text-xs text-muted-foreground">{totalCounts?.totalProjects}</span>
                    </TabsTrigger>
                    <TabsTrigger value="reviews">후기/커뮤니티
                        <span className="ml-1 text-xs text-muted-foreground">{totalCounts?.totalReviews}</span>
                    </TabsTrigger>
                    <TabsTrigger value="followers">팔로워
                        <span className="ml-1 text-xs text-muted-foreground">{totalCounts?.totalFollowers}</span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="projects" className="pt-6"><CreatorProjects creatorId={creatorId} /></TabsContent>
                <TabsContent value="reviews" className="pt-6"><CreatorReviews creatorId={creatorId} /></TabsContent>
                <TabsContent value="followers" className="pt-6"><CreatorFollowers creatorId={creatorId} /></TabsContent>
                <TabsContent value="profile" className="pt-6"><CreatorProfile creatorId={creatorId} /></TabsContent>
            </Tabs>
        </div>
    );
}
