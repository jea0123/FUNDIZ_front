import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { SavedAddressModal } from './SavedAddressModal';
import { endpoints, getData, postData } from '@/api/apis';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { BackingPrepare, BackingPagePayment } from '@/types/backing';

const getProgressColor = (rate: number) => {
  if (rate < 34) return 'bg-red-500'; // 0~33%
  if (rate < 67) return 'bg-yellow-400'; // 34~66%
  return 'bg-green-500'; // 67% 이상
};

function ColoredProgress({ value }: { value: number }) {
  const color = getProgressColor(value);
  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function PaymentSuccessModal({ open, onClose, onGoMyPage, onGoBack }: { open: boolean; onClose: () => void; onGoMyPage: () => void; onGoBack: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm flex flex-col items-center justify-center text-center py-10 space-y-6">
        {/*  아이콘 */}
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-4xl shadow-inner">🎉</div>

        {/* 타이틀 */}
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-blue-700">후원이 성공적으로 완료되었습니다!</DialogTitle>
        </DialogHeader>

        {/* 설명문 */}
        <div className="text-gray-600 leading-relaxed text-[15px]">
          <p>소중한 후원에 진심으로 감사드립니다.</p>
          <p>창작자에게 큰 힘이 되었습니다 🙌</p>
        </div>

        {/* 안내문 */}
        <p className="text-gray-500 text-sm">다음 이동할 페이지를 선택해주세요.</p>

        {/* 버튼 */}
        <DialogFooter className="flex justify-center gap-4 mt-4">
          <Button variant="outline" className="px-6 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 hover:translate-y-[1px] transition-all duration-200" onClick={onGoBack}>
            ⬅ 이전 페이지로
          </Button>
          <Button className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200" onClick={onGoMyPage}>
            마이페이지로 이동 →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

//결제 모달
function PaymentModal({ open, onClose, totalAmount, paymentList, onConfirmPayment }: { open: boolean; onClose: () => void; totalAmount: number; paymentList: BackingPagePayment[]; onConfirmPayment: (payload: { method: string; cardCompany: string }) => void }) {
  const [selectedPayment, setSelectedPayment] = useState<string>(''); // 저장된 결제 선택
  const [method, setMethod] = useState(''); // 새 결제수단 선택

  const handleSelectSaved = (value: string) => {
    setSelectedPayment(value);
    setMethod('');
  };

  const handleSelectNew = (value: string) => {
    setMethod(value);
    setSelectedPayment('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>결제하기</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-center text-lg font-semibold">총 금액: {totalAmount.toLocaleString()}원</p>

          {paymentList && paymentList.length > 0 && (
            <div className="border rounded-md p-3 bg-gray-50">
              <p className="font-medium text-sm mb-2">💾 저장된 결제 정보</p>
              <RadioGroup value={selectedPayment} onValueChange={handleSelectSaved} className="space-y-2">
                {paymentList.map((p, idx) => (
                  <div key={p.cardCompany ?? idx} className={`flex items-center justify-between p-2 rounded-md border hover:bg-gray-100 transition ${selectedPayment === p.cardCompany ? 'bg-blue-50 border-blue-300' : ''}`}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={p.cardCompany ?? `pay-${idx}`} id={`pay-${idx}`} />
                      <Label htmlFor={`pay-${idx}`} className="cursor-pointer text-sm font-medium">
                        💳 {p.cardCompany ?? '등록된 결제수단'}
                        {p.method ? ` (${p.method})` : ''}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="space-y-3">
            <p className="font-medium text-sm">새 결제수단 선택</p>
            <RadioGroup value={method} onValueChange={handleSelectNew} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">💳 카드 결제</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="account" id="account" />
                <Label htmlFor="account">🏦 계좌이체</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="simplepay" id="simplepay" />
                <Label htmlFor="simplepay">⚡ 간편결제 (카카오페이 / 네이버페이)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              const payload = {
                method: method || 'CARD',
                cardCompany: selectedPayment || '',
              };
              onConfirmPayment(payload);
              onClose();
            }}
            disabled={!selectedPayment && !method}
          >
            결제하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

//BackingPage 본문
export function BackingPage() {
  const tempUserId = 1;
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ method: string; cardCompany: string; totalAmount: number } | null>(null);

  const itemsParam = searchParams.get('items');
  const rewardEntries = useMemo(() => {
    if (!itemsParam) return [];
    return itemsParam.split(',').map((item) => {
      const [idStr, qtyStr] = item.split('x');
      return { rewardId: Number(idStr), qty: Number(qtyStr) };
    });
  }, [itemsParam]);

  const [prepareData, setPrepareData] = useState<BackingPrepare | null>(null);
  const [rewardQuantities, setRewardQuantities] = useState<Record<number, number>>({});
  const [customAmount, setCustomAmount] = useState('');
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [manualAddress, setManualAddress] = useState({
    recipient: '',
    recipientPhone: '',
    roadAddr: '',
    detailAddr: '',
    postalCode: '',
  });
  const [addressMode, setAddressMode] = useState<'select' | 'manual'>('select');
  const [loading, setLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    const fetchPrepareData = async () => {
      if (!projectId) return;

      try {
        const response = await getData(endpoints.backingPrepare(tempUserId, Number(projectId)));
        if (response.status === 200 && response.data) {
          const raw = response.data;
          const data = {
            ...raw,
            rewardList: raw.rewardsList ?? [],
            paymentList: raw.backingPagePaymentList ?? [],
          };

          const rewardEntries = itemsParam
            ? itemsParam.split(',').map((item) => {
                const [idStr, qtyStr] = item.split('x');
                return { rewardId: Number(idStr), qty: Number(qtyStr) };
              })
            : [];

          let rewards = data.rewardList;
          if (!rewards || rewards.length === 0) {
            const projectRes = await getData(endpoints.getProjectDetail(Number(projectId)));
            if (projectRes.status === 200 && projectRes.data?.rewardList) {
              rewards = projectRes.data.rewardList;
            }
          }

          const selectedRewards = rewards.filter((r) => rewardEntries.some((entry) => entry.rewardId === r.rewardId));

          const initialQuantities: Record<number, number> = {};
          selectedRewards.forEach((r) => {
            const entry = rewardEntries.find((e) => e.rewardId === r.rewardId);
            initialQuantities[r.rewardId] = entry?.qty ?? 1;
          });

          setPrepareData({ ...data, rewardList: selectedRewards });
          setRewardQuantities(initialQuantities);
        } else {
          console.error('BackingPrepare 응답 데이터 없음:', response);
        }
      } catch (err) {
        console.error('BackingPrepare API 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrepareData();
  }, [projectId]);

  if (loading) return <p className="text-center py-10 text-gray-500">데이터를 불러오는 중...</p>;
  if (!prepareData) return <p className="text-center py-10 text-gray-500">후원 정보를 불러올 수 없습니다.</p>;

  const { title, thumbnail, creatorName, goalAmount, currAmount, rewardList, nickname, email, paymentList } = prepareData as any;

  const achievementRate = goalAmount && goalAmount > 0 && currAmount != null ? Math.round((currAmount / goalAmount) * 100) : 0;

  const getTotalAmount = () => {
    const rewardsTotal = rewardList.reduce((sum, r) => sum + (rewardQuantities[r.rewardId] ?? 1) * r.price, 0);
    const additional = customAmount ? parseInt(customAmount) : 0;
    return rewardsTotal + additional;
  };

  const handleOpenPayment = () => {
    if (rewardList.length === 0) {
      alert('리워드를 선택해주세요.');
      return;
    }
    setIsPaymentOpen(true);
  };

  const handleConfirmPayment = async ({ method, cardCompany }: { method: string; cardCompany: string }) => {
    const rewardsTotal = rewardList.reduce((sum, r) => sum + (rewardQuantities[r.rewardId] ?? 1) * r.price, 0);
    const additional = customAmount ? parseInt(customAmount) : 0;
    const totalAmount = rewardsTotal + additional;

    if (!shippingAddress?.addrId) {
      alert('배송지를 선택해주세요.');
      return;
    }

    const now = new Date().toISOString();

    const backingData = {
      backingId: 0,
      backing: {
        backingId: 0,
        userId: tempUserId,
        amount: totalAmount,
        createdAt: now,
        backingStatus: 'COMPLETED',
      },
      payment: {
        paymentId: 0,
        backingId: 0,
        orderId: '',
        method: method || 'CARD',
        status: 'COMPLETED',
        amount: totalAmount,
        cardCompany: cardCompany || null,
        createdAt: now,
      },
      address: {
        addrId: shippingAddress.addrId,
        userId: tempUserId,
        addrName: shippingAddress.addrName || '',
        recipient: shippingAddress.recipient || '',
        postalCode: shippingAddress.postalCode || '',
        roadAddr: shippingAddress.roadAddr || '',
        detailAddr: shippingAddress.detailAddr || '',
        recipientPhone: shippingAddress.recipientPhone || '',
        isDefault: shippingAddress.isDefault || 'N',
      },
      rewards: rewardList.map((r) => ({
        rewardId: r.rewardId,
        rewardName: r.rewardName,
        price: r.price,
        rewardContent: r.rewardContent,
        quantity: rewardQuantities[r.rewardId] ?? 1,
      })),
    };

    console.log('📤 서버로 보낼 backingData', JSON.stringify(backingData, null, 2));

    try {
      const res = await postData(endpoints.addBacking(tempUserId), backingData);
      if (res.status === 200) {
        setSuccessData({ method, cardCompany, totalAmount });
        setIsSuccessOpen(true);
      } else {
        alert('후원 저장 실패: ' + (res.message || '서버 오류'));
      }
    } catch (error) {
      console.error('후원 생성 오류:', error);
      alert('후원 정보를 저장하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 결제 완료 모달 */}
      {successData && <PaymentSuccessModal open={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} method={successData.method} cardCompany={successData.cardCompany} totalAmount={successData.totalAmount} onGoMyPage={() => navigate('/user')} onGoBack={() => navigate(-1)} />}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold">프로젝트 후원하기</h1>
        </div>

        <PaymentModal open={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} totalAmount={getTotalAmount()} paymentList={paymentList} onConfirmPayment={handleConfirmPayment} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 프로젝트 요약 */}
            <Card>
              <CardContent className="p-6 flex gap-6">
                <div className="w-40 h-28 rounded bg-gray-200 overflow-hidden">
                  <ImageWithFallback src={thumbnail} alt={title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">by {creatorName}</p>
                  <ColoredProgress value={achievementRate} />
                  <p className="text-sm mt-1">{achievementRate}% 달성</p>
                </div>
              </CardContent>
            </Card>

            {/* 후원자 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>후원자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>닉네임</Label>
                  <Input value={nickname} readOnly className="bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                  <Label>이메일</Label>
                  <Input value={email} readOnly className="bg-gray-100 cursor-not-allowed" />
                </div>
              </CardContent>
            </Card>

            {/* 리워드 */}
            <Card>
              <CardHeader>
                <CardTitle>선택한 리워드</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rewardList.map((r) => (
                  <div key={r.rewardId} className="p-3 border rounded-lg">
                    <p className="font-medium">{r.rewardName}</p>
                    <p className="text-gray-600 text-sm">가격: {r.price.toLocaleString()}원</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRewardQuantities((prev) => ({
                            ...prev,
                            [r.rewardId]: Math.max(1, (prev[r.rewardId] ?? 1) - 1),
                          }))
                        }
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-lg">{rewardQuantities[r.rewardId] ?? 1}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRewardQuantities((prev) => ({
                            ...prev,
                            [r.rewardId]: (prev[r.rewardId] ?? 1) + 1,
                          }))
                        }
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 추가 후원금 */}
            <Card>
              <CardHeader>
                <CardTitle>추가 후원금 (선택)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input type="number" placeholder="0" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} />
              </CardContent>
            </Card>

            {/* 배송지 선택 */}
            <Card>
              <CardHeader>
                <CardTitle>배송지 선택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addressMode === 'select' ? (
                  <>
                    <SavedAddressModal mode="backing" onSelectAddress={setShippingAddress} triggerText='배송지를 선택해주세요'/>
                    {shippingAddress ? (
                      <div className="text-sm p-3 border rounded-lg">
                        <p>{shippingAddress.addrName}</p>
                        <p>
                          {shippingAddress.roadAddr} {shippingAddress.detailAddr} ({shippingAddress.postalCode})
                        </p>
                        <p>
                          {shippingAddress.recipient} ({shippingAddress.recipientPhone})
                        </p>
                      </div>
                    ) : (
                      <p></p>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <Input placeholder="수령인" value={manualAddress.recipient} onChange={(e) => setManualAddress({ ...manualAddress, recipient: e.target.value })} />
                    <Input placeholder="전화번호" value={manualAddress.recipientPhone} onChange={(e) => setManualAddress({ ...manualAddress, recipientPhone: e.target.value })} />
                    <Input placeholder="우편번호" value={manualAddress.postalCode} onChange={(e) => setManualAddress({ ...manualAddress, postalCode: e.target.value })} />
                    <Input placeholder="도로명 주소" value={manualAddress.roadAddr} onChange={(e) => setManualAddress({ ...manualAddress, roadAddr: e.target.value })} />
                    <Input placeholder="상세 주소" value={manualAddress.detailAddr} onChange={(e) => setManualAddress({ ...manualAddress, detailAddr: e.target.value })} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 후원 요약 */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>후원 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  {rewardList.map((r) => (
                    <div key={r.rewardId} className="text-sm flex justify-between">
                      <span>{r.rewardName}</span>
                      <span>
                        {r.price.toLocaleString()}원 × {rewardQuantities[r.rewardId] ?? 1}
                      </span>
                    </div>
                  ))}
                  {customAmount && (
                    <div className="text-sm flex justify-between">
                      <span>추가 후원금</span>
                      <span>{parseInt(customAmount).toLocaleString()}원</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span>총 금액</span>
                  <span className="text-blue-600">{getTotalAmount().toLocaleString()}원</span>
                </div>
                <Button onClick={handleOpenPayment} className="w-full bg-blue-600 hover:bg-blue-700" disabled={rewardList.length === 0}>
                  후원하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
