import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Youtube, Github, Heart } from "lucide-react";
import { NavLink } from "react-router-dom";

const nav = {
    about: [
        { label: "회사소개", href: null },
        { label: "이용약관", href: null },
        { label: "개인정보처리방침", href: null },
        { label: "채용", href: null },
        { label: "제휴문의", href: null },
    ],
    support: [
        { label: "공지사항", href: "/cs/notice" },
        { label: "1:1 문의", href: "/cs/inquiry" },
        { label: "신고하기", href: "/cs/report" },
        { label: "환불/정책", href: null },
        { label: "결제 안내", href: null },
    ],
    explore: [
        { label: "인기 프로젝트", href: null },
        { label: "새 프로젝트", href: null },
        { label: "카테고리", href: null },
        { label: "크리에이터", href: null },
    ],
    management: [
        { label: "후원자 페이지", href: "/user" },
        { label: "창작자 페이지", href: "/creator" },
        { label: "관리자 페이지", href: "/admin" },
    ],
    guide: [
        { label: "프로젝트 시작하기", href: "/creator/start" },
        { label: "가이드라인", href: "/creator/guide" },
        { label: "수수료 안내", href: "/creator/fees" },
        { label: "성공 사례", href: "/creator/success" },
    ],
};

const socials = [
    { label: "Facebook", href: null, icon: Facebook },
    { label: "Instagram", href: null, icon: Instagram },
    { label: "YouTube", href: null, icon: Youtube },
    { label: "GitHub", href: null, icon: Github },
];

export default function SiteFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-neutral-50 text-neutral-600 border-t border-neutral-200">
            <div className="mx-auto max-w-7xl py-12 w-[1232px]">

                {/* Link grid */}
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="col-span-2 space-y-3 lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
                        >
                            <div className="flex items-center gap-3 pb-3">
                                <div className="size-10 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-400 shadow" />
                                <div>
                                    <p className="text-lg font-semibold text-neutral-900 tracking-tight">FUNDING</p>
                                    <p className="text-xs text-neutral-500">Crowdfunding Platform</p>
                                </div>
                            </div>
                        </motion.div>
                        <p className="max-w-prose text-sm leading-6 text-neutral-500 pb-3">
                            아이디어가 현실이 되도록 돕습니다. FUNDING은 창작자와 후원자가 투명하게 연결되는 공간을 지향합니다.
                        </p>
                        <div className="flex items-center gap-3">
                            {socials.map(({ label, href, icon: Icon }) => (
                                <NavLink
                                    key={label}
                                    to={href ?? "#"}
                                    aria-label={label}
                                    className="inline-flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:border-blue-300 hover:text-blue-600 transition shadow-sm"
                                >
                                    <Icon className="size-4" />
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <FooterColumn title="About Us" items={nav.about} />
                    <FooterColumn title="고객지원" items={nav.support} />
                    <FooterColumn title="탐색하기" items={nav.explore} />
                    <FooterColumn title="관리(임시)" items={nav.management} />
                    {/* <FooterColumn title="창작 가이드" items={nav.guide} /> */}
                </div>

                <Separator className="my-8 bg-neutral-200" />

                <div className="flex flex-col gap-2 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
                    <p>© {year} FUNDING. All rights reserved.</p>
                    <p>
                        대표자:  · 사업자번호: 123-45-67890 · 이메일: contact@funding.com · 통신판매업 신고번호: 2025-서울강남-00000
                    </p>
                </div>

                <div className="mt-3 text-center text-[11px] text-neutral-500">
                    <p className="inline-flex items-center gap-1">
                        Made with <Heart className="size-3" /> by your team
                    </p>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, items, }: { title: string; items: { label: string; href: string | null }[]; }) {
    return (
        <div>
            <h6 className="mb-3 text-sm font-semibold tracking-tight text-neutral-800">{title}</h6>
            <ul className="space-y-2">
                {items.map((it) => (
                    <li key={it.label}>
                        <NavLink
                            to={it.href ?? "#"}
                            className="text-sm text-neutral-600 hover:text-blue-600 transition"
                        >
                            {it.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}
