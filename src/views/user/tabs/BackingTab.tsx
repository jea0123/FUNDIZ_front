import { endpoints, getData } from '@/api/apis';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { MyPageBackingDetail, MyPgaeBackingList } from '@/types/backing';
import { formatNumber } from '@/utils/utils';
import React, { useEffect, useState } from 'react';

const tempUserId = 1;

// ✅ 안전한 날짜 변환 함수
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

  const [backingProjects, setBackingProjects] = useState<MyPgaeBackingList[]>([]);
  const [backingPage, setBackingPage] = useState(1);
  const itemsPerPage = 5;
  const [backingSearch, setBackingSearch] = useState('');

  const [isBackingDetailOpen, setIsBackingDetailOpen] = useState(false);
  const [selectedBacking, setSelectedBacking] = useState<MyPageBackingDetail | null>(null);

  // ✅ 마이페이지 후원 리스트 호출
  const MypageBackingList = async () => {
    try {
      const response = await getData(endpoints.getMypageBackingList(tempUserId));
      if (response.status === 200 && Array.isArray(response.data)) {
        const safeData = response.data.map((b) => ({
          ...b,
          rewardList: Array.isArray(b.rewardList) ? b.rewardList : [],
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

  const fetchBackingdetail = async (userId: number) => {
    try {
      const response = await getData(endpoints.getMypageBackingDetail(userId));
      if (response.status === 200 && response.data) {
        const safeDetail = {
          ...response.data,
          rewardList: Array.isArray(response.data.rewardList) ? response.data.rewardList : [],
        };
        setSelectedBacking(safeDetail);
        setIsBackingDetailOpen(true);
      }
    } catch (err) {
      console.error('❌ 후원 상세 불러오기 실패:', err);
    }
  };

  const openBackingById = (backingId: number) => {
    const target = backingProjects.find((b) => Number(b.backingId) === Number(backingId));
    if (!target) return;
    fetchBackingdetail(tempUserId);
  };

  const filteredBackings = backingProjects?.filter((b) => {
    const titleMatch = b?.title?.toLowerCase().includes(backingSearch.toLowerCase());
    const rewardMatch = b?.rewardList?.some((r) => r?.rewardName?.toLowerCase().includes(backingSearch.toLowerCase()));
    return titleMatch || rewardMatch;
  });

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>후원한 프로젝트 ({backingProjects?.length ?? 0}개)</CardTitle>
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
      </CardHeader>

      {/* ✅ 리스트 */}
      <CardContent>
        <div className="space-y-4">
          {filteredBackings && filteredBackings.length > 0 ? (
            filteredBackings.slice((backingPage - 1) * itemsPerPage, backingPage * itemsPerPage).map((backingList, index) => {
              const completionRate = backingList.goalAmount && backingList.goalAmount > 0 ? Math.min((backingList.currAmount / backingList.goalAmount) * 100, 100) : 0;
              const rewardNames = backingList.rewardList
                ?.map((r) => r.rewardName)
                .filter(Boolean)
                .join(', ');

              return (
                <div key={`${backingList.projectId}-${index}`} className="p-4 border rounded-lg space-y-2">
                  {/* 상단 */}
                  <div className="flex items-center space-x-4">
                    <ImageWithFallback src={backingList.thumbnail} alt={backingList.title} className="w-20 h-20 object-cover rounded" />

                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-base">{backingList.title}</h4>
                        <Badge variant="outline">{statusLabel[backingList.backingStatus] ?? '알 수 없음'}</Badge>
                      </div>

                      <p className="text-sm text-gray-600">창작자: {backingList.creatorName ?? '-'}</p>
                      <p className="text-sm text-gray-600">후원 리워드: {rewardNames?.length ? rewardNames : '없음'}</p>

                      {/* ✅ 진행률 바 */}
                      <div className="mt-2 bg-gray-200 h-3 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${completionRate}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        달성률: {completionRate.toFixed(1)}% ({formatNumber(backingList.currAmount)}원 / {formatNumber(backingList.goalAmount)}원)
                      </p>
                    </div>
                  </div>

                  {/* 하단 */}
                  <div className="flex justify-between items-center text-sm text-gray-700 mt-2">
                    <span>후원일: {safeDate(backingList.createdAt)}</span>
                    <span>총 후원금액: {formatNumber(backingList.amount)}원</span>
                    <Button variant="outline" size="sm" onClick={() => openBackingById(backingList.backingId)}>
                      상세보기
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8">후원한 프로젝트가 없습니다.</p>
          )}
        </div>

        {/* 페이지네이션 */}
        {backingProjects && backingProjects.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6">
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

      {/* ✅ 상세보기 모달 */}
      <Dialog open={isBackingDetailOpen} onOpenChange={setIsBackingDetailOpen}>
        {selectedBacking && (
          <DialogContent className="max-w-3xl w-full h-[90vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{selectedBacking.title}</DialogTitle>
              <DialogDescription>후원 상세 내역을 확인하세요</DialogDescription>
            </DialogHeader>

            {/* 프로젝트 섹션 */}
            <div className="flex items-center space-x-4 mt-4">
              <ImageWithFallback src={selectedBacking.thumbnail} alt={selectedBacking.title} className="w-24 h-24 object-cover rounded" />
              <div>
                <h2 className="font-semibold text-lg">{selectedBacking.title}</h2>
                <Badge className="mt-1" variant="secondary">
                  {statusLabel[selectedBacking.backingStatus] ?? '알 수 없음'}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">후원일: {safeDate(selectedBacking.createdAt)}</p>
                <p className="text-sm text-gray-600">총 후원금액: {formatNumber(selectedBacking.amount)}원</p>
              </div>
            </div>

            {/* 리워드 정보 */}
            <section className="mt-6">
              <h3 className="font-medium mb-2 text-lg">🎁 선물 정보</h3>
              {selectedBacking.rewardList?.length > 0 ? (
                <div className="space-y-3">
                  {selectedBacking.rewardList.map((reward, idx) => (
                    <div key={idx} className="border rounded-lg p-3 text-sm space-y-1 bg-gray-50">
                      <p>
                        <span className="font-medium">리워드명:</span> {reward.rewardName}
                      </p>
                      <p>
                        <span className="font-medium">금액:</span> {formatNumber(reward.price)}원
                      </p>
                      <p>
                        <span className="font-medium">수량:</span> {reward.quantity}개
                      </p>
                      <p>
                        <span className="font-medium">배송 예정일:</span> {safeDate(reward.deliveryDate)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">리워드 정보가 없습니다.</p>
              )}
            </section>

            {/* 결제 및 배송 */}
            <section className="mt-6">
              <h3 className="font-medium mb-2 text-lg">💳 결제 및 배송 정보</h3>
              <div className="text-sm space-y-1">
                <p>결제 수단: {selectedBacking.method ?? '-'}</p>
                <p>카드사: {selectedBacking.cardCompany ?? '-'}</p>
                <p>배송 상태: {selectedBacking.shippingStatus ?? '-'}</p>
                <p>송장 번호: {selectedBacking.trackingNum ?? '-'}</p>
                <p>배송 출발일: {safeDate(selectedBacking.shippedAt)}</p>
                <p>배송 완료일: {safeDate(selectedBacking.deliveredAt)}</p>
                <hr className="my-2" />
                <p>
                  수령인: {selectedBacking.recipient ?? '-'} ({selectedBacking.recipientPhone ?? '-'})
                </p>
                <p>
                  주소: {selectedBacking.roadAddr ?? ''} {selectedBacking.detailAddr ?? ''} ({selectedBacking.postalCode ?? ''})
                </p>
              </div>
            </section>

            <div className="mt-6 flex justify-end">
              <DialogClose asChild>
                <Button variant="outline">닫기</Button>
              </DialogClose>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}
