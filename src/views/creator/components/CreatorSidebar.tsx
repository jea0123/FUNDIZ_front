import { Gauge, LayoutList, MessagesSquare, PlusSquare, Receipt, Settings, Truck, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";

export function CreatorSidebar() {
    const linkCls = (isActive: boolean) =>
        `w-full justify-start px-3 py-2 rounded-md text-left flex items-center gap-2
        ${isActive ? "bg-[rgba(75,143,250,1)] text-white font-semibold" : "text-gray-700 hover:bg-[rgba(75,143,250,0.2)] font-semibold"}`;
    
        return (
            <nav className="w-56 shrink-0 pr-2 mt-6 space-y-2">
                <NavLink to="/creator/dashboard" className={({ isActive }) => linkCls(isActive)}>
                    <Gauge className="mr-2 h-4 w-4" /> 대시보드
                </NavLink>
                <NavLink to="/creator/settings" className={({ isActive }) => linkCls(isActive)}>
                    <Settings className="mr-2 h-4 w-4" /> 창작자 정보 수정
                </NavLink>
                <NavLink to="/creator/project/new" className={({ isActive }) => linkCls(isActive)}>
                    <PlusSquare className="mr-2 h-4 w-4" /> 프로젝트 만들기
                </NavLink>
                <NavLink to="/creator/projects" className={({ isActive }) => linkCls(isActive)}>
                    <LayoutList className="mr-2 h-4 w-4" /> 프로젝트 목록
                </NavLink>
                <NavLink to="/creator/backings" className={({ isActive }) => linkCls(isActive)}>
                    <Receipt className="mr-2 h-4 w-4" /> 후원 내역
                </NavLink>
                <NavLink to="/creator/shipping" className={({ isActive }) => linkCls(isActive)}>
                    <Truck className="mr-2 h-4 w-4" /> 배송 내역
                </NavLink>
                <NavLink to="/creator/qna" className={({ isActive }) => linkCls(isActive)}>
                    <MessagesSquare className="mr-2 h-4 w-4" /> Q&A 목록
                </NavLink>
                <NavLink to="/creator/settlement" className={({ isActive }) => linkCls(isActive)}>
                    <Wallet className="mr-2 h-4 w-4" /> 정산 내역
                </NavLink>
            </nav>
        )
}