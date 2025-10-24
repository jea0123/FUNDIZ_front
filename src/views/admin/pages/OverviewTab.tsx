import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from "recharts";
import { Users, DollarSign, Package, AlertTriangle, CheckCircle, Flag } from "lucide-react";

const mockStats = {
    totalProjects: 1247,
    totalAmount: 15420000000,
    totalUsers: 34567,
    pendingApprovals: 23,
};

const mockChartData = [
    { name: "1월", 프로젝트: 65, 후원금: 1200000000 },
    { name: "2월", 프로젝트: 78, 후원금: 1450000000 },
    { name: "3월", 프로젝트: 92, 후원금: 1680000000 },
    { name: "4월", 프로젝트: 87, 후원금: 1580000000 },
    { name: "5월", 프로젝트: 105, 후원금: 1820000000 },
    { name: "6월", 프로젝트: 124, 후원금: 2100000000 },
];

const mockCategoryData = [
    { name: "축제·행사", value: 35, color: "#1e90ff" },
    { name: "체험", value: 25, color: "#3cb371" },
    { name: "굿즈", value: 20, color: "#ffc658" },
    { name: "지역살리기", value: 12, color: "#ff7300" },
    { name: "문화·예술", value: 8, color: "#dc143c" },
];

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", notation: "compact", maximumFractionDigits: 1 }).format(amount);

export function OverviewTab() {
    return (
        <div>
            <div className="text-2xl font-bold mt-2 mb-6 ml-1">대시보드</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 프로젝트</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockStats.totalProjects.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+12% 전월 대비</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 후원금</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(mockStats.totalAmount)}</div>
                        <p className="text-xs text-muted-foreground">+8% 전월 대비</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 회원</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+15% 전월 대비</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockStats.pendingApprovals}</div>
                        <p className="text-xs text-muted-foreground">심사 대기 중</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>월별 프로젝트 현황</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mockChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="프로젝트" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>카테고리별 분포</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={mockCategoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                                    {mockCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>최근 활동</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">스마트 워치 프로젝트가 승인되었습니다.</span>
                            <span className="text-xs text-gray-500">2시간 전</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Flag className="h-4 w-4 text-red-500" />
                            <span className="text-sm">새로운 신고가 접수되었습니다.</span>
                            <span className="text-xs text-gray-500">4시간 전</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">신규 회원 50명이 가입했습니다.</span>
                            <span className="text-xs text-gray-500">6시간 전</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
