import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginUserStore } from '@/store/LoginUserStore.store';
import defaultProfile from '@/lib/default-profile.png'

export default function UserProfileCard() {
    const { loginUser } = useLoginUserStore();
    const [roleView, setRoleView] = useState<'user' | 'creator'>('user');
    const navigate = useNavigate();

    if (loginUser == null) {
        return;
    }

    const navigateToCreator = () => {
        if (loginUser?.creatorId == null) {
            navigate('/creator/register');
            return;
        }
        navigate('/creator');
    };

    return (
        <div className="pb-6 text-center border-b border-gray-200">
            <div className="flex justify-center mb-4 space-x-2">
                <Button variant={roleView === 'user' ? 'default' : 'outline'} onClick={() => setRoleView('user')}>
                    후원자
                </Button>
                <Button variant={roleView === 'creator' ? 'default' : 'outline'} onClick={navigateToCreator}>
                    창작자
                </Button>
            </div>
            <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={loginUser.profileImg ?? defaultProfile} />
                <AvatarFallback>{loginUser.nickname}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold mb-1">{loginUser.nickname}</h3>
            <p className="text-sm text-gray-500 mb-4">{loginUser?.email}</p>
            <Badge variant="secondary">{loginUser.role === 'creator' ? '크리에이터' : loginUser.role === 'admin' ? '관리자' : '일반회원'}</Badge>
        </div>
    );
}