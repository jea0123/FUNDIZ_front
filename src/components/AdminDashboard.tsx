import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Flag,
} from "lucide-react";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

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
  { name: "테크/가전", value: 35, color: "#8884d8" },
  { name: "패션/뷰티", value: 25, color: "#82ca9d" },
  { name: "캐릭터/굿즈", value: 20, color: "#ffc658" },
  { name: "푸드", value: 12, color: "#ff7300" },
  { name: "문화/예술", value: 8, color: "#00ff88" },
];

const mockPendingProjects = [
  {
    id: "1",
    title: "혁신적인 스마트 워치 개발",
    creator: "테크스타트업",
    category: "테크/가전",
    targetAmount: 5000000,
    submittedDate: "2024-02-20",
    status: "pending",
  },
  {
    id: "2",
    title: "친환경 패션 브랜드 론칭",
    creator: "그린패션",
    category: "패션/뷰티",
    targetAmount: 3000000,
    submittedDate: "2024-02-19",
    status: "pending",
  },
];

const mockReports = [
  {
    id: "1",
    type: "comment",
    content: "부적절한 댓글 내용",
    reporter: "사용자A",
    target: "프로젝트 댓글",
    date: "2024-02-21",
    status: "pending",
    reason: "욕설/비방",
  },
  {
    id: "2",
    type: "project",
    content: "허위/과장 광고 의심",
    reporter: "사용자B",
    target: "스마트 디바이스 프로젝트",
    date: "2024-02-20",
    status: "reviewing",
    reason: "허위광고",
  },
];

export function AdminDashboard({
  onNavigate,
}: AdminDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] =
    useState("6months");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const handleApproveProject = (projectId: string) => {
    alert(`프로젝트 ${projectId}가 승인되었습니다.`);
  };

  const handleRejectProject = (projectId: string) => {
    const reason = prompt("반려 사유를 입력하세요:");
    if (reason) {
      alert(
        `프로젝트 ${projectId}가 반려되었습니다.\n사유: ${reason}`,
      );
    }
  };

  const handleResolveReport = (
    reportId: string,
    action: string,
  ) => {
    alert(`신고 ${reportId}가 ${action} 처리되었습니다.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">관리자 대시보드</h1>
        <p className="text-gray-600">
          플랫폼 운영 현황을 확인하고 관리하세요
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">대시보드</TabsTrigger>
          <TabsTrigger value="approvals">
            프로젝트 승인
          </TabsTrigger>
          <TabsTrigger value="reports">신고 관리</TabsTrigger>
          <TabsTrigger value="users">회원 관리</TabsTrigger>
          <TabsTrigger value="analytics">통계 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  총 프로젝트
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.totalProjects.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% 전월 대비
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  총 후원금
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(mockStats.totalAmount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8% 전월 대비
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  총 회원
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +15% 전월 대비
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  승인 대기
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.pendingApprovals}
                </div>
                <p className="text-xs text-muted-foreground">
                  심사 대기 중
                </p>
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
                    <Pie
                      data={mockCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockCategoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
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
                  <span className="text-sm">
                    스마트 워치 프로젝트가 승인되었습니다.
                  </span>
                  <span className="text-xs text-gray-500">
                    2시간 전
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Flag className="h-4 w-4 text-red-500" />
                  <span className="text-sm">
                    새로운 신고가 접수되었습니다.
                  </span>
                  <span className="text-xs text-gray-500">
                    4시간 전
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    신규 회원 50명이 가입했습니다.
                  </span>
                  <span className="text-xs text-gray-500">
                    6시간 전
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 승인 관리</CardTitle>
              <CardDescription>
                크리에이터가 제출한 프로젝트를 검토하고
                승인/반려를 결정하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPendingProjects.map((project) => (
                  <Card key={project.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">
                            {project.title}
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              크리에이터: {project.creator}
                            </div>
                            <div>
                              카테고리: {project.category}
                            </div>
                            <div>
                              목표금액:{" "}
                              {project.targetAmount.toLocaleString()}
                              원
                            </div>
                            <div>
                              제출일: {project.submittedDate}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            심사 대기중
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            상세보기
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleApproveProject(project.id)
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleRejectProject(project.id)
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            반려
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>신고 관리</CardTitle>
              <CardDescription>
                사용자가 신고한 콘텐츠를 검토하고 적절한 조치를
                취하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex space-x-2">
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="신고 유형" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="spam">스팸</SelectItem>
                    <SelectItem value="inappropriate">
                      부적절한 내용
                    </SelectItem>
                    <SelectItem value="fake">
                      허위정보
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="처리 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="pending">
                      대기중
                    </SelectItem>
                    <SelectItem value="reviewing">
                      검토중
                    </SelectItem>
                    <SelectItem value="resolved">
                      처리완료
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {mockReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">
                              {report.reason}
                            </Badge>
                            <Badge
                              variant={
                                report.status === "pending"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {report.status === "pending"
                                ? "대기중"
                                : report.status === "reviewing"
                                  ? "검토중"
                                  : "처리완료"}
                            </Badge>
                          </div>
                          <h4 className="font-medium mb-1">
                            {report.target}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {report.content}
                          </p>
                          <div className="text-xs text-gray-500">
                            신고자: {report.reporter} | 신고일:{" "}
                            {report.date}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            확인
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleResolveReport(
                                report.id,
                                "승인",
                              )
                            }
                          >
                            승인
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleResolveReport(
                                report.id,
                                "삭제",
                              )
                            }
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>회원 관리</CardTitle>
              <CardDescription>
                회원 정보를 조회하고 계정 상태를 관리하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex space-x-2">
                <Input
                  placeholder="회원 검색 (이름, 이메일)"
                  className="max-w-sm"
                />
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="계정 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="suspended">
                      정지
                    </SelectItem>
                    <SelectItem value="withdrawn">
                      탈퇴
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button>검색</Button>
              </div>

              <div className="text-center py-8 text-gray-500">
                회원 목록이 여기에 표시됩니다.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>수익 분석</CardTitle>
                <div className="flex space-x-2">
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">
                        최근 1개월
                      </SelectItem>
                      <SelectItem value="3months">
                        최근 3개월
                      </SelectItem>
                      <SelectItem value="6months">
                        최근 6개월
                      </SelectItem>
                      <SelectItem value="1year">
                        최근 1년
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "후원금"
                          ? formatCurrency(value as number)
                          : value,
                        name,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="후원금"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>플랫폼 수수료</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      mockStats.totalAmount * 0.05,
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    총 후원금의 5%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>성공률</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    68.3%
                  </div>
                  <p className="text-sm text-gray-600">
                    전체 프로젝트 대비
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>평균 후원금</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₩45,230
                  </div>
                  <p className="text-sm text-gray-600">
                    후원자당 평균
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}