import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Line, BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart, Area, } from "recharts";

// -----------------------------
// MOCK DATA
// -----------------------------
const MOCK_REVENUE_TREND = [
    { name: "1월", 프로젝트: 65, 후원금: 1_200_000_000 },
    { name: "2월", 프로젝트: 78, 후원금: 1_450_000_000 },
    { name: "3월", 프로젝트: 92, 후원금: 1_680_000_000 },
    { name: "4월", 프로젝트: 87, 후원금: 1_580_000_000 },
    { name: "5월", 프로젝트: 105, 후원금: 1_820_000_000 },
    { name: "6월", 프로젝트: 124, 후원금: 2_100_000_000 },
];

const MOCK_REWARD_SALES_TOP = [
    { reward: "얼리버드 A", qty: 1240, revenue: 1240 * 35000 },
    { reward: "스페셜 B", qty: 920, revenue: 920 * 55000 },
    { reward: "프리미엄 C", qty: 610, revenue: 610 * 89000 },
    { reward: "디지털 D", qty: 1880, revenue: 1880 * 9000 },
    { reward: "번들 E", qty: 430, revenue: 430 * 129000 },
];

const MOCK_PAYMENT_METHODS = [
    { method: "카드", value: 58 },
    { method: "간편결제", value: 27 },
    { method: "계좌이체", value: 10 },
    { method: "기타", value: 5 },
];

const MOCK_CATEGORY_SUCCESS = [
    { category: "테크", success: 72, fail: 28 },
    { category: "디자인", success: 65, fail: 35 },
    { category: "게임", success: 59, fail: 41 },
    { category: "푸드", success: 77, fail: 23 },
    { category: "음악", success: 62, fail: 38 },
];

// const MOCK_FUNNEL = {
//     views: 1_200_000,
//     likes: 210_500,
//     backs: 38_200,
//     paid: 35_100,
// };

const MOCK_RATING_BY_CATEGORY = [
    { category: "테크", avgRating: 4.3 },
    { category: "디자인", avgRating: 4.6 },
    { category: "게임", avgRating: 4.1 },
    { category: "푸드", avgRating: 4.4 },
    { category: "음악", avgRating: 4.2 },
];

// -----------------------------
// UTIL
// -----------------------------
const currency = (amount: number) =>
    new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(amount);

const numberCompact = (n: number) =>
    new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const percent = (v: number, fixed = 1) => `${v.toFixed(fixed)}%`;

const PIE_COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A855F7"]; // 파이 컬러 세트

// 공통 카드 높이 상수 (한 눈에 들어오도록)의 압축 버전
const HEIGHT_COMPACT = 260;  // 수익 분석 카드(축소)
const HEIGHT_MIDDLE = 260;   // 중간 카드들 높이(동일)
const HEIGHT_SMALL = 260;    // 하단 카드도 동일하게 맞춤

export function AnalyticsTab() {
    const [selectedPeriod, setSelectedPeriod] = useState("6months");
    const [categoryFilter, setCategoryFilter] = useState<string | "ALL">("ALL");

    // KPI 계산
    const kpis = useMemo(() => {
        const totalRevenue = MOCK_REVENUE_TREND.reduce((acc, d) => acc + d.후원금, 0);
        const totalProjects = MOCK_REVENUE_TREND.reduce((acc, d) => acc + d.프로젝트, 0);
        const platformFee = totalRevenue * 0.05;
        const successRate = 68.3; // 예시
        const avgPledge = 45230; // 예시
        return { totalRevenue, totalProjects, platformFee, successRate, avgPledge };
    }, [selectedPeriod]);

    // 카테고리 필터 적용
    const filteredCategorySuccess = useMemo(() => {
        if (categoryFilter === "ALL") return MOCK_CATEGORY_SUCCESS;
        return MOCK_CATEGORY_SUCCESS.filter((c) => c.category === categoryFilter);
    }, [categoryFilter]);

    const filteredRatings = useMemo(() => {
        if (categoryFilter === "ALL") return MOCK_RATING_BY_CATEGORY;
        return MOCK_RATING_BY_CATEGORY.filter((c) => c.category === categoryFilter);
    }, [categoryFilter]);

    return (
        <div className="space-y-6">
            {/* KPI 4개 (최상단) */}
            <div className="grid grid-cols-12 gap-6">
                {[{ title: "총 후원금", value: currency(kpis.totalRevenue), sub: `기간: ${selectedPeriod}` },
                { title: "플랫폼 수수료(5%)", value: currency(kpis.platformFee), sub: "정책 가정치" },
                { title: "성공률", value: percent(kpis.successRate), sub: "전체 프로젝트 대비" },
                { title: "평균 후원금", value: currency(kpis.avgPledge), sub: "후원자당 평균" },
                ].map((k, i) => (
                    <Card key={i} className="col-span-12 sm:col-span-6 lg:col-span-3">
                        <CardHeader><CardTitle>{k.title}</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{k.value}</div>
                            <p className="text-sm text-muted-foreground">{k.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 2행: 수익 분석(축소) + 리워드 Top */}
            <div className="grid grid-cols-12 gap-6">
                {/* 수익 분석 (축소) */}
                <Card className="col-span-12 xl:col-span-6 shadow-sm">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>수익 분석</CardTitle>
                        <div className="flex gap-2">
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger className="w-36"><SelectValue placeholder="기간" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1month">최근 1개월</SelectItem>
                                    <SelectItem value="3months">최근 3개월</SelectItem>
                                    <SelectItem value="6months">최근 6개월</SelectItem>
                                    <SelectItem value="1year">최근 1년</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={HEIGHT_COMPACT}>
                            <ComposedChart data={MOCK_REVENUE_TREND}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip formatter={(value: unknown, name: unknown) => [
                                    name === "후원금" ? currency(value as number) : (value as number),
                                    name as string,
                                ]} />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="프로젝트" fill="#A5B4FC" stroke="#6366F1" />
                                <Line yAxisId="right" type="monotone" dataKey="후원금" stroke="#22C55E" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 리워드 Top N */}
                <Card className="col-span-12 xl:col-span-6">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>인기 리워드 Top 5</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={HEIGHT_MIDDLE}>
                            <BarChart data={MOCK_REWARD_SALES_TOP} layout="vertical" margin={{ left: 24 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(v) => numberCompact(v as number)} />
                                <YAxis type="category" dataKey="reward" />
                                <Tooltip formatter={(value: unknown, name: unknown) => [
                                    name === "revenue" ? currency(value as number) : numberCompact(value as number),
                                    name === "qty" ? "수량" : "매출",
                                ]} />
                                <Legend />
                                <Bar dataKey="qty" name="수량" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="revenue" name="매출" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* 3행: 결제수단 + 카테고리 성공률 + 평균 평점 */}
            <div className="grid grid-cols-12 gap-6">
                {/* 결제 수단 분포 */}
                <Card className="col-span-12 xl:col-span-4">
                    <CardHeader><CardTitle>결제 수단 분포</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={HEIGHT_MIDDLE}>
                            <PieChart>
                                <Pie data={MOCK_PAYMENT_METHODS} dataKey="value" nameKey="method" outerRadius={100} label>
                                    {MOCK_PAYMENT_METHODS.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: unknown) => [`${v}%`, "비중"]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 카테고리 성공률 */}
                <Card className="col-span-12 xl:col-span-4">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>카테고리별 성공률</CardTitle>
                        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                            <SelectTrigger className="w-36"><SelectValue placeholder="카테고리" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">전체</SelectItem>
                                {MOCK_CATEGORY_SUCCESS.map((c) => (
                                    <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={HEIGHT_MIDDLE}>
                            <BarChart data={filteredCategorySuccess}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip formatter={(v: unknown, n: unknown) => [percent(v as number, 0), n as string]} />
                                <Legend />
                                <Bar dataKey="success" name="성공률" stackId="a" fill="#22C55E" />
                                <Bar dataKey="fail" name="실패율" stackId="a" fill="#EF4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 카테고리별 평균 평점 */}
                <Card className="col-span-12 xl:col-span-4">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>카테고리별 평균 평점</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={HEIGHT_MIDDLE}>
                            <BarChart data={filteredRatings}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip formatter={(v: unknown) => [Number(v).toFixed(2), "평점"]} />
                                <Bar dataKey="avgRating" name="평균 평점" fill="#6366F1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* 4행: 전환 퍼널 (가로 12칸) */}
            {/* <div className="grid grid-cols-12 gap-6">
                <Card className="col-span-12">
                    <CardHeader><CardTitle>관심 → 후원 전환 퍼널</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="rounded-2xl border p-4">
                                <div className="text-sm text-muted-foreground">조회수</div>
                                <div className="text-xl font-semibold">{numberCompact(MOCK_FUNNEL.views)}</div>
                            </div>
                            <div className="rounded-2xl border p-4">
                                <div className="text-sm text-muted-foreground">좋아요</div>
                                <div className="text-xl font-semibold">{numberCompact(MOCK_FUNNEL.likes)}</div>
                                <div className="text-xs text-muted-foreground">조회 → 좋아요 전환 {percent((MOCK_FUNNEL.likes / MOCK_FUNNEL.views) * 100, 1)}</div>
                            </div>
                            <div className="rounded-2xl border p-4">
                                <div className="text-sm text-muted-foreground">후원 시도</div>
                                <div className="text-xl font-semibold">{numberCompact(MOCK_FUNNEL.backs)}</div>
                                <div className="text-xs text-muted-foreground">좋아요 → 후원 시도 {percent((MOCK_FUNNEL.backs / MOCK_FUNNEL.likes) * 100, 1)}</div>
                            </div>
                            <div className="rounded-2xl border p-4">
                                <div className="text-sm text-muted-foreground">결제 완료</div>
                                <div className="text-xl font-semibold">{numberCompact(MOCK_FUNNEL.paid)}</div>
                                <div className="text-xs text-muted-foreground">시도 → 결제 {percent((MOCK_FUNNEL.paid / MOCK_FUNNEL.backs) * 100, 1)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div> */}
        </div>
    );
}

// -----------------------------
// 간단한 런타임 테스트 유틸
// -----------------------------
export function __test__kpi(totalRevenueSample = MOCK_REVENUE_TREND): { fee: number; projects: number } {
    const total = totalRevenueSample.reduce((a, d) => a + d.후원금, 0);
    const projects = totalRevenueSample.reduce((a, d) => a + d.프로젝트, 0);
    return { fee: Math.round(total * 0.05), projects };
}

// export function __test__funnelRate(v = MOCK_FUNNEL) {
//     return {
//         likeRate: Number(((v.likes / v.views) * 100).toFixed(1)),
//         backRate: Number(((v.backs / v.likes) * 100).toFixed(1)),
//         payRate: Number(((v.paid / v.backs) * 100).toFixed(1)),
//     };
// }
