import { Card, CardContent } from '@/components/ui/card';
import { SavedAddressModal } from '../backing/SavedAddressModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Heart, MessagesSquare, Package, Settings, Siren } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLoginUserStore } from '@/store/LoginUserStore.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MyPageLayout() {
    const { loginUser } = useLoginUserStore();
    const [roleView, setRoleView] = useState<'user' | 'creator'>('user');
    const navigate = useNavigate();

    const navigateToCreator = () => {
        if (loginUser?.creatorId == null) {
            navigate('/creator/register');
            return;
        }
        navigate('/creator');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="flex justify-center mb-4 space-x-2">
                                <Button variant={roleView === 'user' ? 'default' : 'outline'} onClick={() => setRoleView('user')}>
                                    후원자
                                </Button>
                                <Button variant={roleView === 'creator' ? 'default' : 'outline'} onClick={navigateToCreator}>
                                    창작자
                                </Button>
                            </div>
                            <Avatar className="w-20 h-20 mx-auto mb-4">
                                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" />
                                <AvatarFallback>{loginUser?.nickname}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold mb-1">{loginUser?.nickname}</h3>
                            <p className="text-sm text-gray-500 mb-4">{loginUser?.email}</p>
                            <Badge variant="secondary">{loginUser?.role === 'creator' ? '크리에이터' : loginUser?.role === 'admin' ? '관리자' : '일반회원'}</Badge>
                        </CardContent>
                    </Card>

                    <div className="mt-6 space-y-2">
                        <Button variant="ghost" className="w-full justify-start cursor-pointer" onClick={() => navigate('/user')}>
                            <Package className="mr-2 h-4 w-4" />후원한 프로젝트
                        </Button>

                        <Button variant="ghost" className="w-full justify-start cursor-pointer" onClick={() => navigate('/user/wishlist')}>
                            <Heart className="mr-2 h-4 w-4" />찜한 프로젝트
                        </Button>

                        <SavedAddressModal
                            mode="mypage"
                            triggerText="배송지 관리"
                            onSelectAddress={(address) => {
                                console.log('선택된 주소 : ', address);
                            }}
                        />
                        <Button variant="ghost" className="w-full justify-start cursor-pointer" onClick={() => navigate('/user/settings')}>
                            <Settings className="mr-2 h-4 w-4" />계정 설정
                        </Button>

                        <Button variant="ghost" className="w-full justify-start cursor-pointer" onClick={() => navigate('/user/notifications')}>
                            <Bell className="mr-2 h-4 w-4" />알림
                        </Button>

                        <Button variant="ghost" className="w-full justify-start cursor-pointer" onClick={() => navigate('/user/myqna')}>
                            <MessagesSquare className="mr-2 h-4 w-4" />내 Q&A 내역
                        </Button>

                        <Button variant="ghost" className="w-full justify-start cursor-pointer" onClick={() => navigate('/user/myinquiry')}>
                            <MessagesSquare className="mr-2 h-4 w-4" />내 문의 내역
                        </Button>

                        <Button variant="ghost" className="w-full justify-start cursor-pointer" onClick={() => navigate('/user/myreports')}>
                            <Siren className="mr-2 h-4 w-4" />내 신고 내역
                        </Button>
                    </div>
                </div>
                <main className="lg:col-span-3 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
