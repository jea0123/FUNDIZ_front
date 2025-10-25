import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, endpoints, postData } from '@/api/apis';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/utils';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { MyPageBackingDetail } from '@/types/backing';
import { useCookies } from 'react-cookie';

export default function BackingDetailPage() {
  const { backingId } = useParams();
  const navigate = useNavigate();
  const [backing, setBacking] = useState<MyPageBackingDetail>();
  const [cookie] = useCookies();

  useEffect(() => {
    const fetchData = async () => {
      if (!backingId) return;
      try {
        const res = await getData(endpoints.getMypageBackingDetail(Number(backingId)), cookie.accessToken);
        //console.log("📦 상세 응답:", res.data);

        //  단일 객체 형태로 응답될 때 처리
        if (res.status === 200 && res.data) {
          const data = res.data;
          setBacking({
            ...data,
            rewardList: data.rewards ?? data.rewardList ?? [],
          });
        } else {
          console.error('❌ 잘못된 응답 구조:', res);
        }
      } catch (err) {
        console.error('❌ 후원 상세 불러오기 실패:', err);
      }
    };

    fetchData();
  }, [backingId]);

  if (!backing) return <div className="p-6">로딩 중...</div>;

  const safeDate = (date: any) => (date ? new Date(date).toISOString().split('T')[0] : '-');

  // 결제 상태 라벨 (backingStatus)
  const paymentLabel: Record<string, string> = {
    PENDING: '결제 대기',
    COMPLETED: '결제 완료',
    CANCELED: '결제 취소',
    FAILED: '결제 실패',
    REFUNDED: '환불 완료',
  };

  // 배송 상태 라벨 (shippingStatus)
  const shippingLabel: Record<string, string> = {
    PENDING: '후원 완료',
    READY: '상품 준비 중',
    SHIPPED: '배송 중',
    DELIVERED: '배송 완료',
    CANCELED: '배송 취소',
    FAILED: '배송 실패',
  };

  const methodMap: Record<string, string> = {
    BANK_TRANSFER: '계좌이체 / 무통장입금',
    CARD: '신용카드',
    EASY_PAY: '간편결제(카카오페이 / 네이버페이)',
    ETC: '기타 결제 수단',
  };

  const cardCompanyMap: Record<string, string> = {
    LOTTE: '롯데카드',
    KB: '국민카드',
    SAMSUNG: '삼성카드',
    SHINHAN: '신한카드',
    NH: '농협카드',
    HYUNDAI: '현대카드',
  };

  // 추가 후원금 계산
  const totalRewardAmount = backing.rewardList?.reduce((sum, r) => sum + (r.price ?? 0) * (r.quantity ?? 0), 0) ?? 0;

  const extraBacking = Math.max(backing.amount - totalRewardAmount, 0);

  const cancelBacking = async () => {
    if (!backingId) return;
    const confirmCancel = window.confirm('정말로 이 후원을 취소하시겠습니까?\n결제가 완료된 경우 환불 절차가 진행됩니다.');
    if (!confirmCancel) return;

    try {
      const res = await postData(endpoints.cancelBacking(Number(backingId)), null, cookie.accessToken);
      if (res.status === 200) {
        alert('후원이 성공적으로 취소되었습니다.');
        navigate('/user');
      } else {
        alert(res.message ?? '후원 취소에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('후원 취소 오류:', error);
      alert('서버 오류로 인해 후원 취소에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* 프로젝트 정보 */}
      <Card className="bg-white/95 rounded-xl shadow-md hover:shadow-lg transition">
        <CardHeader className="flex items-center gap-6">
          <ImageWithFallback src={backing.thumbnail} alt={backing.title} className="w-32 h-32 rounded-xl object-cover shadow-sm border border-gray-200" />
          <div>
            <CardTitle className="text-xl font-bold text-black font-bold mb-2">{backing.title}</CardTitle>
            <p className="text-base text-gray-600 mb-1">
              <span className="font-medium text-gray-700">창작자:</span> {backing.creatorName ?? '-'}
            </p>
            <Badge variant="outline" className="text-sm px-3 py-1 font-medium border-blue-200 text-blue-700 bg-blue-50">
              {backing.backingStatus === 'COMPLETED' ? shippingLabel[backing.shippingStatus] ?? '배송 정보 없음' : paymentLabel[backing.backingStatus] ?? '상태 알 수 없음'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-base text-gray-700 grid grid-cols-2 gap-3">
          <p>
            <span className="font-medium text-gray-800">후원일:</span> {safeDate(backing.createdAt)}
          </p>
          <p>
            <span className="font-medium text-gray-800">후원 금액:</span> {formatNumber(backing.amount)}원
          </p>
        </CardContent>
      </Card>

      {/* 리워드 정보 */}
      <Card className="bg-white/95 rounded-xl shadow-md hover:shadow-lg transition">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">🎁 후원 리워드</CardTitle>
        </CardHeader>
        <CardContent>
          {backing.rewardList?.length ? (
            <div className="divide-y">
              {backing.rewardList.map((r, idx) => (
                <div key={idx} className="flex justify-between py-4 text-base text-gray-700">
                  <div>
                    <p className="font-semibold text-gray-800">{r.rewardName}</p>
                    <p className="text-gray-500">
                      수량: {r.quantity}개 / 배송 예정일: {safeDate(r.deliveryDate)}
                    </p>
                  </div>
                  <p className="font-semibold text-right">
                    <span className="text-gray-800">
                      {formatNumber(r.price)}원 × {r.quantity}개
                    </span>
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
      <Card className="bg-white/95 rounded-xl shadow-md hover:shadow-lg transition">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">💳 결제 정보</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4 text-base text-gray-700">
          <div>
            <p className="text-gray-500">결제 수단</p>
            <p>{backing.method === 'EASY_PAY' ? (backing.cardCompany === 'KAKAO' ? '카카오페이' : backing.cardCompany === 'NAVER' ? '네이버페이' : '간편결제') : methodMap[backing.method] ?? '-'}</p>
          </div>

          {backing.method !== 'EASY_PAY' && backing.method !== 'BANK_TRANSFER' && (
            <div>
              <p className="text-gray-500">카드사</p>
              <p>{cardCompanyMap[backing.cardCompany] ?? '-'}</p>
            </div>
          )}

          <div>
            <p className="text-gray-500">리워드 총 금액</p>
            <p>{formatNumber(totalRewardAmount)}원</p>
          </div>

          <div>
            <p className="text-gray-500">추가 후원금</p>
            <p className="font-semibold text-emerald-600">+{formatNumber(extraBacking)}원</p>
          </div>

          <div className="col-span-2 border-t pt-3 mt-1">
            <p className="text-gray-500">총 결제 금액</p>
            <p className="font-bold text-xl text-blue-600">{formatNumber(backing.amount)}원</p>
          </div>

          <div>
            <p className="text-gray-500">결제 상태</p>
            <p>{paymentLabel[backing.backingStatus] ?? '-'}</p>
          </div>
        </CardContent>
      </Card>

      {/* 배송 정보 */}
      {backing.backingStatus === 'COMPLETED' && (
        <Card className="bg-white/95 rounded-xl shadow-md hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">📦 배송 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-base text-gray-700">
            <div>
              <p className="text-gray-500">배송 상태</p>
              <p className={`font-medium ${backing.shippingStatus === 'DELIVERED' ? 'text-green-600' : backing.shippingStatus === 'SHIPPED' ? 'text-blue-600' : backing.shippingStatus === 'READY' ? 'text-amber-600' : 'text-gray-600'}`}>{shippingLabel[backing.shippingStatus] ?? '-'}</p>
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
            <div className="col-span-2 border-t pt-4 mt-2 space-y-1">
              <p className="text-gray-500">수령인</p>
              <p>{backing.recipient}</p>
            </div>
            <div>
              <p className="text-gray-500">연락처</p>
              <p>{backing.recipientPhone}</p>
            </div>
            <div className="col-span-2 space-y-1">
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
      )}

      {/* 하단 버튼 */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          뒤로가기
        </Button>

        {/* PENDING일 때 → 후원 취소 / COMPLETED일 때 → 환불하기 */}
        {backing.backingStatus === 'PENDING' && (
          <Button variant="destructive" className="hover:bg-red-600 hover:text-white transition" onClick={cancelBacking}>
            후원 취소
          </Button>
        )}

        {backing.backingStatus === 'COMPLETED' && (
          <Button variant="destructive" className="hover:bg-orange-600 hover:text-white transition" onClick={cancelBacking}>
            환불하기
          </Button>
        )}
      </div>
    </div>
  );
}
