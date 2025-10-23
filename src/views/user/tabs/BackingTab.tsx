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

  const MypageBackingList = async () => {
    try {
      const response = await getData(endpoints.getMypageBackingList, cookie.accessToken);
      if (response.status === 200 && Array.isArray(response.data)) {
        const safeData = response.data.map((b) => ({
          ...b,
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

  const filteredBackings = backingProjects
    ?.filter((b) => {
      const titleMatch = b?.title?.toLowerCase().includes(backingSearch.toLowerCase());
      const rewardMatch = b?.mpBackingList?.some((r) => r?.rewardName?.toLowerCase().includes(backingSearch.toLowerCase()));
      const matchesSearch = titleMatch || rewardMatch;
      const matchesStatus = statusFilter === 'ALL' ? true : b.backingStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
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

      <CardContent>
        <div className="space-y-6">
          {filteredBackings && filteredBackings.length > 0 ? (
            filteredBackings.slice((backingPage - 1) * itemsPerPage, backingPage * itemsPerPage).map((backingList, index) => {
              const completionRate =
                backingList.goalAmount && backingList.goalAmount > 0 ? (backingList.currAmount / backingList.goalAmount) * 100 : 0;
              const isCompleted = backingList.backingStatus === 'COMPLETED';
              const statusText = isCompleted
                ? shippingLabel[backingList.shippingStatus] ?? '알 수 없음'
                : statusLabel[backingList.backingStatus] ?? '알 수 없음';
              const rewardNames = backingList.mpBackingList?.map((r) => r.rewardName).filter(Boolean).join(', ');

              const getRateColor = () => {
                if (completionRate >= 100) return 'text-blue-600 font-semibold';
                if (completionRate >= 75) return 'text-green-600 font-semibold';
                if (completionRate >= 50) return 'text-yellow-600 font-semibold';
                if (completionRate >= 25) return 'text-orange-600 font-semibold';
                return 'text-red-600 font-semibold';
              };

              return (
                <div
                  key={`${backingList.projectId}-${index}`}
                  className="p-6 bg-white/90 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {/* 상단 (후원일만 표시) */}
                  <div className="text-gray-700 text-sm mb-2">
                    <span className="font-medium text-gray-800">후원일:</span> {safeDate(backingList.createdAt)}
                  </div>

                  {/* 본문 */}
                  <div className="flex items-start space-x-6">
                    <ImageWithFallback
                      src={backingList.thumbnail}
                      alt={backingList.title}
                      className="w-32 h-32 object-cover rounded-xl shadow-sm border border-gray-100"
                    />

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4
                          onClick={() => navigate(`/project/${backingList.projectId}`)}
                          className="text-xl font-bold text-black leading-snug cursor-pointer hover:underline"
                        >
                          {backingList.title}
                        </h4>
                        <Badge variant="outline" className="text-base px-3 py-1 font-medium text-gray-700">
                          {statusText}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-gray-700 text-base">
                        <p>
                          <span className="font-medium text-gray-800">창작자:</span> {backingList.creatorName ?? '-'}
                        </p>
                        <p>
                          <span className="font-medium text-gray-800">후원 리워드:</span> {rewardNames?.length ? rewardNames : '없음'}
                        </p>

                        {/* 총 후원금 강조 (리워드와 달성률 사이) */}
                        <p className="text-base text-gray-800">
                          <span className="font-medium text-gray-900">총 후원금:</span>{' '}
                          <span className="text-amber-600 font-semibold">{formatNumber(backingList.amount)}원</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 하단 (달성률 + 상세보기 버튼) */}
                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-100">
                    <div className="flex flex-col">
                      <div className="bg-gray-200 h-2 rounded-full overflow-hidden w-48">
                        {(() => {
                          let progressColor = 'bg-red-500';
                          if (completionRate >= 100) progressColor = 'bg-blue-500';
                          else if (completionRate >= 75) progressColor = 'bg-green-500';
                          else if (completionRate >= 50) progressColor = 'bg-yellow-500';
                          else if (completionRate >= 25) progressColor = 'bg-orange-500';

                          return (
                            <div
                              className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                              style={{ width: `${Math.min(completionRate, 300)}%` }}
                            ></div>
                          );
                        })()}
                      </div>
                      <p className="text-sm mt-1 text-gray-900">
                        <span className={getRateColor()}>달성률 {completionRate.toFixed(1)}%</span>{' '}
                        ({formatNumber(backingList.currAmount)}원 / {formatNumber(backingList.goalAmount)}원)
                      </p>
                      </div>


                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => navigate(`/user/support/${backingList.backingId}`)}
                    >
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
              <Button
                key={idx}
                size="sm"
                variant={backingPage === idx + 1 ? 'default' : 'outline'}
                onClick={() => setBackingPage(idx + 1)}
              >
                {idx + 1}
              </Button>
            ))}

            <Button
              size="sm"
              variant="outline"
              disabled={backingPage === Math.max(1, Math.ceil(backingProjects.length / itemsPerPage))}
              onClick={() => setBackingPage(backingPage + 1)}
            >
              다음
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
