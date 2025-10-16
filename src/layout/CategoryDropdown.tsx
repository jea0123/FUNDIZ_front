import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Cpu, Gamepad2, BookOpen, Music2, Film, PenTool, Camera, Utensils, Crown, } from "lucide-react";
import clsx from "clsx";
import { endpoints, getData } from "@/api/apis";

const CATEGORIES = [
    { id: 1, name: "디자인", icon: <PenTool className="w-5 h-5" /> },
    { id: 2, name: "테크", icon: <Cpu className="w-5 h-5" /> },
    { id: 3, name: "게임", icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 4, name: "출판", icon: <BookOpen className="w-5 h-5" /> },
    { id: 5, name: "음악", icon: <Music2 className="w-5 h-5" /> },
    { id: 6, name: "영화·비디오", icon: <Film className="w-5 h-5" /> },
    { id: 7, name: "예술", icon: <Layers className="w-5 h-5" /> },
    { id: 8, name: "사진", icon: <Camera className="w-5 h-5" /> },
    { id: 9, name: "푸드", icon: <Utensils className="w-5 h-5" /> },
    { id: 10, name: "의류·잡화", icon: <Crown className="w-5 h-5" /> },
];

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function CategoryDropdown({ open, onClose }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [categories, setCategories] = useState<any[]>([]);

    const getCategories = async () => {
        const res = await getData(endpoints.getCategories);
        if (res.status === 200) {
            setCategories(res.data);
        }
    }

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        function handle(e: MouseEvent) {
            if (!ref.current?.contains(e.target as Node)) onClose();
        }
        if (open) document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [open, onClose]);

    return (
        <div
            ref={ref}
            className={clsx(
                "absolute left-0 top-full w-full bg-white border-b shadow-sm transition-all duration-200 z-40 mt-1",
                open ? "opacity-100 visible" : "opacity-0 invisible -translate-y-2"
            )}
            onMouseLeave={onClose}
        >
            <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-5 gap-y-5 gap-x-10">
                {categories.length > 0 ? categories.map((cat) => (
                    <button
                        key={cat.ctgrId}
                        onClick={() => navigate(`/project/category/${cat.ctgrId}`)}
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors group cursor-pointer"
                    >
                        <span className="text-gray-500 group-hover:text-blue-600">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.ctgrName}</span>
                    </button>
                )) : (
                    <div>카테고리가 없습니다.</div>
                )}
            </div>
        </div>
    );
}
