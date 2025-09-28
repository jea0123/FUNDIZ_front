import { ClipboardList } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const base = "/admin";
const linkCls = ({ isActive }: { isActive: boolean }) =>
    `w-full justify-start px-3 py-2 rounded-md text-left flex items-center gap-2
    ${isActive ? "bg-gray-100 text-black" : "text-gray-700 hover:bg-gray-50"}`;

export function AdminLink() {
    const { pathname } = useLocation();
    const isDetail = pathname.startsWith("/admin/verify");
    
    return (
        <NavLink
            to={`${base}?tab=approvals`}
            className={(arg) => linkCls({ isActive: arg.isActive || isDetail })}
        >
            <ClipboardList className="mr-2 h-4 w-4" /> 프로젝트 심사
        </NavLink>
    );
}

<nav className="w-56 shrink-0 border-r border-gray-200 pr-2 mt-6 space-y-1">
    <NavLink to={`${base}?tab=overview`} className={linkCls}>
        <ClipboardList className="mr-2 h-4 w-4" /> 대시보드
    </NavLink>

    <AdminLink />

    <NavLink to={`${base}?tab=projects`} className={linkCls}>
        <ClipboardList className="mr-2 h-4 w-4" /> 프로젝트 목록
    </NavLink>

    <NavLink to={`${base}?tab=reports`} className={linkCls}>
        <ClipboardList className="mr-2 h-4 w-4" /> 신고 관리
    </NavLink>

    <NavLink to={`${base}?tab=users`} className={linkCls}>
        <ClipboardList className="mr-2 h-4 w-4" /> 회원 관리
    </NavLink>

    <NavLink to={`${base}?tab=analytics`} className={linkCls}>
        <ClipboardList className="mr-2 h-4 w-4" /> 통계 분석
    </NavLink>

    <NavLink to={`${base}?tab=inquiry`} className={linkCls}>
        <ClipboardList className="mr-2 h-4 w-4" /> 문의 내역
    </NavLink>

    <NavLink to={`${base}?tab=notice`} className={linkCls}>
        <ClipboardList className="mr-2 h-4 w-4" /> 공지사항 관리
    </NavLink>
</nav>