import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  LabelList,
  Area,
  AreaChart,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import type { CreatorDashboard } from '@/types/creator';
import { useCreatorId } from '../useCreatorId';
import { endpoints, getData } from '@/api/apis';
import { kyInstance } from '@/api/apis';

const defaultCreatorDashboard: CreatorDashboard = {
  creatorId: 0,
  projectTotal: 0,
  totalAmount: 0,
  totalBackingCnt: 0,
  totalVerifyingCnt: 0,
  totalProjectCnt: 0,
  projectFailedCnt: 0,
  projectFailedPercentage: 0,
  projectSuccessPercentage: 0,
  to3BackerCnt: [],
  to3LikeCnt: [],
  to3ViewCnt: [],
};

// 최근 7일 (현재 요일이 오른쪽 끝)
const now = new Date();
const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
const dailyViewData = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(now.getDate() - 6 + i);
  const dayName = daysOfWeek[d.getDay()];
  const dateNum = d.getDate();
  return {
    day: `${dayName}(${dateNum}일)`,
    views: Math.floor(1000 + Math.random() * 1500),
  };
});

// 최근 12개월 (현재 월이 오른쪽 끝)
const currentMonth = now.getMonth() + 1;
const monthNames = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];
const monthlyData = Array.from({ length: 12 }).map((_, i) => {
  const monthIndex = (currentMonth - 12 + i + 12) % 12;
  return {
    month: monthNames[monthIndex],
    count: Math.floor(300 + Math.random() * 200),
  };
});

//  프로젝트 랭킹 데이터 (조회수 / 후원자 / 좋아요)
const rankData = {
  views: [
    { rank: 1, title: '감성 조명 프로젝트', value: 54200 },
    { rank: 2, title: '따뜻한 머그컵 만들기', value: 49800 },
    { rank: 3, title: '미니 캔들 워머', value: 36120 },
  ],
  backers: [
    { rank: 1, title: '미니 캔들 워머', value: 1450 },
    { rank: 2, title: '감성 조명 프로젝트', value: 1300 },
    { rank: 3, title: '따뜻한 머그컵 만들기', value: 1020 },
  ],
  likes: [
    { rank: 1, title: '따뜻한 머그컵 만들기', value: 820 },
    { rank: 2, title: '감성 조명 프로젝트', value: 790 },
    { rank: 3, title: '미니 캔들 워머', value: 610 },
  ],
};

// 시각적 요소
const COLORS = ['#b45309', '#facc15', '#9ca3af'];
const BADGES = ['🥉', '🥇', '🥈'];
const CUSTOM_ORDER = [3, 1, 2]; // 표시 순서 변경

export default function CreatorDashboard() {
  const { creatorId, loading: idLoading } = useCreatorId(21);
  const [successRate, setSuccessRate] = useState<number>(0);
  const [failRate, setFailRate] = useState<number>(0);
  const [data, setData] = useState<CreatorDashboard>(defaultCreatorDashboard);
  const [rankType, setRankType] = useState<'views' | 'backers' | 'likes'>(
    'views'
  );

  const titleMap = {
    views: '누적 조회수',
    backers: '누적 후원자 수',
    likes: '누적 좋아요 수',
  };

  // 랭킹 순서 커스텀 정렬
  const orderedData = CUSTOM_ORDER.map((r) =>
    rankData[rankType].find((item) => item.rank === r)
  );

  useEffect(() => {
    if (idLoading || !creatorId) return;

    (async () => {
      try {
        const res = await fetch(
          `http://localhost:9099/api/v1${endpoints.creatorDashboard}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Dev-Creator-Id': String(creatorId),
            },
          }
        );

        const json = await res.json();
        const data = json?.data;

        if (res.status === 200 && data) {
          setSuccessRate(data.projectSuccessPercentage ?? 0);
          setFailRate(data.projectFailedPercentage ?? 0);
          setData(data);
        } else {
          console.warn(
            '대시보드 데이터 로드 실패:',
            json?.message ?? res.statusText
          );
          setSuccessRate(0);
          setFailRate(0);
        }
      } catch (err) {
        console.error('대시보드 데이터 요청 중 오류 발생:', err);
        setSuccessRate(0);
        setFailRate(0);
      }
    })();
  }, [idLoading, creatorId]);

  const successData = [
    { name: '성공', value: successRate },
    { name: '실패', value: 100 - successRate },
  ];

  return (
    <div className="max-w-[1750px] mx-auto px-2">
      <Card className="p-4 shadow-xl border border-gray-200 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4 text-gray-800">
            창작자 대시보드
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* 상단 요약 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-3 text-center shadow-sm">
              <h3 className="text-gray-600 mb-1">총 프로젝트</h3>
              <p className="text-2xl font-bold text-gray-900">
                {data.projectTotal.toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-center shadow-sm">
              <h3 className="text-gray-600 mb-1">총 후원금</h3>
              <p className="text-2xl font-bold text-gray-900">
                ₩{data.totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-center shadow-sm">
              <h3 className="text-gray-600 mb-1">총 후원 수</h3>
              <p className="text-2xl font-bold text-gray-900">
                {data.totalBackingCnt.toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-center shadow-sm">
              <h3 className="text-gray-600 mb-1">승인 대기</h3>
              <p className="text-2xl font-bold text-gray-900">
                {data.totalVerifyingCnt.toLocaleString()}
              </p>
            </div>
          </div>
          {/* (1) TOP3 + 성공률 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* TOP3 */}
            <Card className="p-3 shadow-md">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <CardTitle className="text-lg font-semibold">
                    내가 한 프로젝트 TOP 3 ({titleMap[rankType]})
                  </CardTitle>

                  <Tabs
                    value={rankType}
                    onValueChange={(v) => setRankType(v as any)}
                  >
                    <TabsList className="bg-gray-100 rounded-lg p-1 flex">
                      <TabsTrigger
                        value="views"
                        className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                      >
                        조회수
                      </TabsTrigger>
                      <TabsTrigger
                        value="backers"
                        className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                      >
                        후원자
                      </TabsTrigger>
                      <TabsTrigger
                        value="likes"
                        className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                      >
                        좋아요
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>

              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={orderedData}
                    margin={{ top: 25, right: 15, left: 5, bottom: 35 }}
                    barCategoryGap="25%"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="title"
                      tick={{ fontSize: 12, fill: '#374151' }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#4b5563' }} />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toLocaleString()}${
                          rankType === 'views' ? '회' : '명'
                        }`,
                        titleMap[rankType],
                      ]}
                    />
                    <Bar dataKey="value" barSize={60} radius={[8, 8, 0, 0]}>
                      {orderedData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                      <LabelList
                        dataKey="value"
                        content={({ x, y, width, value, index }) => {
                          const badge = BADGES[index];
                          return (
                            <text
                              x={x + width / 2}
                              y={y - 10}
                              textAnchor="middle"
                              fontSize={14}
                              fontWeight={600}
                              fill="#374151"
                            >
                              {`${badge} ${Number(value).toLocaleString()}${
                                rankType === 'views' ? '회' : '명'
                              }`}
                            </text>
                          );
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 성공률 */}
            <Card className="p-3 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold mb-2">
                  내 프로젝트 성공률
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={successData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ value, name }) =>
                        `${name} ${value.toFixed(1)}%`
                      }
                      labelLine={false}
                    >
                      {successData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#22c55e', '#ef4444'][index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/*(2) 일간 프로젝트 후원수 */}
          <Card className="p-3 shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-2">
                일간 프로젝트 후원수 (최근 7일)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={dailyViewData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorViews)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* (3) 월별 프로젝트 후원수 */}
          <Card className="p-3 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-2">
                월별 프로젝트 후원수 (최근 12개월)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
