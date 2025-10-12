import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Download, Wallet } from 'lucide-react';

// ✅ 정산 내역 더미 데이터
interface Settlement {
  id: number;
  round: string;
  date: string;
  totalAmount: number;
  fee: number;
  refund: number;
  finalAmount: number;
  status: 'WAITING' | 'PAID';
}

const MOCK_SETTLEMENTS: Settlement[] = [
  {
    id: 1,
    round: '1차 정산',
    date: '2025-10-05',
    totalAmount: 1250000,
    fee: 25000,
    refund: 30000,
    finalAmount: 1195000,
    status: 'PAID',
  },
  {
    id: 2,
    round: '2차 정산',
    date: '2025-10-20',
    totalAmount: 940000,
    fee: 18000,
    refund: 20000,
    finalAmount: 902000,
    status: 'WAITING',
  },
];

export default function CreatorSettlementPage() {
  const [selected, setSelected] = useState<Settlement | null>(null);
  const [bank, setBank] = useState('국민은행');
  const [account, setAccount] = useState('123-456-789-00');

  const totalPaid = MOCK_SETTLEMENTS.filter((s) => s.status === 'PAID').reduce((acc, s) => acc + s.finalAmount, 0);
  const totalWaiting = MOCK_SETTLEMENTS.filter((s) => s.status === 'WAITING').reduce((acc, s) => acc + s.finalAmount, 0);

  return (
    <div className="p-6 space-y-8">
      {/* ✅ 요약 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>총 정산 완료 금액</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-700">₩{totalPaid.toLocaleString()}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>지급 대기 금액</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-yellow-600">₩{totalWaiting.toLocaleString()}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>총 정산 횟수</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-purple-700">{MOCK_SETTLEMENTS.length}회</CardContent>
        </Card>
      </div>

      {/* ✅ 정산 내역 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>정산 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>회차</TableHead>
                <TableHead>정산일</TableHead>
                <TableHead>총 금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>보기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SETTLEMENTS.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.round}</TableCell>
                  <TableCell>{s.date}</TableCell>
                  <TableCell>₩{s.finalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'PAID' ? 'default' : 'secondary'}>{s.status === 'PAID' ? '지급완료' : '지급대기'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setSelected(s)}>
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ✅ 계좌정보 + 다운로드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet size={20} /> 정산 계좌 정보
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-1" /> CSV 다운로드
          </Button>
        </CardHeader>
        <CardContent className="flex gap-4 items-center">
          <Input value={bank} onChange={(e) => setBank(e.target.value)} className="w-1/3" placeholder="은행명" />
          <Input value={account} onChange={(e) => setAccount(e.target.value)} className="w-1/2" placeholder="계좌번호" />
          <Button variant="secondary">계좌 수정</Button>
        </CardContent>
      </Card>

      {/* ✅ 상세 다이얼로그 */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.round} 상세 내역</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2">
              <p>총 금액: ₩{selected.totalAmount.toLocaleString()}</p>
              <p>수수료: ₩{selected.fee.toLocaleString()}</p>
              <p>환불/차감: ₩{selected.refund.toLocaleString()}</p>
              <p className="font-semibold">최종 지급액: ₩{selected.finalAmount.toLocaleString()}</p>
              <p>정산일: {selected.date}</p>
              <p>
                상태: <Badge variant={selected.status === 'PAID' ? 'default' : 'secondary'}>{selected.status === 'PAID' ? '지급완료' : '지급대기'}</Badge>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
