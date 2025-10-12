import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar, LabelList, Area, AreaChart } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import type { CreatorDashboard } from '@/types/creator';
import { useCreatorId } from '../useCreatorId';
import { endpoints, getData } from '@/api/apis';

const rankColors: Record<number, string> = {
  1: '#facc15', // 🥇 노랑
  2: '#9ca3af', // 🥈 회색
  3: '#b45309', // 🥉 갈색
};
const titleMap = {
  views: '누적 조회수',
  backers: '누적 후원자 수',
  likes: '누적 좋아요 수',
};

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
  top3BackerCnt: [],
  top3LikeCnt: [],
  top3ViewCnt: [],
};

// 최근 7일 데이터 (더미)
const now = new Date();
const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
const dailyViewData = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(now.getDate() - 6 + i);
  return {
    day: `${daysOfWeek[d.getDay()]}(${d.getDate()}일)`,
    views: Math.floor(1000 + Math.random() * 1500),
  };
});

// 최근 12개월 데이터 (더미)
const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const monthlyData = Array.from({ length: 12 }).map((_, i) => {
  const monthIndex = (now.getMonth() - 11 + i + 12) % 12;
  return { month: monthNames[monthIndex], count: Math.floor(300 + Math.random() * 200) };
});

export default function CreatorDashboard() {
  const { creatorId, loading: idLoading } = useCreatorId(4);
  const [data, setData] = useState<CreatorDashboard>(defaultCreatorDashboard);

  const [successRate, setSuccessRate] = useState(0);
  const [failRate, setFailRate] = useState(0);
  const [rankType, setRankType] = useState<'views' | 'backers' | 'likes'>('views');

  useEffect(() => {
    if (idLoading || !creatorId) return;
    (async () => {
      try {
        const res = await getData(endpoints.creatorDashboard);
        if (res.status === 200 && res.data) {
          const dash = res.data as CreatorDashboard;
          setData(dash ?? defaultCreatorDashboard);
          setSuccessRate(dash.projectSuccessPercentage ?? 0);
          setFailRate(dash.projectFailedPercentage ?? 0);
        }
      } catch (err) {
        console.error('대시보드 로드 실패:', err);
      }
    })();
  }, [idLoading, creatorId]);

  // TOP3 데이터 변환
  const rankData = {
    views:
      data?.top3ViewCnt?.map((v, i) => ({
        rank: i + 1,
        title: v.title,
        value: v.viewCnt,
      })) ?? [],
    backers:
      data?.top3BackerCnt?.map((v, i) => ({
        rank: i + 1,
        title: v.title,
        value: v.backerCnt,
      })) ?? [],
    likes:
      data?.top3LikeCnt?.map((v, i) => ({
        rank: i + 1,
        title: v.title,
        value: v.likeCnt,
      })) ?? [],
  };

  //순서 정렬 (3 → 1 → 2) 데이터 개수가 적은것도 고려
  const orderedData = (() => {
    const arr = rankData[rankType] ?? [];
    if (arr.length === 1) return arr;
    if (arr.length === 2) return arr.sort((a, b) => a.rank - b.rank);
    if (arr.length >= 3) {
      const r3 = arr.find((x) => x.rank === 3);
      const r1 = arr.find((x) => x.rank === 1);
      const r2 = arr.find((x) => x.rank === 2);
      return [r3, r1, r2].filter(Boolean);
    }
    return [];
  })();

  const successData = [
    { name: '성공', value: successRate },
    { name: '실패', value: failRate },
  ];

  return (
    <div className="max-w-[1750px] mx-auto px-2">
      <Card className="p-4 shadow-xl border border-gray-200 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4 text-gray-800">창작자 대시보드</CardTitle>
        </CardHeader>

        <CardContent>
          {/*상단 요약 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              ['총 프로젝트', data.projectTotal],
              ['총 후원금', `₩${data.totalAmount?.toLocaleString()}`],
              ['총 후원 수', data.totalBackingCnt?.toLocaleString()],
              ['승인 대기', data.totalVerifyingCnt],
            ].map(([label, value], i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-center shadow-sm">
                <h3 className="text-gray-600 mb-1">{label}</h3>
                <p className="text-2xl font-bold text-gray-900">{value ?? '-'}</p>
              </div>
            ))}
          </div>

          {/*(1) TOP3 + 성공률 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* TOP3 */}
            <Card className="p-3 shadow-md">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <CardTitle className="text-lg font-semibold">
                    내가 한 프로젝트 TOP {orderedData.length} ({titleMap[rankType]})
                  </CardTitle>
                  <Tabs value={rankType} onValueChange={(v) => setRankType(v as any)}>
                    <TabsList className="bg-gray-100 rounded-lg p-1 flex">
                      <TabsTrigger value="views" className="text-sm data-[state=active]:bg-white rounded-md">
                        조회수
                      </TabsTrigger>
                      <TabsTrigger value="backers" className="text-sm data-[state=active]:bg-white rounded-md">
                        후원자
                      </TabsTrigger>
                      <TabsTrigger value="likes" className="text-sm data-[state=active]:bg-white rounded-md">
                        좋아요
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>

              <CardContent>
                {orderedData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={orderedData} margin={{ top: 25, right: 15, left: 5, bottom: 35 }} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => [`${value.toLocaleString()}${rankType === 'views' ? '회' : '명'}`, titleMap[rankType]]} />
                      <Bar dataKey="value" barSize={60} radius={[8, 8, 0, 0]}>
                        {orderedData.map((item, index) => (
                          <Cell key={`cell-${index}`} fill={rankColors[item.rank] || '#d1d5db'} />
                        ))}
                        <LabelList
                          dataKey="value"
                          content={({ x, y, width, value, index }) => {
                            const item = orderedData[index];
                            let badge = '';
                            if (item.rank === 1) badge = '🥇';
                            else if (item.rank === 2) badge = '🥈';
                            else if (item.rank === 3) badge = '🥉';
                            return (
                              <text x={x + width / 2} y={y - 10} textAnchor="middle" fontSize={14} fontWeight={600} fill="#374151">
                                {`${badge} ${Number(value).toLocaleString()}${rankType === 'views' ? '회' : '명'}`}
                              </text>
                            );
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 py-10">데이터가 없습니다.</div>
                )}
              </CardContent>
            </Card>

            {/* 성공률 */}
            <Card className="p-3 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold mb-2">내 프로젝트 성공률</CardTitle>
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
                      label={({ value, name, cx, cy, midAngle, outerRadius }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 15;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text x={x} y={y} fill={name === '성공' ? '#22c55e' : '#ef4444'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={13} fontWeight={500}>
                            {`${name} ${value.toFixed(1)}%`}
                          </text>
                        );
                      }}
                      labelLine={false}
                    >
                      {successData.map((_, i) => (
                        <Cell key={i} fill={['#22c55e', '#ef4444'][i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/*  (2) 일간 후원수 */}
          <Card className="p-3 shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-2">일간 프로젝트 후원수 (최근 7일)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyViewData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} fill="url(#colorViews)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* (3) 월별 후원수 */}
          <Card className="p-3 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-2">월별 프로젝트 후원수 (최근 12개월)</CardTitle>
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
