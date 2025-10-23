import { endpoints, getData } from "@/api/apis";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CreatorInfo } from "@/types/creator";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import defaultProfile from '@/assets/images/default-profile.webp'
import { toPublicUrl } from "@/utils/utils";

export default function CreatorProfileCard() {
    const [cookie] = useCookies();
    const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
    const [roleView, setRoleView] = useState<"user" | "creator">("creator");
    const navigate = useNavigate();

    const getCreatorInfo = async () => {
        const res = await getData(endpoints.getCreatorInfo, cookie.accessToken);
        if (res.status === 200) {
            setCreatorInfo(res.data);
        }
    }

    useEffect(() => {
        getCreatorInfo();
    }, []);

    if (!creatorInfo) return null;

    return (
        <div className="pb-6 text-center border-b border-gray-200">
            <div className="flex justify-center mb-4 space-x-2">
                <Button
                    variant={roleView === "user" ? "default" : "outline"}
                    onClick={() => navigate("/user")}
                >
                    후원자
                </Button>
                <Button
                    variant={roleView === "creator" ? "default" : "outline"}
                    onClick={() => setRoleView("creator")}
                >
                    창작자
                </Button>
            </div>
            <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={toPublicUrl(creatorInfo?.profileImg) ?? defaultProfile} />
                <AvatarFallback>유저</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold mb-1">{creatorInfo.creatorName}</h3>
            <p className="text-sm text-gray-500 mb-4">{creatorInfo.email}</p>
            <Badge variant="secondary">창작자</Badge>
        </div>
    );
}