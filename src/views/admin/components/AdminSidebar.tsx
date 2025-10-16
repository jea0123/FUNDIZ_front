import { ChartColumnBig, Gauge, LayoutList, Megaphone, MessagesSquare, Receipt, SearchCheck, Siren, Users } from "lucide-react";
import { NavLink, useLocation  } from "react-router-dom";

export function AdminSidebar() {
    const { pathname } = useLocation();

    const approvalsIsActive = pathname.startsWith("/admin/verify") || pathname.includes("tab=approvals");


    const linkCls = (isActive: boolean) =>
        `w-full justify-start px-3 py-2 rounded-md text-left flex items-center gap-2
        ${isActive ? "bg-[rgba(75,143,250,1)] text-white font-semibold" : "text-gray-700 hover:bg-[rgba(75,143,250,0.2)] font-semibold"}`;
    
        return (
            <nav className="w-56 shrink-0 pr-2 space-y-1 text-base font-semibold">
                <NavLink to="/admin/overview" className={({ isActive }) => linkCls(isActive)}>
                        <Gauge className="mr-2 h-4 w-4" /> 대시보드
                    </NavLink>
                    <NavLink to="/admin/approvals" className={({ isActive }) => linkCls(isActive || approvalsIsActive)}>
                        <SearchCheck className="mr-2 h-4 w-4" /> 프로젝트 심사
                    </NavLink>
                    <NavLink to="/admin/projects" className={({ isActive }) => linkCls(isActive)}>
                        <LayoutList className="mr-2 h-4 w-4" /> 프로젝트 목록
                    </NavLink>
                    <NavLink to="/admin/reports" className={({ isActive }) => linkCls(isActive)}>
                        <Siren className="mr-2 h-4 w-4" /> 신고 관리
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => linkCls(isActive)}>
                        <Users className="mr-2 h-4 w-4" /> 회원 관리
                    </NavLink>
                    <NavLink to="/admin/analytics" className={({ isActive }) => linkCls(isActive)}>
                        <ChartColumnBig className="mr-2 h-4 w-4" /> 통계 분석
                    </NavLink>
                    <NavLink to="/admin/inquiry" className={({ isActive }) => linkCls(isActive)}>
                        <MessagesSquare className="mr-2 h-4 w-4" /> 문의 내역
                    </NavLink>
                    <NavLink to="/admin/notice" className={({ isActive }) => linkCls(isActive)}>
                        <Megaphone className="mr-2 h-4 w-4" /> 공지사항 관리
                    </NavLink>
                    <NavLink to="/admin/settlement" className={({ isActive }) => linkCls(isActive)}>
                        <Receipt className="mr-2 h-4 w-4" /> 정산 관리
                    </NavLink>
            </nav>
        )
}