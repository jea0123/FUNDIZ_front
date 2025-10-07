import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Youtube, Github, Mail, ArrowRight, Heart } from "lucide-react";

const nav = {
    about: [
        { label: "회사소개", href: "/about" },
        { label: "이용약관", href: "/terms" },
        { label: "개인정보처리방침", href: "/privacy" },
        { label: "채용", href: "/careers" },
        { label: "제휴문의", href: "/partnership" },
    ],
    support: [
        { label: "공지사항", href: "/cs/notice" },
        { label: "1:1 문의", href: "/cs/inquiry" },
        { label: "신고하기", href: "/cs/report" },
        { label: "환불/정책", href: "/policy/refund" },
        { label: "결제 안내", href: "/policy/payment" },
    ],
    explore: [
        { label: "인기 프로젝트", href: "/project/popular" },
        { label: "새 프로젝트", href: "/project/new" },
        { label: "카테고리", href: "/category" },
        { label: "크리에이터", href: "/creators" },
    ],
    management: [
        { label: "마이 페이지 (유저)", href: "/user/mypage" },
        { label: "창작자 페이지", href: "/creator" },
        { label: "관리자 콘솔", href: "/admin" },
    ],
};

const socials = [
    { label: "Facebook", href: "#", icon: Facebook },
    { label: "Instagram", href: "#", icon: Instagram },
    { label: "YouTube", href: "#", icon: Youtube },
    { label: "GitHub", href: "#", icon: Github },
];

export default function SiteFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-neutral-50 text-neutral-600 border-t border-neutral-200">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-400 shadow" />
                        <div>
                            <p className="text-lg font-semibold text-neutral-900 tracking-tight">FUNDING</p>
                            <p className="text-xs text-neutral-500">Crowdfunding Platform</p>
                        </div>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="w-full md:w-auto" aria-label="뉴스레터 구독">
                        <div className="flex w-full max-w-md items-center gap-2 rounded-xl bg-white p-2 border border-neutral-200 shadow-sm">
                            <Mail className="ml-1 size-5 shrink-0 text-neutral-400" aria-hidden />
                            <Input
                                type="email"
                                placeholder="이메일을 입력하세요"
                                className="border-0 bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 focus-visible:ring-0"
                            />
                            <Button type="submit" size="sm" className="rounded-lg bg-blue-500 hover:bg-blue-600">
                                구독 <ArrowRight className="ml-1 size-4" />
                            </Button>
                        </div>
                    </form>
                </motion.div>

                <Separator className="my-8 bg-neutral-200" />

                {/* Link grid */}
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="col-span-2 space-y-3 lg:col-span-2">
                        <p className="max-w-prose text-sm leading-6 text-neutral-500">
                            아이디어가 현실이 되도록 돕습니다. FUNDING은 창작자와 후원자가 투명하게 연결되는 공간을 지향합니다.
                        </p>
                        <div className="flex items-center gap-3">
                            {socials.map(({ label, href, icon: Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="inline-flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:border-blue-300 hover:text-blue-600 transition shadow-sm"
                                >
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <FooterColumn title="About Us" items={nav.about} />
                    <FooterColumn title="고객지원" items={nav.support} />
                    <FooterColumn title="탐색하기" items={nav.explore} />
                    <FooterColumn title="관리(임시)" items={nav.management} />
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

function FooterColumn({ title, items, }: { title: string; items: { label: string; href: string }[]; }) {
    return (
        <div>
            <h6 className="mb-3 text-sm font-semibold tracking-tight text-neutral-800">{title}</h6>
            <ul className="space-y-2">
                {items.map((it) => (
                    <li key={it.href}>
                        <a
                            href={it.href}
                            className="text-sm text-neutral-600 hover:text-blue-600 transition"
                        >
                            {it.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
