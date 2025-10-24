import { useRef, type KeyboardEvent } from 'react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, User, Bell, Menu, CheckCircle2, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLoginUserStore } from '@/store/LoginUserStore.store';
import { useCookies } from 'react-cookie';
import { deleteData, endpoints, putData } from '@/api/apis';
import { useNotificationSSE } from '@/hooks/useNotificationSSE';
import type { Notification } from '@/types/notification';
import { getElapsedTime, toastError, toastSuccess } from '@/utils/utils';
import { useNotificationStore, useUnreadCount } from '@/store/NotificationStore.store';
import { TypeIcon } from '@/components/TypeIcon';
import CategoryDropdown from './CategoryDropdown';
import clsx from 'clsx';

export function Header() {
    const navItems = [
        { label: "홈", to: "/" },
        { label: "인기", to: "/project/popular" },
        { label: "신규", to: "/project/new" },
        { label: "공개예정", to: "/project/coming-soon" },
        { label: "마감임박", to: "/project/closing" },
    ];

    const [cookie] = useCookies();
    const [searchQuery, setSearchQuery] = useState('');
    const [, setCookie] = useCookies();

    const [open, setOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { loginUser, resetLoginUser } = useLoginUserStore();
    const navigate = useNavigate();

    const notifications = useNotificationStore(s => s.notifications);
    const markReadLocal = useNotificationStore(s => s.markReadLocal);
    const markAllReadLocal = useNotificationStore(s => s.markAllReadLocal);
    const deleteLocal = useNotificationStore(s => s.deleteLocal);

    const unreadCount = useUnreadCount();

    useNotificationSSE(loginUser?.userId ?? 0);

    const openNow = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpen(true);
    };
    const closeSoon = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpen(false), 150);
    };

    /**
     * @description 특정 알림을 읽음 처리
     * @param {number} id 알림 ID
     * @example
     * markRead(123);
     */
    const markRead = async (id: number) => {
        const curr = useNotificationStore.getState().notifications
            .find(n => n.notificationId === id);
        if (!curr || curr.isRead === "Y") return;

        const response = await putData(endpoints.markAsRead(id), {}, cookie.accessToken);
        if (response && response.status === 200) {
            markReadLocal(id);
            toastSuccess("알림을 읽음 처리했습니다");
        } else {
            toastError("알림 읽음 처리에 실패했습니다");
        }
    };

    /**
     * @description 모든 알림을 읽음 처리
     * @example
     * markAllRead();
     */
    const markAllRead = async () => {
        if (unreadCount === 0) return;
        const response = await putData(endpoints.markAllAsRead, {}, cookie.accessToken);
        if (response && response.status === 200) {
            markAllReadLocal();
            toastSuccess("모든 알림을 읽음 처리했습니다");
        } else {
            toastError("알림 읽음 처리에 실패했습니다");
        }
    };

    /**
     * @description 특정 알림을 삭제
     * @param {number} id 알림 ID
     * @example
     * deleteNoti(123);
     */
    const deleteNoti = async (id: number) => {
        const response = await deleteData(endpoints.deleteNotification(id), cookie.accessToken);
        if (response && response.status === 200) {
            deleteLocal(id);
            toastSuccess("알림을 삭제했습니다");
            return;
        } else {
            toastError("알림 삭제에 실패했습니다");
        }
    };

    /**
     * @description 알림 클릭 시 상세 페이지로 이동
     * @param {Notification} noti 알림 객체
     * @example
     * navigateDetail(noti);
     */
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
        useNotificationStore.getState().clear();
        setCookie('accessToken', '', { path: '/', expires: new Date() })
    };

    /**
     * @description 검색어 입력 후 Enter 키 핸들러
     * @param {KeyboardEvent<HTMLInputElement>} e 키보드 이벤트
     * @example
     * searchKeyHandler(e);
     */
    const searchKeyHandler = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            navigate(`/project/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <>
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="h-14 flex items-center justify-between">
                        <button
                            onClick={() => navigate('/')}
                            className="text-2xl font-bold text-blue-600 cursor-pointer"
                        >
                            CrowdFund
                        </button>
                        <div className="flex items-center gap-3 min-w-[260px] justify-end">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>오픈 예정</Button>
                            {loginUser ? (
                                <>
                                    {loginUser.role === 'ADMIN' && (
                                        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>관리자</Button>
                                    )}
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
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map((n) => (
                                                        <div
                                                            key={n.notificationId}
                                                            onClick={() => navigateDetail(n)}
                                                            className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 relative group ${n.isRead === 'N' ? 'font-medium' : 'text-gray-600'
                                                                }`}
                                                        >
                                                            <div className="pt-0.5">
                                                                {TypeIcon[n.type] ?? <Bell className="h-4 w-4 text-gray-400" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    {n.isRead === 'N' && <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />}
                                                                    <span className="text-sm truncate">{n.message}</span>
                                                                </div>
                                                                <span className="text-xs text-gray-400">{getElapsedTime(n.createdAt)}</span>
                                                            </div>
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
                                            <div className="border-t">
                                                <button
                                                    onClick={() => navigate('/notifications')}
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
                                        <DropdownMenuContent align="end" className="w-40 rounded-lg shadow-lg border bg-white z-2000">
                                            <DropdownMenuItem onClick={() => navigate('/user')}>마이페이지</DropdownMenuItem>
                                            <DropdownMenuItem onClick={logoutHandler}>로그아웃</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                                        로그인
                                    </Button>
                                    <Button size="sm" onClick={() => navigate('/auth/register')}>
                                        회원가입
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="sticky top-0 z-500 bg-white border-b">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="h-12 flex items-center justify-between relative">
                        <div className='flex items-center justify-between gap-8'>
                            <div className="flex items-center gap-3" onPointerEnter={openNow} onPointerLeave={closeSoon} onFocusCapture={openNow} onBlurCapture={closeSoon}>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 text-gray-900 hover:text-blue-600 mb-[14px]"
                                    aria-expanded={open}
                                    aria-haspopup="dialog"
                                >
                                    <Menu className="w-5 h-5" />
                                    <span className="text-sm font-medium">카테고리</span>
                                </button>
                                <CategoryDropdown open={open} onClose={() => setOpen(false)} />
                            </div>

                            <nav className="hidden md:flex items-end gap-8 whitespace-nowrap">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.to === "/"}
                                        className={({ isActive }) =>
                                            clsx("px-1 pb-3 text-sm font-medium border-b-2 transition-colors",
                                                isActive
                                                    ? "text-gray-900 border-blue-600"
                                                    : "text-gray-700 hover:text-blue-600 border-transparent"
                                            )
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                        <div className="hidden md:block w-[300px] max-w-[50vw]">
                            <div className="relative w-full bg-gray-100 rounded-md mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input placeholder="검색어를 입력해주세요." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={searchKeyHandler} className="pl-10 h-9"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}