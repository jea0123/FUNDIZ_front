import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Line, BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart, Area, } from "recharts";
import { endpoints, getData } from "@/api/apis";
import type { Analytics, Category, RewardSalesTop, SubcategorySuccess } from "@/types/admin";

// -------- utils --------
const currency = (amount: number) =>
    new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", notation: "compact", maximumFractionDigits: 1 }).format(amount ?? 0);

const numberCompact = (n: number) =>
    new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 }).format(n ?? 0);

const shortenLabel = (s: string, max = 16) => (s && s.length > max ? s.slice(0, max - 1) + "…" : s);

const percent = (v: number, fixed = 1) => `${(v ?? 0).toFixed(fixed)}%`;

const COLORS = {
    blue: "#3B82F6",
    green: "#10B981",
    amber: "#F59E0B",
    rose: "#F43F5E",
    violet: "#8B5CF6",
    cyan: "#06B6D4",
    slate: "#64748B",
};

const HEIGHT = 260;

// -------- component --------
export function AnalyticsTab() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCtgr, setSelectedCtgr] = useState<number | null>(null);
    const [subcatRows, setSubcatRows] = useState<SubcategorySuccess[] | null>(null);
    const [rewardSalesTops, setRewardSalesTops] = useState<RewardSalesTop[]>([]);

    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSubcat, setLoadingSubcat] = useState(false);
    const [loadingRewardTop, setLoadingRewardTop] = useState(false);

    // 기간 선택: 상단 우측
    const [selectedPeriod, setSelectedPeriod] = useState<"all" | "1m" | "3m" | "6m" | "1y">("6m");
    const periodLabel =
        selectedPeriod === "all"
            ? "전체기간"
            : ({ "1m": "최근 1개월", "3m": "최근 3개월", "6m": "최근 6개월", "1y": "최근 1년" } as const)[selectedPeriod] ??
            "최근 6개월";
    const [metric, setMetric] = useState<'qty' | 'revenue'>('qty');

    // cache for subcategory api
    const subcatCache = useRef(new Map<number, SubcategorySuccess[]>());

    // --- API helpers ---
    const getAdminAnalytics = async () => {
        const response = await getData(endpoints.getAdminAnalytics(selectedPeriod, metric));
        if (response.status === 200) {
            setAnalytics(response.data);
            setRewardSalesTops((response.data as Analytics).rewardSalesTops ?? []);
        } else {
            setAnalytics(null);
            setRewardSalesTops([]);
        }
    };

    const getCategories = async () => {
        const response = await getData(endpoints.getCategories);
        if (response.status === 200) setCategories(response.data);
    };

    const getRewardSalesTop = async () => {
        setLoadingRewardTop(true);
        const response = await getData(endpoints.getRewardSalesTop(selectedPeriod, metric));
        if (response.status === 200) {
            setRewardSalesTops(response.data ?? []);
        }
        else {
            setRewardSalesTops([]);
        }
        setLoadingRewardTop(false);
    };

    const getCategorySuccess = async (ctgrId: number) => {
        const response = await getData(endpoints.getCategorySuccess(ctgrId));
        if (response.status === 200) {
            const rows = response.data ?? [];
            setSubcatRows(rows);
            return rows as SubcategorySuccess[];
        }
        return null;
    };

    useEffect(() => {
        setLoadingAnalytics(true);
        getAdminAnalytics().finally(() => setLoadingAnalytics(false));
    }, [selectedPeriod]);

    // 카테고리 목록은 1회 로딩
    useEffect(() => {
        setLoadingCategories(true);
        getCategories().finally(() => setLoadingCategories(false));
    }, []);

    // 첫 로딩 시 기본 선택(첫 번째 카테고리)
    useEffect(() => {
        if (categories.length && selectedCtgr == null) setSelectedCtgr(categories[0].ctgrId);
    }, [categories, selectedCtgr]);


    useEffect(() => {
        setLoadingRewardTop(true);
        getRewardSalesTop().finally(() => setLoadingRewardTop(false));
    }, [metric, selectedPeriod]);

    // 카테고리 선택 시 서브카테고리 성공률
    useEffect(() => {
        if (!selectedCtgr) {
            setSubcatRows(null);
            return;
        }
        const cached = subcatCache.current.get(selectedCtgr);
        if (cached) {
            setSubcatRows(cached);
            return;
        }
        setLoadingSubcat(true);
        getCategorySuccess(selectedCtgr)
            .then((rows) => {
                if (rows) subcatCache.current.set(selectedCtgr, rows);
                else subcatCache.current.delete(selectedCtgr);
            })
            .finally(() => setLoadingSubcat(false));
    }, [selectedCtgr]);

    const kpis = useMemo(() => {
        if (!analytics) return { totalRevenue: 0, platformFee: 0, successRate: 0, avgPledge: 0 };
        return {
            totalRevenue: analytics.kpi.totalBackingAmount,
            platformFee: analytics.kpi.fee,
            successRate: analytics.kpi.successRate,
            avgPledge: analytics.kpi.backingAmountAvg,
        };
    }, [analytics]);

    const revenueTrendForChart = useMemo(() => analytics?.revenueTrends ?? [], [analytics]);

    const rewardSalesTopForChart = useMemo(() => {
        if (!rewardSalesTops) return [] as { reward: string; qty: number; revenue: number }[];
        return rewardSalesTops.map((d) => ({ reward: d.rewardName, qty: d.qty, revenue: d.revenue }));
    }, [rewardSalesTops]);

    const paymentPie = useMemo(() => {
        if (!analytics) return [] as { method: string; valuePct: number; cnt: number }[];
        const total = analytics.paymentMethods.reduce((a, b) => a + (b?.cnt ?? 0), 0) || 1;
        const label: Record<string, string> = { CARD: "카드", BANK_TRANSFER: "계좌이체", EASY_PAY: "간편결제", ETC: "기타" };
        return analytics.paymentMethods.map((pm) => ({
            method: label[pm.paymentMethod] ?? pm.paymentMethod,
            valuePct: Number(((pm.cnt / total) * 100).toFixed(1)),
            cnt: pm.cnt,
        }));
    }, [analytics]);

    const subcatRate = useMemo(() => {
        if (!subcatRows) return [] as { category: string; success: number; fail: number }[];
        return subcatRows.map((r) => {
            const total = (r.successCnt ?? 0) + (r.failCnt ?? 0);
            const success = total ? Math.round((r.successCnt / total) * 100) : 0;
            const fail = 100 - success;
            return { category: r.categoryName, success, fail };
        });
    }, [subcatRows]);

    const monthTick = (m: string) => (m?.includes("-") ? `${m.split("-")[1]}월` : m);

    // --- render ---
    return (
        <div className="space-y-6">
            {/* 상단 오른쪽 기간 선택 */}
            <div className="flex items-center justify-end">
                <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="기간 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="1m">최근 1개월</SelectItem>
                        <SelectItem value="3m">최근 3개월</SelectItem>
                        <SelectItem value="6m">최근 6개월</SelectItem>
                        <SelectItem value="1y">최근 1년</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-12 gap-6">
                {[
                    { title: "총 후원금", value: currency(kpis.totalRevenue), sub: `기간: ${periodLabel}` },
                    { title: "플랫폼 수수료(5%)", value: currency(kpis.platformFee), sub: "정책 가정치" },
                    { title: "성공률", value: percent(kpis.successRate), sub: "전체 프로젝트 대비" },
                    { title: "평균 후원금", value: currency(kpis.avgPledge), sub: "후원자당 평균" },
                ].map((k, i) => (
                    <Card key={i} className="col-span-12 sm:col-span-6 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>{k.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{k.value}</div>
                            <p className="text-sm text-muted-foreground">{k.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 수익 분석 + 리워드 Top */}
            <div className="grid grid-cols-12 gap-6">
                {/* 수익 분석 */}
                <Card className="col-span-12 xl:col-span-6 shadow-sm">
                    <CardHeader>
                        <CardTitle>수익 분석</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingAnalytics ? (
                            <div className="text-sm text-muted-foreground">불러오는 중…</div>
                        ) : revenueTrendForChart.length === 0 ? (
                            <div className="text-sm text-muted-foreground">해당 기간에 수익 분석 데이터가 없습니다</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={HEIGHT}>
                                <ComposedChart data={revenueTrendForChart}
                                    margin={{ top: 16, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tickFormatter={monthTick}
                                        padding={{ left: 8, right: 8 }}
                                    />
                                    <YAxis yAxisId="left"
                                        domain={[0, (max: number) => max * 1.1]}
                                    />
                                    <YAxis yAxisId="right" orientation="right"
                                        domain={[0, (max: number) => max * 1.1]}
                                        tickMargin={12}
                                        tickFormatter={(v) => currency(v)}
                                    />
                                    <Tooltip
                                        labelFormatter={(label) => label}
                                        formatter={(value: any, _name: any, item: any) => {
                                            const isRevenue = item?.dataKey === 'revenue';
                                            return [
                                                isRevenue ? currency(Number(value)) : Number(value),
                                                isRevenue ? '후원금' : '프로젝트 수',
                                            ];
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={28} />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="projectCnt"
                                        name="프로젝트 수"
                                        fill={COLORS.blue}
                                        stroke={COLORS.violet}
                                    />
                                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="후원금" stroke={COLORS.green} strokeWidth={2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* 리워드 Top N */}
                <Card className="col-span-12 xl:col-span-6">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>플랫폼 인기 리워드 Top 5 ({metric === 'revenue' ? '매출 기준' : '수량 기준'})</CardTitle>
                        <Select value={metric} onValueChange={(v) => setMetric(v as 'qty' | 'revenue')}>
                            <SelectTrigger className="w-28">
                                <SelectValue placeholder="기준" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="qty">수량 기준</SelectItem>
                                <SelectItem value="revenue">매출 기준</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {loadingAnalytics || loadingRewardTop ? (
                            <div className="text-sm text-muted-foreground">불러오는 중…</div>
                        ) : rewardSalesTopForChart.length === 0 ? (
                            <div className="text-sm text-muted-foreground">해당 기간에 리워드 판매/매출 데이터가 없습니다.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={HEIGHT}>
                                <BarChart data={rewardSalesTopForChart} layout="vertical" margin={{ left: 24 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    {/* 매출(금액) 축 - 아래 */}
                                    <XAxis
                                        type="number"
                                        xAxisId="revenueAxis"
                                        tickFormatter={(v) => numberCompact(v as number)}
                                    />
                                    {/* 수량 축 - 위 (작은 정수 범위) */}
                                    <XAxis
                                        type="number"
                                        xAxisId="qtyAxis"
                                        orientation="top"
                                        domain={[0, (dataMax: number) => Math.max(dataMax, 5)]}
                                        tickFormatter={(v) => `${v}`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="reward"
                                        width={50}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        interval={0}
                                        tickFormatter={(v) => shortenLabel(String(v), 10)}
                                    />
                                    <Tooltip
                                        labelFormatter={(label) => String(label)}
                                        formatter={(value: any, _name: string, payload: any) => {
                                            const key = payload?.dataKey; // 'qty' | 'revenue'
                                            const isRevenue = key === 'revenue';
                                            return [
                                                isRevenue ? currency(value) : numberCompact(value),
                                                isRevenue ? '매출' : '수량',
                                            ];
                                        }}
                                    />
                                    <Legend />
                                    {/* 수량 막대 → 위쪽 축 */}
                                    <Bar dataKey="qty" xAxisId="qtyAxis" name="수량" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                                    {/* 매출 막대 → 아래쪽 축 */}
                                    <Bar dataKey="revenue" xAxisId="revenueAxis" name="매출" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 결제 수단 분포 + 카테고리(→서브카테고리) 성공률 */}
            <div className="grid grid-cols-12 gap-6">
                {/* 결제 수단 분포 */}
                <Card className="col-span-12 xl:col-span-6">
                    <CardHeader>
                        <CardTitle>결제 수단 분포</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingAnalytics ? (
                            <div className="text-sm text-muted-foreground">불러오는 중…</div>
                        ) : paymentPie.length === 0 ? (
                            <div className="text-sm text-muted-foreground">해당 기간에 결제 수단 데이터가 없습니다.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={HEIGHT}>
                                <PieChart>
                                    <Pie data={paymentPie} dataKey="valuePct" nameKey="method" outerRadius={80} label labelLine>
                                        {paymentPie.map((_, i) => (
                                            <Cell key={`cell-${i}`} fill={[COLORS.blue, COLORS.green, COLORS.amber, COLORS.rose][i % 4]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(v: unknown, _n: unknown, payload: any) => [
                                            `${v}% (${(payload?.payload?.cnt ?? 0).toLocaleString()}건)`,
                                            "비중",
                                        ]}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* 카테고리 선택 → 서브카테고리 성공률 */}
                <Card className="col-span-12 xl:col-span-6">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>카테고리별 성공률</CardTitle>
                        <Select value={selectedCtgr?.toString() ?? ""} onValueChange={(v) => setSelectedCtgr(Number(v))}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder={loadingCategories ? "카테고리 로딩…" : "카테고리 선택"} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.ctgrId} value={String(c.ctgrId)}>
                                        {c.ctgrName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {loadingSubcat ? (
                            <div className="text-sm text-muted-foreground">불러오는 중…</div>
                        ) : subcatRate.length === 0 ? (
                            <div className="text-sm text-muted-foreground">해당 카테고리에 서브카테고리가 없습니다.</div>
                        ) : subcatRate.length > 0 ? (
                            <ResponsiveContainer width="100%" height={HEIGHT}>
                                <BarChart data={subcatRate}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <Tooltip formatter={(v: unknown, n: unknown) => [`${v}%`, n as string]} />
                                    <Legend />
                                    <Bar dataKey="success" name="성공률(%)" stackId="a" fill={COLORS.green} />
                                    <Bar dataKey="fail" name="실패율(%)" stackId="a" fill={COLORS.rose} />
                                </BarChart>
                                    </ResponsiveContainer>
                        ) : (
                            <div className="text-sm text-muted-foreground">카테고리를 선택해주세요.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
