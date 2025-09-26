
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ApprovalsTab } from "./tabs/ApprovalsTab";
//import { ProjectsTab } from "./tabs/ProjectsTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { UsersTab } from "./tabs/UsersTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { CustomerCenterTab } from "./tabs/CustomerCenterTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, SearchCheck, LayoutList, Siren, Users, ChartColumnBig, Headset } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export function AdminDashboard() {
    const { pathname } = useLocation();

    const approvalsIsActive = pathname.startsWith("/admin/verify") || pathname.includes("tab=approvals");

    const linkCls = (isActive: boolean) =>
        `w-full justify-start px-3 py-2 rounded-md text-left flex items-center gap-2
        ${isActive ? "bg-gray-100 text-black" : "text-gray-700 hover:bg-gray-50"}`;

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
                    <NavLink to="/admin?tab=approvals" className={({ isActive }) => linkCls(isActive || approvalsIsActive)}>
                        <SearchCheck className="mr-2 h-4 w-4" /> 프로젝트 심사
                    </NavLink>
                    <NavLink to="/admin?tab=projects" className={({ isActive }) => linkCls(isActive)}>
                        <LayoutList className="mr-2 h-4 w-4" /> 프로젝트 목록
                    </NavLink>
                    <NavLink to="/admin?tab=reports" className={({ isActive }) => linkCls(isActive)}>
                        <Siren className="mr-2 h-4 w-4" /> 신고 관리
                    </NavLink>
                    <NavLink to="/admin?tab=users" className={({ isActive }) => linkCls(isActive)}>
                        <Users className="mr-2 h-4 w-4" /> 회원 관리
                    </NavLink>
                    <NavLink to="/admin?tab=analytics" className={({ isActive }) => linkCls(isActive)}>
                        <ChartColumnBig className="mr-2 h-4 w-4" /> 통계 분석
                    </NavLink>
                    <NavLink to="/admin?tab=customer-center" className={({ isActive }) => linkCls(isActive)}>
                        <Headset className="mr-2 h-4 w-4" /> 고객센터
                    </NavLink>
                </nav>

                <div className="flex-1 min-w-0 mt-6">
                    <Outlet />
                </div>

            </div>
        </div>
    );
}