import { Bell, CreditCard, Heart, LayoutDashboard, MessagesSquare, Package, Settings, Siren } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { SavedAddressModal } from '../../backing/SavedAddressModal';

export function UserSidebar() {
    const { pathname } = useLocation();

    const approvalsIsActive = pathname.startsWith("/admin/verify") || pathname.includes("tab=approvals");


    const linkCls = (isActive: boolean) =>
        `w-full justify-start px-3 py-2 rounded-md text-left flex items-center gap-2
        ${isActive ? "bg-[rgba(79,137,250,1)] text-white font-semibold" : "text-gray-700 hover:bg-[rgba(79,137,250,0.2)] font-semibold"}`;

    return (
        <nav className="w-56 shrink-0 pr-2 mt-6 space-y-2">
            <NavLink to="/user/main" className={({ isActive }) => linkCls(isActive)}>
                <LayoutDashboard className="mr-2 h-4 w-4" />메인
            </NavLink>
            <NavLink to="/user/support" className={({ isActive }) => linkCls(isActive)}>
                <Package className="mr-2 h-4 w-4" />후원한 프로젝트
            </NavLink>
            <NavLink to="/user/wishlist" className={({ isActive }) => linkCls(isActive || approvalsIsActive)}>
                <Heart className="mr-2 h-4 w-4" />찜한 프로젝트
            </NavLink>
            <SavedAddressModal
                mode="mypage"
                triggerText="배송지 관리"
                onSelectAddress={(address) => {
                    console.log('선택된 주소 : ', address);
                }}
            />
            <NavLink to="/user/payment" className={({ isActive }) => linkCls(isActive)}>
                <CreditCard className="mr-2 h-4 w-4" />결제 수단 관리
            </NavLink>
            <NavLink to="/user/settings" className={({ isActive }) => linkCls(isActive)}>
                <Settings className="mr-2 h-4 w-4" />계정 설정
            </NavLink>
            <NavLink to="/user/notifications" className={({ isActive }) => linkCls(isActive)}>
                <Bell className="mr-2 h-4 w-4" />알림
            </NavLink>
            <NavLink to="/user/myqna" className={({ isActive }) => linkCls(isActive)}>
                <MessagesSquare className="mr-2 h-4 w-4" />내 Q&A 내역
            </NavLink>
            <NavLink to="/user/myinquiry" className={({ isActive }) => linkCls(isActive)}>
                <MessagesSquare className="mr-2 h-4 w-4" />내 문의 내역
            </NavLink>
            <NavLink to="/user/myreports" className={({ isActive }) => linkCls(isActive)}>
                <Siren className="mr-2 h-4 w-4" />내 신고 내역
            </NavLink>
        </nav>
    )
}