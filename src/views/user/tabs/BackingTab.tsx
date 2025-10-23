import { endpoints, getData } from '@/api/apis';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MyPageBackingDetail, MyPgaeBackingList } from '@/types/backing';
import { formatNumber } from '@/utils/utils';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

const safeDate = (value: any): string => {
  if (!value) return '-';
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? '-' : parsed.toISOString().split('T')[0];
};

export default function BackingTab() {
  const statusLabel: Record<string, string> = {
    PENDING: '결제 대기',
    COMPLETED: '결제 완료',
    CANCELED: '결제 취소',
    FAILED: '결제 실패',
    REFUNDED: '환불',
  };

  const shippingLabel: Record<string, string> = {
    PENDING: '후원 완료',
    READY: '상품 준비 중',
    SHIPPED: '배송 시작',
    DELIVERED: '배송 완료',
    CANCELED: '취소',
    FAILED: '배송 실패',
  };

  const [cookie] = useCookies();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('RECENT');

  const [backingProjects, setBackingProjects] = useState<MyPgaeBackingList[]>([]);
  const navigate = useNavigate();
  const [backingPage, setBackingPage] = useState(1);
  const itemsPerPage = 3;
  const [backingSearch, setBackingSearch] = useState('');

  // 마이페이지 후원 리스트 호출
  const MypageBackingList = async () => {
    try {
      const response = await getData(endpoints.getMypageBackingList, cookie.accessToken);
      if (response.status === 200 && Array.isArray(response.data)) {
        const safeData = response.data.map((b) => ({
          ...b,
          //  백엔드의 mpBackingList를 사용하도록 수정
          mpBackingList: Array.isArray(b.mpBackingList) ? b.mpBackingList : [],
        }));
        setBackingProjects(safeData);
      } else {
        setBackingProjects([]);
      }
    } catch (err) {
      console.error('❌ 후원 리스트 불러오기 실패:', err);
      setBackingProjects([]);
    }
  };

  useEffect(() => {
    MypageBackingList();
  }, []);

  //  검색 시 mpBackingList 사용
  const filteredBackings = backingProjects
    ?.filter((b) => {
      // 검색
      const titleMatch = b?.title?.toLowerCase().includes(backingSearch.toLowerCase());
      const rewardMatch = b?.mpBackingList?.some((r) => r?.rewardName?.toLowerCase().includes(backingSearch.toLowerCase()));
      const matchesSearch = titleMatch || rewardMatch;

      // 상태 필터
      const matchesStatus = statusFilter === 'ALL' ? true : b.backingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
      // 정렬 로직
      if (sortOption === 'RECENT') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOption === 'OLD') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOption === 'HIGH_AMOUNT') return (b.amount ?? 0) - (a.amount ?? 0);
      if (sortOption === 'LOW_AMOUNT') return (a.amount ?? 0) - (b.amount ?? 0);
      return 0;
    });

  return (
    <Card>
      <CardHeader className="flex justify-between items-center flex-wrap gap-2 text-2xl">
        <CardTitle className="flex items-center">후원한 프로젝트 ({backingProjects?.length ?? 0}개)</CardTitle>

        <div className="flex items-center gap-2">
          {/* 상태 필터 */}
          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setBackingPage(1);
            }}
          >
            <option value="ALL">전체</option>
            <option value="COMPLETED">결제 완료</option>
            <option value="PENDING">결제 대기</option>
            <option value="CANCELED">결제 취소</option>
            <option value="FAILED">결제 실패</option>
            <option value="REFUNDED">환불</option>
          </select>

          {/* 정렬 옵션 */}
          <select className="border rounded px-2 py-1 text-sm" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="RECENT">최신순</option>
            <option value="OLD">오래된순</option>
            <option value="HIGH_AMOUNT">금액 높은순</option>
            <option value="LOW_AMOUNT">금액 낮은순</option>
          </select>

          {/* 검색창 */}
          <input
            type="text"
            placeholder="프로젝트 또는 리워드 검색"
            className="border rounded px-3 py-1 text-sm w-48"
            value={backingSearch}
            onChange={(e) => {
              setBackingSearch(e.target.value);
              setBackingPage(1);
            }}
          />
        </div>
      </CardHeader>

      {/* 리스트 */}
      <CardContent>
        <div className="space-y-6">
          {filteredBackings && filteredBackings.length > 0 ? (
            filteredBackings.slice((backingPage - 1) * itemsPerPage, backingPage * itemsPerPage).map((backingList, index) => {
              const completionRate = backingList.goalAmount && backingList.goalAmount > 0 ? (backingList.currAmount / backingList.goalAmount) * 100 : 0;

              const isCompleted = backingList.backingStatus === 'COMPLETED';
              const statusText = isCompleted ? shippingLabel[backingList.shippingStatus] ?? '알 수 없음' : statusLabel[backingList.backingStatus] ?? '알 수 없음';

              const rewardNames = backingList.mpBackingList
                ?.map((r) => r.rewardName)
                .filter(Boolean)
                .join(', ');

              //  달성률 색상 계산
              const getRateColor = () => {
                if (completionRate >= 100) return 'text-blue-600 font-semibold';
                if (completionRate >= 75) return 'text-green-600 font-semibold';
                if (completionRate >= 50) return 'text-yellow-600 font-semibold';
                if (completionRate >= 25) return 'text-orange-600 font-semibold';
                return 'text-red-600 font-semibold';
              };

              return (
                <div key={`${backingList.projectId}-${index}`} className="p-6 bg-white/90 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  {/* 상단 */}
                  <div className="flex items-start space-x-6">
                    <ImageWithFallback src={backingList.thumbnail} alt={backingList.title} className="w-32 h-32 object-cover rounded-xl shadow-sm border border-gray-100" />

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        {/*  제목 강조 */}
                        <h4 className="text-xl font-bold text-blue-700 leading-snug">{backingList.title}</h4>
                        <Badge variant="outline" className="text-base px-3 py-1 font-medium text-gray-700">
                          {statusText}
                        </Badge>
                      </div>

                      {/* 정보 라벨 진하게 */}
                      <div className="space-y-1 text-gray-700 text-base">
                        <p>
                          <span className="font-medium text-gray-800">창작자:</span> {backingList.creatorName ?? '-'}
                        </p>
                        <p>
                          <span className="font-medium text-gray-800">후원 리워드:</span> {rewardNames?.length ? rewardNames : '없음'}
                        </p>
                      </div>

                      {/* 진행률 바 */}
                      <div className="mt-3 bg-gray-200 h-4 rounded-xl overflow-hidden">
                        {(() => {
                          let progressColor = 'bg-red-500';
                          if (completionRate >= 100) progressColor = 'bg-blue-500';
                          else if (completionRate >= 75) progressColor = 'bg-green-500';
                          else if (completionRate >= 50) progressColor = 'bg-yellow-500';
                          else if (completionRate >= 25) progressColor = 'bg-orange-500';

                          return (
                            <div
                              className={`h-full ${progressColor} rounded-xl transition-all duration-500`}
                              style={{
                                width: `${Math.min(completionRate, 300)}%`,
                              }}
                            ></div>
                          );
                        })()}
                      </div>

                      {/* 달성률 숫자 색상 강조 */}
                      <p className="text-sm text-gray-600 mt-1">
                        <span className={getRateColor()}>달성률 {completionRate.toFixed(1)}%</span> ({formatNumber(backingList.currAmount)}원 / {formatNumber(backingList.goalAmount)}원)
                      </p>
                    </div>
                  </div>

                  {/* 하단 */}
                  <div className="flex justify-between items-center text-base text-gray-700 mt-4 pt-3 border-t border-gray-100">
                    <span>
                      <span className="font-medium text-gray-800">후원일:</span> {safeDate(backingList.createdAt)}
                    </span>
                    <span>
                      <span className="font-medium text-gray-800">총 후원금액:</span> {formatNumber(backingList.amount)}원
                    </span>
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600" onClick={() => navigate(`/user/support/${backingList.backingId}`)}>
                      상세보기
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8 text-base">후원한 프로젝트가 없습니다.</p>
          )}
        </div>

        {/* 페이지네이션 */}
        {backingProjects && backingProjects.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button size="sm" variant="outline" disabled={backingPage === 1} onClick={() => setBackingPage(backingPage - 1)}>
              이전
            </Button>

            {Array.from({
              length: Math.max(1, Math.ceil(backingProjects.length / itemsPerPage)),
            }).map((_, idx) => (
              <Button key={idx} size="sm" variant={backingPage === idx + 1 ? 'default' : 'outline'} onClick={() => setBackingPage(idx + 1)}>
                {idx + 1}
              </Button>
            ))}

            <Button size="sm" variant="outline" disabled={backingPage === Math.max(1, Math.ceil(backingProjects.length / itemsPerPage))} onClick={() => setBackingPage(backingPage + 1)}>
              다음
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
