import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar, LabelList, Area, AreaChart } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { use, useEffect, useState } from 'react';
import type { CreatorDashboard } from '@/types/creator';
import type { DailyCount, MonthCount } from '@/types/backing';
import { endpoints, getData } from '@/api/apis';
import { setDevCreatorIdHeader } from '@/api/apis';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store/LoginUserStore.store';
setDevCreatorIdHeader(2);

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
  dailyStatus: [],
  monthStatus: [],
};

export default function CreatorDashboard() {
  const [cookie] = useCookies();
  const [data, setData] = useState<CreatorDashboard>(defaultCreatorDashboard);
  const [successRate, setSuccessRate] = useState(0);
  const [failRate, setFailRate] = useState(0);
  const [rankType, setRankType] = useState<'views' | 'backers' | 'likes'>('views');
  const [dailyData, setDailyData] = useState<DailyCount[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthCount[]>([]);

  const { loginUser } = useLoginUserStore();

  useEffect(() => {
    if (!cookie.accessToken || loginUser?.creatorId == null) {
      alert('창작자 대시보드는 창작자 계정으로 로그인해야 접근할 수 있습니다.');
      history.back();
      return;
    }

    (async () => {
      try {
        //  하나의 API만 호출
        const dashRes = await getData(endpoints.creatorDashboard, cookie.accessToken);

        if (dashRes.status === 200 && dashRes.data) {
          const dash = dashRes.data as CreatorDashboard;
          setData(dash ?? defaultCreatorDashboard);
          setSuccessRate(dash.projectSuccessPercentage ?? 0);
          setFailRate(dash.projectFailedPercentage ?? 0);
          setDailyData(dash.dailyStatus ?? []);
          setMonthlyData(dash.monthStatus ?? []);
        } else {
          console.warn('대시보드 데이터를 불러오지 못했습니다:', dashRes);
        }
      } catch (err) {
        console.error('대시보드 로드 실패:', err);
      }
    })();
  }, [cookie.accessToken]);

  //  일간/월간 데이터 포맷팅
  const formattedDaily = dailyData.map((d) => ({
    day: new Date(d.createdAt).toLocaleDateString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }),
    count: d.count,
  }));

  const formattedMonthly = monthlyData.map((m) => {
    const date = new Date(m.createdAt);
    return {
      month: `${date.getMonth() + 1}월`,
      count: m.count ?? 0,
    };
  });

  // 그래프 스케일 자동 계산
  const dailyMin = formattedDaily.length ? Math.min(...formattedDaily.map((d) => d.count)) : 0;
  const dailyMax = formattedDaily.length ? Math.max(...formattedDaily.map((d) => d.count)) : 100;
  const monthMin = formattedMonthly.length ? Math.min(...formattedMonthly.map((m) => m.count)) : 0;
  const monthMax = formattedMonthly.length ? Math.max(...formattedMonthly.map((m) => m.count)) : 100;

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

  //  TOP3 순서 정렬
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
    <div className="max-w-[1750px] mx-auto">
      <Card className="p-4 border border-gray-200 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-4 text-gray-800">창작자 대시보드</CardTitle>
        </CardHeader>

        <CardContent>
          {/* 상단 요약 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              ['총 프로젝트', data.projectTotal],
              ['총 후원금', `₩${data.totalAmount?.toLocaleString()}`],
              ['총 후원 수', data.totalBackingCnt?.toLocaleString()],
              ['승인 대기', data.totalVerifyingCnt],
            ].map(([label, value], i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-center shadow-sm">
                <h3 className="text-gray-600 mb-1">{label}</h3>
                <p className="text-xl font-bold text-gray-900">{value ?? '-'}</p>
              </div>
            ))}
          </div>

          {/* (1) TOP3 + 성공률 */}
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
                {successRate === 0 && failRate === 0 ?(
                  <div className="text-center text=gray-500 py-10">데이터가 없습니다.</div>
                ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={successData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name} ${value.toFixed(1)}%`} labelLine={false}>
                      {successData.map((_, i) => (
                        <Cell key={i} fill={['#22c55e', '#ef4444'][i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* (2) 일간 후원수 */}
          <Card className="p-3 shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-2">일간 프로젝트 후원수 (최근 7일)</CardTitle>
            </CardHeader>
            <CardContent>
              {formattedDaily.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={formattedDaily}>
                    <defs>
                      <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis domain={[dailyMin * 0.8, dailyMax * 1.1]} />
                    <Tooltip formatter={(v) => [`${v}건`, '후원수']} />
                    <Legend />
                    <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#colorDaily)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 py-10">최근 7일간 후원 내역이 없습니다.</div>
              )}
            </CardContent>
          </Card>

          {/* (3) 월별 후원수 */}
          <Card className="p-3 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-2">월별 프로젝트 후원수 (최근 12개월)</CardTitle>
            </CardHeader>
            <CardContent>
              {formattedMonthly.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={formattedMonthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[monthMin * 0.8, monthMax * 1.1]} />
                    <Tooltip formatter={(v) => [`${v}건`, '후원수']} />
                    <Legend />
                    <Bar dataKey="count" fill="#2563eb" barSize={35} radius={[6, 6, 0, 0]}>
                      <LabelList
                        dataKey="count"
                        position="top"
                        formatter={(v: number) => `${v}건`}
                        style={{
                          fill: '#1e3a8a',
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 py-10">최근 12개월간 후원 내역이 없습니다.</div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
