import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, endpoints } from '@/api/apis';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/utils';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { MyPageBackingDetail } from '@/types/backing';

export default function BackingDetailPage() {
  const { backingId } = useParams();
  const navigate = useNavigate();
  const [backing, setBacking] = useState<MyPageBackingDetail>();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getData(endpoints.getMypageBackingDetail(1)); // tempUserId
      if (res.status === 200 && Array.isArray(res.data)) {
        const found = res.data.find((b: MyPageBackingDetail) => b.backingId === Number(backingId));
        if (found) {
          setBacking({
            ...found,
            rewardList: found.rewards ?? found.rewardList ?? [],
          });
        }
      }
    };
    fetchData();
  }, [backingId]);

  if (!backing) return <div className="p-6">로딩 중...</div>;

  const safeDate = (date: any) => (date ? new Date(date).toISOString().split('T')[0] : '-');

  const shippingLabel: Record<string, string> = {
    READY: '상품 준비 중',
    SHIPPED: '배송 중',
    DELIVERED: '배송 완료',
    PENDING: '후원 완료',
    FAILED: '배송 실패',
  };

  //  추가 후원금 계산
  const totalRewardAmount = backing.rewardList?.reduce((sum, r) => sum + (r.price ?? 0) * (r.quantity ?? 0), 0) ?? 0;

  const extraBacking = Math.max(backing.amount - totalRewardAmount, 0);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* 프로젝트 정보 */}
      <Card>
        <CardHeader className="flex items-center gap-5">
          <ImageWithFallback src={backing.thumbnail} alt={backing.title} className="w-28 h-28 rounded-xl object-cover" />
          <div>
            <CardTitle className="text-lg font-semibold mb-1">{backing.title}</CardTitle>
            <p className="text-sm text-gray-500 mb-1">창작자: {backing.creatorName ?? '-'}</p>
            <Badge variant="outline">{shippingLabel[backing.shippingStatus] ?? '알 수 없음'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 grid grid-cols-2 gap-2">
          <p>후원일: {safeDate(backing.createdAt)}</p>
          <p>후원 금액: {formatNumber(backing.amount)}원</p>
        </CardContent>
      </Card>

      {/* 리워드 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>🎁 후원 리워드</CardTitle>
        </CardHeader>
        <CardContent>
          {backing.rewardList?.length ? (
            <div className="divide-y">
              {backing.rewardList.map((r, idx) => (
                <div key={idx} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-semibold">{r.rewardName}</p>
                    <p className="text-gray-500">
                      수량: {r.quantity}개 / 배송 예정일: {safeDate(r.deliveryDate)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800 text-right">
                    {formatNumber(r.price)}원 × {r.quantity}개
                    <br />
                    <span className="text-gray-500 text-sm">= {formatNumber(r.price * r.quantity)}원</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">리워드 정보가 없습니다.</p>
          )}
        </CardContent>
      </Card>

      {/* 결제 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>💳 결제 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="text-gray-500 text-sm">결제 수단</p>
            <p>{backing.method ?? '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">카드사</p>
            <p>{backing.cardCompany ?? '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">리워드 총 금액</p>
            <p>{formatNumber(totalRewardAmount)}원</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">추가 후원금</p>
            <p className="font-medium text-blue-600">+{formatNumber(extraBacking)}원</p>
          </div>
          <div className="col-span-2 border-t pt-2 mt-1">
            <p className="text-gray-500 text-sm">총 결제 금액</p>
            <p className="font-semibold text-lg">{formatNumber(backing.amount)}원</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">결제 상태</p>
            <p>{backing.backingStatus === 'COMPLETED' ? '결제 완료' : backing.backingStatus === 'PENDING' ? '결제 대기' : '결제 취소'}</p>
          </div>
        </CardContent>
      </Card>

      {/*배송 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>📦 배송 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">배송 상태</p>
            <p>{shippingLabel[backing.shippingStatus] ?? '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">송장 번호</p>
            <p>{backing.trackingNum ?? '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">출고일</p>
            <p>{safeDate(backing.shippedAt)}</p>
          </div>
          <div>
            <p className="text-gray-500">배송 완료일</p>
            <p>{safeDate(backing.deliveredAt)}</p>
          </div>
          <div className="col-span-2 border-t pt-4 mt-2">
            <p className="text-gray-500">수령인</p>
            <p>{backing.recipient}</p>
          </div>
          <div>
            <p className="text-gray-500">연락처</p>
            <p>{backing.recipientPhone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">주소</p>
            <p>
              [{backing.postalCode}] {backing.roadAddr} {backing.detailAddr}
            </p>
          </div>
          <div>
            <p className="text-gray-500">배송지명</p>
            <p>{backing.addrName ?? '-'}</p>
          </div>
        </CardContent>
      </Card>

      {/*하단 버튼 */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          뒤로가기
        </Button>

        <Button
          variant="destructive"
          onClick={async () => {
            if (!backingId) return;
            const confirmCancel = window.confirm('정말로 이 후원을 취소하시겠습니까?\n결제가 완료된 경우 환불 절차가 진행됩니다.');
            if (!confirmCancel) return;

            try {
              //const res = await getData(endpoints.cancelBacking(Number(backingId))); // endPoint 설정하기
              if (res.status === 200) {
                alert('후원이 성공적으로 취소되었습니다.');
                navigate('/user'); // 마이페이지로 이동
              } else {
                alert('후원 취소에 실패했습니다. 잠시 후 다시 시도해주세요.');
              }
            } catch (error) {
              console.error('후원 취소 오류:', error);
              alert('서버 오류로 인해 후원 취소에 실패했습니다.');
            }
          }}
        >
          후원 취소
        </Button>
      </div>
    </div>
  );
}
