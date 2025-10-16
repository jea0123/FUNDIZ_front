import { useEffect, useRef, useState, type JSX } from "react";
import { ChevronRight, Grid3X3, Layers, PenTool, Music2, Film, Gamepad2, Cpu, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

/** 실사용 시엔 /categories API 로드로 교체 가능 */
type Sub = { id: number; name: string };
type Cat = { id: number; name: string; icon: JSX.Element; subs: Sub[] };

const CATS: Cat[] = [
    {
        id: 1, name: "디자인", icon: <PenTool className="w-4 h-4" />, subs: [
            { id: 101, name: "제품 디자인" }, { id: 102, name: "브랜딩/그래픽" }, { id: 103, name: "패션/액세서리" },
        ]
    },
    {
        id: 2, name: "테크", icon: <Cpu className="w-4 h-4" />, subs: [
            { id: 201, name: "하드웨어" }, { id: 202, name: "소프트웨어" }, { id: 203, name: "IoT" },
        ]
    },
    {
        id: 3, name: "게임", icon: <Gamepad2 className="w-4 h-4" />, subs: [
            { id: 301, name: "콘솔/PC" }, { id: 302, name: "모바일" }, { id: 303, name: "보드/TCG" },
        ]
    },
    {
        id: 4, name: "출판", icon: <BookOpen className="w-4 h-4" />, subs: [
            { id: 401, name: "에세이/문학" }, { id: 402, name: "웹툰/일러스트" }, { id: 403, name: "잡지/무크" },
        ]
    },
    {
        id: 5, name: "음악", icon: <Music2 className="w-4 h-4" />, subs: [
            { id: 501, name: "앨범" }, { id: 502, name: "굿즈" }, { id: 503, name: "공연" },
        ]
    },
    {
        id: 6, name: "영화/비디오", icon: <Film className="w-4 h-4" />, subs: [
            { id: 601, name: "단편/장편" }, { id: 602, name: "다큐" }, { id: 603, name: "애니메이션" },
        ]
    },
    {
        id: 7, name: "아트", icon: <Layers className="w-4 h-4" />, subs: [
            { id: 701, name: "회화/조형" }, { id: 702, name: "사진" }, { id: 703, name: "전시" },
        ]
    },
    {
        id: 8, name: "기타", icon: <Grid3X3 className="w-4 h-4" />, subs: [
            { id: 801, name: "푸드" }, { id: 802, name: "공예" }, { id: 803, name: "지역/로컬" },
        ]
    },
];

interface Props {
    open: boolean;
    anchorWidth?: number;        // 버튼 너비에 맞춰 줄 때 사용
    onClose: () => void;
}

export default function CategoryMegaMenu({ open, anchorWidth, onClose }: Props) {
    const [hoverId, setHoverId] = useState<number>(CATS[0].id);
    const wrapRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // 바깥 클릭/포커스 아웃 닫기
    useEffect(() => {
        function handle(e: MouseEvent) {
            if (!wrapRef.current?.contains(e.target as Node)) onClose();
        }
        if (open) window.addEventListener("mousedown", handle);
        return () => window.removeEventListener("mousedown", handle);
    }, [open, onClose]);

    // ESC 닫기
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const active = CATS.find(c => c.id === hoverId) ?? CATS[0];

    return (
        <div
            ref={wrapRef}
            className={clsx(
                "absolute left-0 top-full z-50 translate-y-2",
                "transition-opacity duration-150",
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            style={{ width: Math.max(720, anchorWidth ?? 720) }}
            onMouseLeave={onClose}
            role="dialog"
            aria-label="카테고리 메가메뉴"
        >
            <div className="rounded-xl border bg-white/95 backdrop-blur shadow-xl">
                <div className="grid grid-cols-[260px_1fr]">
                    {/* 좌측: 상위 카테고리 */}
                    <ul className="p-3 border-r max-h-[420px] overflow-auto">
                        {CATS.map(cat => (
                            <li key={cat.id}>
                                <button
                                    onMouseEnter={() => setHoverId(cat.id)}
                                    onFocus={() => setHoverId(cat.id)}
                                    onClick={() => navigate(`/project/category/${cat.id}`)}
                                    className={clsx(
                                        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg",
                                        hoverId === cat.id ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-gray-500">{cat.icon}</span>
                                        <span className="text-sm font-medium">{cat.name}</span>
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* 우측: 선택된 서브카테고리 */}
                    <div className="p-4">
                        <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-900">{active.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">관심 있는 세부 분야를 골라보세요</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {active.subs.map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => navigate(`/project/search?ctgr=${active.id}&sub=${sub.id}`)}
                                    className="text-left text-sm px-3 py-2 rounded-lg border hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                >
                                    {sub.name}
                                </button>
                            ))}
                        </div>

                        {/* 추천/신규/베스트 영역(옵션) */}
                        <div className="mt-4 rounded-lg bg-gray-50 border p-3">
                            <div className="text-xs font-semibold text-gray-600 mb-2">추천 컬렉션</div>
                            <div className="flex flex-wrap gap-2">
                                {["오늘의 인기", "마감 임박", "신규 프로젝트"].map((t, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(`/project/search?filter=${encodeURIComponent(t)}`)}
                                        className="text-xs px-2 py-1 rounded-md border hover:bg-white"
                                    >
                                        #{t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
