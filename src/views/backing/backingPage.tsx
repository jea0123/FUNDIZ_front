import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { SavedAddressModal } from './SavedAddressModal';
import { endpoints, getData, postData, deleteData } from '@/api/apis';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { BackingPrepare, BackingPagePayment } from '@/types/backing';
import type { PaymentInfo } from '@/types/payment';
import { useCookies } from 'react-cookie';
import { ProjectThumb } from '../creator/pages/CreatorProjectListPage';

const cardCompanyMap: Record<string, string> = {
  LOTTE: '롯데카드',
  KB: '국민카드',
  SAMSUNG: '삼성카드',
  SHINHAN: '신한카드',
  NH: '농협카드',
  HYUNDAI: '현대카드',
};

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
        {/* 아이콘 */}
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

function CardSelectModal({ open, onClose, totalAmount, onConfirmPayment }: { open: boolean; onClose: () => void; totalAmount: number; onConfirmPayment: (payload: { payInfoId: number; method: string; cardCompany?: string; cardNum?: string }) => void }) {
  const [cookie] = useCookies(['accessToken']);
  const [cards, setCards] = useState<PaymentInfo[]>([]);
  const [selectedCard, setSelectedCard] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // 등록 관련 상태
  const [method, setMethod] = useState<'CARD' | 'EASY_PAY' | 'ETC'>('CARD');
  const [cardCompany, setCardCompany] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [easyPay, setEasyPay] = useState('');
  const [etcDesc, setEtcDesc] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCardList = async () => {
    try {
      setLoading(true);
      const res = await getData<PaymentInfo[]>(endpoints.getCardList, cookie.accessToken);
      if (res.status === 200 && res.data) setCards(res.data);
    } catch (err) {
      console.error('결제수단 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCardList();
      setShowRegisterForm(false);
    }
  }, [open]);

  const handleCardNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1-');
    setCardNum(formatted);
  };

  // 등록
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: any = { method };

    if (method === 'CARD') {
      if (!cardCompany || !cardNum) return alert('카드사와 카드번호를 모두 입력해주세요.');
      if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(cardNum)) return alert('카드번호 형식이 올바르지 않습니다.');
      payload = { method, cardCompany, cardNum };
    } else if (method === 'EASY_PAY') {
      if (!easyPay) return alert('간편결제 수단을 선택해주세요.');
      payload = { method, cardCompany: easyPay };
    } else if (method === 'ETC') {
      if (!etcDesc) return alert('기타 결제수단 설명을 입력해주세요.');
      payload = { method, cardCompany: etcDesc };
    }

    try {
      setRegisterLoading(true);
      const res = await postData(endpoints.addCard, payload, cookie.accessToken);
      if (res.status === 200) {
        alert('결제수단이 등록되었습니다.');
        setCardCompany('');
        setCardNum('');
        setEasyPay('');
        setEtcDesc('');
        setShowRegisterForm(false);
        await fetchCardList();
      } else {
        alert(res.message ?? '등록 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('등록 실패:', err);
      alert('서버 오류로 인해 등록에 실패했습니다.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // 삭제
  const handleDelete = async (payInfoId?: number) => {
    if (!payInfoId) return alert('잘못된 결제수단 정보입니다.');
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      setDeletingId(payInfoId);
      const res = await deleteData(endpoints.deleteCard(payInfoId), cookie.accessToken);
      if (res.status === 200) {
        alert('삭제되었습니다.');
        if (selectedCard?.payInfoId === payInfoId) setSelectedCard(null);
        await fetchCardList();
      } else {
        alert(res.message ?? '삭제 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const maskCardNumber = (num: string) => {
    if (!num) return '-';
    const clean = num.replace(/\D/g, '');
    return clean
      .replace(/\d(?=\d{4})/g, '*')
      .replace(/(.{4})/g, '$1-')
      .replace(/-$/, '');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>💳 결제수단 선택 / 등록</DialogTitle>
        </DialogHeader>

        <p className="text-center text-lg font-semibold mb-4">
          총 결제 금액: <span className="text-blue-600">{totalAmount.toLocaleString()}원</span>
        </p>

        {/* 등록 폼 */}
        {showRegisterForm ? (
          <form onSubmit={handleRegister} className="space-y-5 p-4 border rounded-md bg-gray-50">
            <div>
              <Label>결제 수단</Label>
              <div className="flex flex-wrap gap-6 mt-2">
                {[
                  { value: 'CARD', label: '💳 신용카드' },
                  { value: 'EASY_PAY', label: '⚡ 간편결제' },
                  { value: 'ETC', label: '💰 기타' },
                ].map((m) => (
                  <label key={m.value} className={`flex items-center gap-2 cursor-pointer ${method === m.value ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                    <input type="radio" name="method" value={m.value} checked={method === m.value} onChange={(e) => setMethod(e.target.value as any)} className="accent-blue-600 cursor-pointer" />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>

            {method === 'CARD' && (
              <>
                <div>
                  <Label>카드사</Label>
                  <select value={cardCompany} onChange={(e) => setCardCompany(e.target.value)} className="w-full border rounded-md p-2 mt-1">
                    <option value="">선택하세요</option>
                    <option value="SHINHAN">신한카드</option>
                    <option value="KB">국민카드</option>
                    <option value="HYUNDAI">현대카드</option>
                    <option value="SAMSUNG">삼성카드</option>
                    <option value="NH">농협카드</option>
                    <option value="LOTTE">롯데카드</option>
                  </select>
                </div>

                <div>
                  <Label>카드번호</Label>
                  <Input value={cardNum} onChange={handleCardNumChange} placeholder="예: 1234-5678-9012-3456" maxLength={19} />
                </div>
              </>
            )}

            {method === 'EASY_PAY' && (
              <div>
                <Label>간편결제 수단</Label>
                <select value={easyPay} onChange={(e) => setEasyPay(e.target.value)} className="w-full border rounded-md p-2 mt-1">
                  <option value="">선택하세요</option>
                  <option value="KAKAO">카카오페이</option>
                  <option value="NAVER">네이버페이</option>
                </select>
              </div>
            )}

            {method === 'ETC' && (
              <div>
                <Label>기타 결제수단</Label>
                <Input value={etcDesc} onChange={(e) => setEtcDesc(e.target.value)} placeholder="예: 무통장입금, 현장결제 등" />
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowRegisterForm(false)}>
                취소
              </Button>
              <Button type="submit" disabled={registerLoading}>
                {registerLoading ? '등록 중...' : '등록하기'}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {/* 등록된 결제수단 목록 */}
            {loading ? (
              <p className="text-gray-500 text-center py-4">불러오는 중...</p>
            ) : cards.length === 0 ? (
              <p className="text-gray-500 text-center py-4">등록된 결제수단이 없습니다.</p>
            ) : (
              <div className="divide-y max-h-60 overflow-y-auto border rounded-md">
                {cards.map((card) => (
                  <div key={card.payInfoId} className={`flex justify-between items-center p-3 cursor-pointer transition ${selectedCard?.payInfoId === card.payInfoId ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
                    <div className="flex-1" onClick={() => setSelectedCard(card)}>
                      <p className="font-semibold text-gray-800">{card.method === 'CARD' ? `${cardCompanyMap[card.cardCompany?.toUpperCase?.()] ?? card.cardCompany ?? '-'}` : card.method === 'EASY_PAY' ? (card.cardCompany === 'KAKAO' ? '카카오페이' : card.cardCompany === 'NAVER' ? '네이버페이' : '간편결제') : card.method === 'BANK_TRANSFER' ? '무통장입금' : card.method === 'ETC' ? card.cardCompany || '기타 결제수단' : '-'}</p>

                      {/* 카드번호 마스킹 표시 */}
                      {card.method === 'CARD' && <p className="text-gray-600 text-sm">{maskCardNumber(card.cardNum)}</p>}
                    </div>
                    <Button variant="destructive" size="sm" disabled={deletingId === card.payInfoId} onClick={() => handleDelete(card.payInfoId)}>
                      {deletingId === card.payInfoId ? '삭제 중...' : '삭제'}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex justify-center">
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => setShowRegisterForm(true)}>
                ➕ 새 결제수단 등록하기
              </Button>
            </div>
          </>
        )}

        {!showRegisterForm && (
          <DialogFooter className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!selectedCard}
              onClick={() => {
                if (selectedCard) {
                  const selectedMethod = selectedCard.method === 'CARD' ? 'CARD' : selectedCard.method === 'EASY_PAY' ? 'EASY_PAY' : selectedCard.method === 'ETC' ? 'ETC' : 'BANK_TRANSFER'; // 혹시 추가 시 대비

                  onConfirmPayment({
                    payInfoId: selectedCard.payInfoId,
                    method: selectedMethod,
                    cardCompany: selectedCard.cardCompany,
                    cardNum: selectedCard.cardNum,
                  });
                  onClose();
                }
              }}
            >
              결제하기
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 결제 모달
// function PaymentModal({ open, onClose, totalAmount, paymentList, onConfirmPayment }: { open: boolean; onClose: () => void; totalAmount: number; paymentList: BackingPagePayment[]; onConfirmPayment: (payload: { method: string; cardCompany: string }) => void }) {
//   const [method, setMethod] = useState('');

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>결제하기</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-6">
//           <p className="text-center text-lg font-semibold">총 금액: {totalAmount.toLocaleString()}원</p>

//           <div className="space-y-3">
//             <p className="font-medium text-sm">결제수단을 선택해주세요</p>
//             <RadioGroup value={method} onValueChange={setMethod} className="space-y-2">
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="CARD" id="card" />
//                 <Label htmlFor="card">💳 신용카드</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="BANK_TRANSFER" id="bank" />
//                 <Label htmlFor="bank">🏦 계좌이체</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="EASY_PAY" id="easy" />
//                 <Label htmlFor="easy">⚡ 간편결제 (카카오페이 / 네이버페이)</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="ETC" id="etc" />
//                 <Label htmlFor="etc">💰 기타 결제수단</Label>
//               </div>
//             </RadioGroup>
//           </div>
//         </div>

//         <DialogFooter className="flex justify-between mt-6">
//           <Button variant="outline" onClick={onClose}>
//             취소
//           </Button>
//           <Button
//             className="bg-blue-600 hover:bg-blue-700"
//             onClick={() => {
//               const payload = {
//                 method: method || 'ETC',
//                 cardCompany: '',
//               };
//               onConfirmPayment(payload);
//               onClose();
//             }}
//             disabled={!method}
//           >
//             결제하기
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// BackingPage 본문
export function BackingPage() {
  const [cookie] = useCookies();
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
    isDefault: 'N',
  });
  const [addressMode, setAddressMode] = useState<'select' | 'manual'>('select');
  const [loading, setLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    const fetchPrepareData = async () => {
      if (!projectId) return;

      try {
        const response = await getData(endpoints.backingPrepare(Number(projectId)), cookie.accessToken);
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
    // 기본 배송지 자동 로드
    const fetchDefaultAddress = async () => {
      try {
        const res = await getData(endpoints.getAddressList, cookie.accessToken);
        if (res.status === 200 && Array.isArray(res.data)) {
          const defaultAddr = res.data.find((a: any) => a.isDefault === 'Y');
          if (defaultAddr) {
            setShippingAddress(defaultAddr);
          }
        }
      } catch (err) {
        console.error('기본 배송지 불러오기 실패:', err);
      }
    };

    fetchDefaultAddress();
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

  const handleConfirmPayment = async ({ method, cardCompany, payInfoId }: { method: string; cardCompany: string; payInfoId: number }) => {
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
        payInfoId,
        amount: totalAmount,
        createdAt: now,
        backingStatus: 'PENDING',
      },
      paymentInfo: {
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
      const res = await postData(endpoints.addBacking, backingData, cookie.accessToken);
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
    <div className="min-h-screen bg-white">
      {/* <PaymentModal open={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} totalAmount={getTotalAmount()} paymentList={paymentList} onConfirmPayment={handleConfirmPayment} /> */}
      <CardSelectModal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmount={getTotalAmount()}
        onConfirmPayment={async (payload) => {
          console.log('📤 선택된 카드 정보:', payload);
          await handleConfirmPayment({
            method: payload.method,
            cardCompany: payload.cardCompany ?? '',
            payInfoId: payload.payInfoId,
          });
        }}
      />

      {successData && <PaymentSuccessModal open={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} onGoMyPage={() => navigate('/user/support')} onGoBack={() => navigate(-1)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        {/* 상단 타이틀 */}
        <div className="flex items-center gap-4 mb-10">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-black font-bold tracking-tight">프로젝트 후원하기</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start pb-10">
          <div className="space-y-6">
            <Card className="bg-white shadow-md hover:shadow-lg rounded-2xl transition">
              <CardContent className="pl-4 text-left space-y-4 flex items-start gap-4">
                <div className="h-50 w-50 flex-shrink-0">
                  <div className="aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <ProjectThumb src={thumbnail} alt={title} className="h-full w-full" mode="cover" rounded={false} />
                  </div>
                </div>

                <div className="px-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                    <p className="text-md text-gray-600">by {creatorName}</p>
                  </div>

                  <div className="mt-4">
                    <ColoredProgress value={achievementRate} />
                    <p className="text-base mt-2 font-semibold text-indigo-600">🎯 {achievementRate}% 달성</p>
                  </div>

                  <div className="text-sm text-gray-500 leading-relaxed mt-4">
                    <p>목표 금액: {goalAmount.toLocaleString()}원</p>
                    <p>현재 후원: {currAmount.toLocaleString()}원</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 선택한 리워드 */}
            <Card className="bg-white shadow-md hover:shadow-lg rounded-2xl transition">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">🎁 선택한 리워드</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rewardList.map((r) => (
                  <div key={r.rewardId} className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-lg hover:bg-indigo-100/50 transition">
                    <p className="font-semibold text-gray-900">{r.rewardName}</p>
                    <p className="text-gray-600 text-sm">가격: {r.price.toLocaleString()}원</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRewardQuantities((prev) => ({
                            ...prev,
                            [r.rewardId]: Math.max(1, (prev[r.rewardId] ?? 1) - 1),
                          }))
                        }
                        className="w-8 h-8 p-0 border-gray-300 text-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-lg font-bold text-indigo-600">{rewardQuantities[r.rewardId] ?? 1}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRewardQuantities((prev) => ({
                            ...prev,
                            [r.rewardId]: (prev[r.rewardId] ?? 1) + 1,
                          }))
                        }
                        className="w-8 h-8 p-0 border-gray-300 text-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 추가 후원금 */}
            <Card className="bg-white shadow-md rounded-2xl hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  💰 추가 후원금 <span className="text-gray-400">(선택)</span>
                </CardTitle>
                <p className="text-sm text-gray-500">후원금을 더하여 참여할 수 있어요.</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-row gap-20">
                  <span className="font-medium">후원금</span>
                  <div className="space-y-2">
                    <div className="flex items-center border rounded-md overflow-hidden bg-gray-50">
                      <Input
                        inputMode="numeric"
                        placeholder="0"
                        value={customAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setCustomAmount(value);
                        }}
                        min="0"
                        step="1"
                        className="border-0 focus-visible:ring-0 text-right font-semibold text-indigo-700 flex-1 bg-gray-50"
                      />
                      <div className="px-3 py-2 text-gray-600 text-sm bg-white border-l">원</div>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1 pl-1">
                      <span role="img" aria-label="heart">
                        💖
                      </span>
                      추가 후원으로 프로젝트를 더 응원할 수 있어요!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/*  배송지 입력 (후원 요약 밑) */}
            <Card className="bg-white shadow-md rounded-2xl hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">🚚 배송지 정보</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 저장된 주소 선택 */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-700">배송지 선택 방식</Label>
                  <div className="flex gap-2">
                    <Button variant={addressMode === 'select' ? 'default' : 'outline'} size="sm" onClick={() => setAddressMode('select')}>
                      저장된 주소
                    </Button>
                    {/* <Button variant={addressMode === 'manual' ? 'default' : 'outline'} size="sm" onClick={() => setAddressMode('manual')}>
                      직접 입력
                    </Button> */}
                  </div>
                </div>

                {addressMode === 'select' ? (
                  <>
                    <SavedAddressModal mode="backing" onSelectAddress={(addr) => setShippingAddress(addr)} triggerText="📦 배송지를 선택해주세요" />
                    {shippingAddress ? (
                      <div className="mt-3 p-4 rounded-xl border border-[#e5e9ff] bg-[#f9fbff] shadow-sm transition-all duration-300">
                        <p className="font-semibold text-gray-900 mb-1">{shippingAddress.addrName}</p>
                        <p className="text-gray-700 text-sm mb-1">
                          ({shippingAddress.postalCode}) / {shippingAddress.recipient} ({shippingAddress.recipientPhone})
                        </p>
                        <p className="text-gray-700 text-sm mb-2">
                          {shippingAddress.roadAddr} {shippingAddress.detailAddr}
                        </p>
                        <p className="text-xs text-gray-500">기본배송지: {shippingAddress.isDefault === 'Y' ? <span className="text-green-600 font-medium ml-1">✅ 예</span> : <span className="text-red-500 font-medium ml-1">❌ 아니오</span>}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1">아직 선택된 배송지가 없습니다.</p>
                    )}
                  </>
                ) : (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                    <Input placeholder="받는 사람 이름" value={manualAddress.recipient} onChange={(e) => setManualAddress({ ...manualAddress, recipient: e.target.value })} />
                    <Input placeholder="연락처 (010-0000-0000)" value={manualAddress.recipientPhone} onChange={(e) => setManualAddress({ ...manualAddress, recipientPhone: e.target.value })} />
                    <div className="flex gap-2">
                      <Input placeholder="우편번호" value={manualAddress.postalCode} onChange={(e) => setManualAddress({ ...manualAddress, postalCode: e.target.value })} />
                      <Button variant="outline" onClick={() => alert('우편번호 검색 기능은 추후 추가됩니다.')}>
                        검색
                      </Button>
                    </div>
                    <Input placeholder="도로명 주소" value={manualAddress.roadAddr} onChange={(e) => setManualAddress({ ...manualAddress, roadAddr: e.target.value })} />
                    <Input placeholder="상세 주소" value={manualAddress.detailAddr} onChange={(e) => setManualAddress({ ...manualAddress, detailAddr: e.target.value })} />

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={manualAddress.isDefault === 'Y'}
                        onChange={(e) =>
                          setManualAddress({
                            ...manualAddress,
                            isDefault: e.target.checked ? 'Y' : 'N',
                          })
                        }
                      />
                      <Label htmlFor="isDefault" className="text-sm">
                        기본 배송지로 설정
                      </Label>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      onClick={() => {
                        if (!manualAddress.recipient || !manualAddress.roadAddr) {
                          alert('배송 정보를 모두 입력해주세요.');
                          return;
                        }
                        setShippingAddress({ ...manualAddress, addrId: null });
                        setAddressMode('select');
                        alert('입력한 배송지가 선택되었습니다.');
                      }}
                    >
                      배송지 저장 및 사용하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="sticky top-6 self-start">
            {/* 후원 요약 */}
            <Card className="bg-white shadow-lg rounded-2xl border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">💎 후원 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  {rewardList.map((r) => (
                    <div key={r.rewardId} className="text-sm flex justify-between text-gray-700">
                      <span>{r.rewardName}</span>
                      <span>
                        {r.price.toLocaleString()}원 × {rewardQuantities[r.rewardId] ?? 1}
                      </span>
                    </div>
                  ))}
                  {customAmount && (
                    <div className="text-sm flex justify-between text-indigo-700 font-semibold">
                      <span>추가 후원금</span>
                      <span>+{parseInt(customAmount).toLocaleString()}원</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>총 금액</span>
                  <span className="text-indigo-700">{getTotalAmount().toLocaleString()}원</span>
                </div>
                <Button onClick={handleOpenPayment} className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold shadow-md hover:shadow-lg" disabled={rewardList.length === 0}>
                  🤍 후원하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
