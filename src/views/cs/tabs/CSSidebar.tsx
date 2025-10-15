import { Megaphone, MessagesSquare, Siren } from "lucide-react";
import { NavLink } from "react-router-dom";

export function CSSidebar() {
    const linkCls = (isActive: boolean) =>
        `w-full justify-start px-3 py-2 rounded-md text-left flex items-center gap-2
        ${isActive ? "bg-[rgba(75,143,250,1)] text-white font-semibold" : "text-gray-700 hover:bg-[rgba(75,143,250,0.2)] font-semibold"}`;
    
        return (
            <nav className="w-56 shrink-0 pr-2 space-y-1 text-base font-semibold">
                <NavLink to="/cs/notice" className={({ isActive }) => linkCls(isActive)}>
                    <Megaphone className="mr-2 h-4 w-4" /> 공지사항
                </NavLink>
                <NavLink to="/cs/inquiry" className={({ isActive }) => linkCls(isActive)}>
                    <MessagesSquare className="mr-2 h-4 w-4" /> 1:1 문의
                </NavLink>
                <NavLink to="/cs/report" className={({ isActive }) => linkCls(isActive)}>
                    <Siren className="mr-2 h-4 w-4" /> 신고하기
                </NavLink>
            
            </nav>
        )
}