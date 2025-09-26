//import { ProjectsTab } from "./tabs/ProjectsTab";
import { ClipboardList, SearchCheck, LayoutList, Siren, Users, ChartColumnBig, NotebookPen, MessagesSquare, Megaphone, Pencil } from "lucide-react";

import { NavLink, Outlet, useLocation } from "react-router-dom";

export function AdminDashboard() {
    const { pathname } = useLocation();

    const approvalsIsActive = pathname.startsWith("/admin/verify") || pathname.includes("tab=approvals");

    const linkCls = (isActive: boolean) =>
        `w-full justify-start px-3 py-2 rounded-md text-left flex items-center gap-2
        ${isActive ? "bg-gray-00 text-black" : "text-gray-700 hover:bg-gray-50"}`;

    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-2">
                <h1 className="text-3xl mb-2">관리자 대시보드</h1>
                <p className="text-gray-600">플랫폼 운영 현황을 확인하고 관리하세요</p>
            </div>

            <div className="flex items-start gap-6">

                <nav className="w-56 shrink-0 border-r border-gray-200 pr-2 mt-6 space-y-2">
                    <NavLink to="/admin?tab=overview" className={({ isActive }) => linkCls(isActive)}>
                        <ClipboardList className="mr-2 h-4 w-4" /> 대시보드
                    </NavLink>
                    <NavLink to="/admin?tab=projects" className={({ isActive }) => linkCls(isActive)}>
                        <LayoutList className="mr-2 h-4 w-4" /> 프로젝트 목록
                    </NavLink>
                    <NavLink to="/admin?tab=approvals" className={({ isActive }) => linkCls(isActive || approvalsIsActive)}>
                        <SearchCheck className="mr-2 h-4 w-4" /> 프로젝트 심사
                    </NavLink>
                    <NavLink to="/admin?tab=analytics" className={({ isActive }) => linkCls(isActive)}>
                        <ChartColumnBig className="mr-2 h-4 w-4" /> 통계 분석
                    </NavLink>
                    <NavLink to="/admin?tab=users" className={({ isActive }) => linkCls(isActive)}>
                        <Users className="mr-2 h-4 w-4" /> 회원 관리
                    </NavLink>
                    <NavLink to="/admin?tab=reports" className={({ isActive }) => linkCls(isActive)}>
                        <Siren className="mr-2 h-4 w-4" /> 신고 관리
                    </NavLink>
                    <NavLink to="/admin?tab=inquiry" className={({ isActive }) => linkCls(isActive)}>
                        <MessagesSquare className="mr-2 h-4 w-4" /> 문의 내역
                    </NavLink>
                    <NavLink to="/admin?tab=notice" className={({ isActive }) => linkCls(isActive)}>
                        <Megaphone className="mr-2 h-4 w-4" /> 공지사항 관리
                    </NavLink>
                    <NavLink to="/admin?tab=noticeadd" className={({ isActive }) => linkCls(isActive)}>
                        <NotebookPen className="mr-2 h-4 w-4" /> 공지사항 등록
                    </NavLink>
                </nav>

                <div className="flex-1 min-w-0 mt-6">
                    <Outlet />
                </div>

            </div>
        </div>
    );
}