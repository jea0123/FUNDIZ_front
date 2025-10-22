import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { postData, getData, deleteData, endpoints } from '@/api/apis';
import { useCookies } from 'react-cookie';
import type { cardList } from '@/types/payment';

export default function PaymentRegisterPage() {
  const [cookie] = useCookies(['accessToken']);
  const [method, setMethod] = useState('CARD');
  const [cardCompany, setCardCompany] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [easyPay, setEasyPay] = useState('');
  const [cards, setCards] = useState<cardList[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCardNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1-');
    setCardNum(formatted);
  };

  const fetchCardList = async () => {
    try {
      setLoading(true);
      const res = await getData<cardList[]>(endpoints.getCardList, cookie.accessToken);
      if (res.status === 200 && res.data) setCards(res.data);
    } catch (err) {
      console.error('카드 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardList();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) return alert('결제 수단을 선택해주세요.');
    if (method === 'CARD') {
      if (!cardCompany || !cardNum) return alert('카드사와 카드번호를 모두 입력해주세요.');
      if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(cardNum)) return alert('올바른 카드번호 형식(1234-5678-9012-3456)을 입력해주세요.');
    }
    if (method === 'EASY_PAY' && !easyPay) return alert('간편결제 수단을 선택해주세요.');

    const payload = method === 'CARD' ? { method, cardCompany, cardNum } : method === 'EASY_PAY' ? { method, cardCompany: easyPay } : { method };

    try {
      const res = await postData(endpoints.addCard, payload, cookie.accessToken);
      if (res.status === 200) {
        alert('결제 수단이 성공적으로 등록되었습니다.');
        setCardCompany('');
        setCardNum('');
        setEasyPay('');
        setMethod('CARD');
        fetchCardList();
      } else {
        alert(res.message ?? '등록 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('등록 실패:', err);
      alert('서버 오류로 인해 등록에 실패했습니다.');
    }
  };

  const handleDelete = async (paymentId?: number) => {
    if (!paymentId) return alert('잘못된 카드 정보입니다.');
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await deleteData(endpoints.deleteCard(paymentId), cookie.accessToken);
      if (res.status === 200) {
        alert('삭제되었습니다.');
        fetchCardList();
      } else {
        alert(res.message ?? '삭제 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const maskCardNumber = (num: string) => {
    if (!num) return '-';
    const cleanNum = num.replace(/\D/g, '');
    return cleanNum.replace(/\d(?=\d{4})/g, '*');
  };

  return (
    <>
      {/* 등록 폼 */}
      <Card className="mb-10">
        <CardHeader className="flex justify-between items-center flex-wrap gap-2 text-2xl">
          <CardTitle className="flex items-center">💳 결제 수단 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-base font-semibold">결제 수단</Label>
              <div className="flex flex-wrap gap-10 mt-3">
                {[
                  { value: 'CARD', label: '💳 신용카드' },
                  { value: 'EASY_PAY', label: '⚡ 간편결제' },
                  { value: 'ETC', label: '💰 기타결제수단' },
                ].map((m) => (
                  <label key={m.value} className={`flex items-center gap-2 text-lg font-medium cursor-pointer select-none ${method === m.value ? 'text-blue-600' : 'text-gray-700'}`}>
                    <input type="radio" value={m.value} checked={method === m.value} onChange={(e) => setMethod(e.target.value)} className="w-5 h-5 accent-blue-600 cursor-pointer" />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>

            {method === 'CARD' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardCompany">카드사</Label>
                  <select id="cardCompany" value={cardCompany} onChange={(e) => setCardCompany(e.target.value)} className="w-full border rounded-md p-2 mt-1" required>
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
                  <Label htmlFor="cardNum">카드번호</Label>
                  <Input id="cardNum" value={cardNum} onChange={handleCardNumChange} placeholder="예: 1234-5678-9012-3456" maxLength={19} required />
                  {cardNum && !/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(cardNum) && <p className="text-red-500 text-xs mt-1">올바른 카드번호 형식(1234-5678-9012-3456)을 입력해주세요.</p>}
                </div>
              </div>
            )}

            {method === 'EASY_PAY' && (
              <div>
                <Label>간편결제 수단</Label>
                <select value={easyPay} onChange={(e) => setEasyPay(e.target.value)} className="w-full border rounded-md p-2 mt-1" required>
                  <option value="">선택하세요</option>
                  <option value="KAKAO">카카오페이</option>
                  <option value="NAVER">네이버페이</option>
                </select>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? '등록 중...' : '등록하기'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 등록된 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">📋 등록된 결제수단 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-4 text-base">불러오는 중...</p>
          ) : cards.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-base">등록된 결제수단이 없습니다.</p>
          ) : (
            <div className="divide-y">
              {cards.map((card, idx) => (
                <div key={`${card.payInfoId}-${idx}`} className="flex justify-between items-center py-4 hover:bg-gray-50 px-3 rounded-md transition">
                  <div>
                    <p className="font-semibold text-lg">{card.method === 'CARD' ? maskCardNumber(card.cardNum) : card.method === 'EASY_PAY' ? `간편결제 (${card.cardCompany})` : card.method === 'BANK_TRANSFER' ? '계좌이체 / 무통장입금' : '기타결제수단'}</p>
                    {card.method === 'CARD' && (
                      <p className="text-gray-600 text-sm mt-1">
                        {{
                          SHINHAN: '신한카드',
                          KB: '국민카드',
                          HYUNDAI: '현대카드',
                          SAMSUNG: '삼성카드',
                          NH: '농협카드',
                          LOTTE: '롯데카드',
                        }[card.cardCompany] ?? card.cardCompany}
                      </p>
                    )}
                  </div>
                  <Button variant="destructive" size="sm" className="text-base px-4 py-1.5" onClick={() => handleDelete(card.payInfoId)}>
                    삭제
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
