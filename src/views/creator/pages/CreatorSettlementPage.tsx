import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Wallet } from 'lucide-react';
import type { CreatorSettlementDto, Settlement } from '@/types/settlement';
import { endpoints, getData } from '@/api/apis';
import { useCookies } from 'react-cookie';
import { formatNumber } from '@/utils/utils';

export default function CreatorSettlementPage() {
  const [selected, setSelected] = useState<Settlement | null>(null);
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [settlements, setSettlements] = useState<CreatorSettlementDto | null>(null);
  const [cookie] = useCookies();

  const getSettlements = async () => {
    const res = await getData(endpoints.getCreatorSettlement);
    if (res.status === 200) {
      setSettlements(res.data);
      setBank(res.data.settlementSummary.bank);
      setAccount(res.data.settlementSummary.account);
    }
  };

  useEffect(() => {
    getSettlements();
  }, [cookie.accessToken]);

  return (
    <div className="space-y-8">
      {/* 요약 카드 */}
      <div className="text-2xl ml-1 mt-1 font-bold">
        정산 내역
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>총 정산 완료 금액</CardTitle>
          </CardHeader>
          {settlements ? (
            <CardContent className="text-2xl font-bold text-green-700">₩{formatNumber(settlements.settlementSummary.completedAmount)}</CardContent>
          ) : (
            <CardContent className="text-2xl font-bold text-green-700">₩0</CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>지급 대기 금액</CardTitle>
          </CardHeader>
          {settlements ? (
            <CardContent className="text-2xl font-bold text-yellow-600">₩{formatNumber(settlements.settlementSummary.waitingAmount)}</CardContent>
          ) : (
            <CardContent className="text-2xl font-bold text-yellow-600">₩0</CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>총 정산 횟수</CardTitle>
          </CardHeader>
          {settlements ? (
            <CardContent className="text-2xl font-bold text-purple-700">{formatNumber(settlements.settlementSummary.settledCount)}회</CardContent>
          ) : (
            <CardContent className="text-2xl font-bold text-purple-700">0회</CardContent>
          )}
        </Card>
      </div>

      {/* 정산 내역 테이블 */}
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
              {settlements && settlements.settlement.length > 0 ? settlements.settlement.map((s, index) => (
                <TableRow key={s.settlementId}>
                  <TableCell>{settlements.settlement.length - index}회차</TableCell>
                  <TableCell>{s.settlementDate.toLocaleString()}</TableCell>
                  <TableCell>₩{formatNumber(s.settlementAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={s.settlementStatus === 'PAID' ? 'default' : 'secondary'}>{s.settlementStatus === 'PAID' ? '지급완료' : '지급대기'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setSelected(s)}>
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))
                : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">정산 내역이 없습니다.</TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet size={20} /> 정산 계좌 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-center">
          <Input value={bank} className="w-1/3" placeholder="은행명" readOnly />
          <Input value={account} className="w-1/2" placeholder="계좌번호" readOnly />
        </CardContent>
      </Card>

      {/* 상세 다이얼로그 */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상세 내역</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2">
              <p>총 금액: ₩{formatNumber(selected.totalAmount)}</p>
              <p>수수료: ₩{formatNumber(selected.fee)}</p>
              <p>환불/차감: ₩{formatNumber(selected.refundAmount)}</p>
              <p className="font-semibold">최종 지급액: ₩{formatNumber(selected.settlementAmount)}</p>
              <p>정산일: {selected.settlementDate.toLocaleString()}</p>
              <p>
                상태: <Badge variant={selected.settlementStatus === 'PAID' ? 'default' : 'secondary'}>{selected.settlementStatus === 'PAID' ? '지급완료' : '지급대기'}</Badge>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
