import { useEffect, useState, type JSX } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Heart, User, Bell, Menu, X, CreditCard, Truck, Package, MessageCircle, CheckCircle2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useLoginUserStore } from '@/store/LoginUserStore.store';
import { useCookies } from 'react-cookie';
import { deleteData, endpoints, putData } from '@/api/apis';
import { useNotificationSSE } from '@/hooks/useNotificationSSE';
import type { Notification } from '@/types/notification';
import { getElapsedTime, toastError, toastSuccess } from '@/utils/utils';

const typeIcon: Record<string, JSX.Element> = {
    BACKING_SUCCESS: <CreditCard className="h-4 w-4 text-blue-500" />,
    BACKING_FAIL: <CreditCard className="h-4 w-4 text-red-500" />,
    SHIPPING_SENT: <Truck className="h-4 w-4 text-purple-500" />,
    SHIPPING_DELIVERED: <Truck className="h-4 w-4 text-green-500" />,
    PROJECT_UPDATE: <Package className="h-4 w-4 text-emerald-500" />,
    QNA_REPLY: <MessageCircle className="h-4 w-4 text-indigo-500" />,
    COMMENT_REPLY: <MessageCircle className="h-4 w-4 text-indigo-500" />,
};

export function Navbar() {
    const [cookie] = useCookies();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notis, setNotis] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [, setCookie] = useCookies();
    const { loginUser, resetLoginUser } = useLoginUserStore();
    const navigate = useNavigate();


    useEffect(() => {
        const initialUnreadCount = notis.filter(n => n.isRead === 'N').length;
        setUnreadCount(initialUnreadCount);
    }, [notis]);

    useNotificationSSE(
        // loginUser?.userId ?? 0
        501
        , (noti) => {
            setNotis(prev => [noti, ...prev]);
            if (noti.isRead === 'N') {
                setUnreadCount(prev => prev + 1);
                return;
            }
        });

    const markRead = async (id: number) => {
        const response = await putData(endpoints.markAsRead(id), cookie.accessToken);
        if (response && response.status === 200) {
            setNotis(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: 'Y' } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            toastSuccess("알림을 읽음 처리했습니다");
        } else {
            toastError("알림 읽음 처리에 실패했습니다");
        }
    };

    const markAllRead = async () => {
        const ids = notis.filter(n => n.isRead === 'N').map(n => n.notificationId);
        if (ids.length === 0) return;
        const response = await putData(endpoints.markAllAsRead, cookie.accessToken);
        if (response && response.status === 200) {
            setNotis(prev => prev.map(n => ({ ...n, isRead: 'Y' })));
            setUnreadCount(0);
            toastSuccess("모든 알림을 읽음 처리했습니다");
        } else {
            toastError("알림 읽음 처리에 실패했습니다");
        }
    };

    const deleteNoti = async (id: number) => {
        const response = await deleteData(endpoints.deleteNotification(id), cookie.accessToken);
        if (response && response.status === 200) {
            setNotis(prev => prev.filter(n => n.notificationId !== id));
            toastSuccess("알림을 삭제했습니다");
            return;
        } else {
            toastError("알림 삭제에 실패했습니다");
        }
    };

    const navigateDetail = (noti: Notification) => {
        // ✔ 카드 클릭은 상세로 이동만 (읽음 처리 X)
        if (noti.type?.startsWith('SHIPPING')) navigate('/orders/123/shipping');
        else if (noti.type?.startsWith('BACKING') || noti.type?.startsWith('PAYMENT')) navigate('/orders/123');
        else if (noti.type === 'QNA_REPLY') navigate('/qna/456');
        else navigate(`/notifications/${noti.notificationId}`);
    };

    const logoutHandler = () => {
        alert('로그아웃 되었습니다.');
        navigate('/');
        resetLoginUser();
        setCookie('accessToken', '', { path: '/', expires: new Date() })
    };

    const searchKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            navigate(`/project/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <button onClick={() => navigate('/')} className="text-2xl font-bold text-blue-600">CrowdFund</button>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="프로젝트, 크리에이터 검색"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={searchKeyHandler}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {loginUser ? (
                            <>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>프로젝트 둘러보기</Button>

                                {(loginUser.role === 'creator' || loginUser.role === 'admin') && (
                                    <Button variant="ghost" size="sm" onClick={() => navigate('/create')}>프로젝트 만들기</Button>
                                )}

                                {loginUser.role === 'admin' && (
                                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} >관리자</Button>
                                )}

                                <Button variant="ghost" size="sm">
                                    <Heart className="h-4 w-4" />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="relative">
                                            <Bell className="h-4 w-4" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[4px] rounded-full bg-red-500 text-[10px] leading-[16px] font-bold text-white">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end" className="w-96 p-0 rounded-lg shadow-lg border bg-white">
                                        {/* 헤더 */}
                                        <div className="px-4 py-2 border-b flex items-center justify-between">
                                            <span className="font-semibold">알림</span>
                                            <button
                                                onClick={markAllRead}
                                                className="text-xs text-blue-600 hover:underline disabled:text-gray-300"
                                                disabled={unreadCount === 0}
                                            >
                                                모두 읽음 처리
                                            </button>
                                        </div>

                                        {/* 리스트 */}
                                        <div className="max-h-96 overflow-y-auto">
                                            {notis.length > 0 ? (
                                                notis.map((n) => (
                                                    <div
                                                        key={n.notificationId}
                                                        onClick={() => navigateDetail(n)}
                                                        className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 relative group ${n.isRead === 'N' ? 'font-medium' : 'text-gray-600'
                                                            }`}
                                                    >
                                                        {/* 유형 아이콘 */}
                                                        <div className="pt-0.5">
                                                            {typeIcon[n.type] ?? <Bell className="h-4 w-4 text-gray-400" />}
                                                        </div>

                                                        {/* 본문 */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                {n.isRead === 'N' && <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />}
                                                                <span className="text-sm truncate">{n.message}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-400">{getElapsedTime(n.createdAt)}</span>
                                                        </div>

                                                        {/* 우측 액션: 읽음 / 삭제 (hover 시 노출) */}
                                                        <div className="flex items-center gap-2">
                                                            {n.isRead === 'N' && (
                                                                <button
                                                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-green-600 transition"
                                                                    onClick={(e) => { e.stopPropagation(); markRead(n.notificationId); }}
                                                                    aria-label="읽음 처리"
                                                                    title="읽음 처리"
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                                                                onClick={(e) => { e.stopPropagation(); deleteNoti(n.notificationId); }}
                                                                aria-label="알림 삭제"
                                                                title="삭제"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-sm text-gray-500">새 알림이 없습니다</div>
                                            )}
                                        </div>

                                        {/* 모두 보기 */}
                                        <div className="border-t">
                                            <button
                                                onClick={() => navigate("/notifications")}
                                                className="w-full px-4 py-2 text-sm text-blue-600 font-medium hover:bg-gray-50"
                                            >
                                                모두 보기
                                            </button>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="rounded-full">
                                            <User className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate('/user/mypage')}>
                                            마이페이지
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={logoutHandler}>
                                            로그아웃
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>로그인</Button>
                                <Button size="sm" onClick={() => navigate('/auth/register')}>회원가입</Button>
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                <div className="md:hidden pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="프로젝트, 크리에이터 검색"
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={searchKeyHandler}
                            className="pl-10"
                        />
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col space-y-2">
                            {loginUser ? (
                                <>
                                    <Button variant="ghost" onClick={() => navigate('/')}>프로젝트 둘러보기</Button>
                                    {(loginUser.role === 'creator' || loginUser.role === 'admin') && (
                                        <Button variant="ghost" onClick={() => navigate('/create')}>
                                            프로젝트 만들기
                                        </Button>
                                    )}
                                    {loginUser.role === 'admin' && (
                                        <Button variant="ghost" onClick={() => navigate('/admin')}>
                                            관리자
                                        </Button>
                                    )}
                                    <Button variant="ghost" onClick={() => navigate('/mypage')}>
                                        마이페이지
                                    </Button>
                                    <Button variant="ghost" onClick={logoutHandler}>
                                        로그아웃
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" onClick={() => navigate('/login')}>
                                        로그인
                                    </Button>
                                    <Button onClick={() => navigate('/register')}>회원가입</Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export function Footer() {
    return (
        <div style={{ padding: '30px' }}>
            <ul style={{ listStyle: 'none', textAlign: 'center' }}>
                <li style={{ display: 'inline-block', marginRight: '50px' }}><a href="/user/mypage">마이페이지</a></li>
                <li style={{ display: 'inline-block', marginRight: '50px' }}><a href="/cs">고객센터</a></li>
                <li style={{ display: 'inline-block' }}><a href="/admin">관리자 대시보드</a></li>
            </ul>
        </div>
    );

}
