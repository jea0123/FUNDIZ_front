import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Progress } from '../../components/ui/progress';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { SavedAddressModal } from './SavedAddressModal';
import { endpoints, getData } from '@/api/apis';
import type { Reward } from '@/types/reward';
import type { ProjectDetail } from '@/types/projects';

export function BackingPage() {
  const tempUserId = 1;
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  //items 파라미터 파싱 (예: "2x1,3x2,5x1")
  const itemsParam = searchParams.get('items');
  const rewardEntries = useMemo(() => {
    if (!itemsParam) return [];
    return itemsParam.split(',').map((item) => {
      const [idStr, qtyStr] = item.split('x');
      return { rewardId: Number(idStr), qty: Number(qtyStr) };
    });
  }, [itemsParam]);

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [selectedRewards, setSelectedRewards] = useState<Reward[]>([]);
  const [rewardQuantities, setRewardQuantities] = useState<Record<number, number>>({});
  const [customAmount, setCustomAmount] = useState<string>('');

  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [manualAddress, setManualAddress] = useState({
    recipient: '',
    recipientPhone: '',
    roadAddr: '',
    detailAddr: '',
    postalCode: '',
  });

  const [backerName, setBackerName] = useState<string>('');
  const [backerEmail, setBackerEmail] = useState<string>('');
  const [addressMode, setAddressMode] = useState<'select' | 'manual'>('select');
  const [loading, setLoading] = useState(true);

  //유저 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await getData<any>(endpoints.getUserInfo(tempUserId));
        if (res.status === 200 && res.data) {
          setBackerName(res.data.nickname);
          setBackerEmail(res.data.email);
        } else {
          setBackerName('홍길동');
          setBackerEmail('user@example.com');
        }
      } catch {
        setBackerName('홍길동');
        setBackerEmail('user@example.com');
      }
    };
    fetchUserInfo();
  }, []);

  // 프로젝트 및 리워드 데이터 로드
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const response = await getData<ProjectDetail>(endpoints.getProjectDetail(Number(projectId)));
        if (response.status === 200 && response.data) {
          setProject(response.data);

          // rewardEntries에 해당하는 리워드 필터링
          const rewards = response.data.rewardList?.filter((r) => rewardEntries.some((entry) => entry.rewardId === r.rewardId));

          const defaultReward = response.data.rewardList?.[0] ? [response.data.rewardList[0]] : [];
          const finalRewards = rewards?.length ? rewards : defaultReward;
          setSelectedRewards(finalRewards);

          //수량 세팅 — rewardEntries의 qty를 그대로 반영
          const initialQuantities: Record<number, number> = {};
          finalRewards.forEach((r) => {
            const entry = rewardEntries.find((e) => e.rewardId === r.rewardId);
            initialQuantities[r.rewardId] = entry?.qty ?? 1;
          });
          setRewardQuantities(initialQuantities);
        }
      } catch (err) {
        console.error('프로젝트 API 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) return <p className="text-center py-10 text-gray-500">프로젝트 정보를 불러오는 중...</p>;
  if (!project || selectedRewards.length === 0) return <p className="text-center py-10 text-gray-500">프로젝트 정보를 불러올 수 없습니다.</p>;

  const achievementRate = Math.round((project.currAmount / project.goalAmount) * 100);

  //총 금액 계산
  const getTotalAmount = () => {
    const rewardsTotal = selectedRewards.reduce((sum, r) => sum + (rewardQuantities[r.rewardId] ?? 1) * r.price, 0);
    const additional = customAmount ? parseInt(customAmount) : 0;
    return rewardsTotal + additional;
  };

  //후원 완료 후 confirm 처리 (하나의 confirm으로 통합)
  const handleSubmit = async () => {
    const totalAmount = getTotalAmount();

    if (addressMode === 'manual' && !manualAddress.recipient) {
      alert('직접 입력한 배송지 정보를 모두 입력해주세요.');
      return;
    }
    if (addressMode === 'select' && !shippingAddress) {
      alert('배송지를 선택해주세요.');
      return;
    }

    //1단계: 후원 확정 확인
    const confirmBacking = window.confirm(`총 ${totalAmount.toLocaleString()}원 (${selectedRewards.length}개의 리워드)를 후원하시겠습니까?`);

    if (!confirmBacking) return; //아니오 → 아무 일도 안 함

    //2단계: 후원 완료 및 이동 여부 확인
    const goToMyPage = window.confirm(`후원이 완료되었습니다!\n총 금액: ${totalAmount.toLocaleString()}원\n(${selectedRewards.length}개의 리워드)\n\n👉 마이페이지로 이동하시겠습니까?`);

    if (goToMyPage) {
      navigate('/user/mypage');
    } else {
      navigate(`/project/${projectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold">프로젝트 후원하기</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 프로젝트 요약 */}
            <Card>
              <CardContent className="p-6 flex gap-6">
                <div className="w-40 h-28 rounded bg-gray-200 overflow-hidden">
                  <ImageWithFallback src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">by {project.creatorName}</p>
                  <Progress value={achievementRate} className="h-2 mt-2" />
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
                  <Input value={backerName} readOnly className="bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                  <Label>이메일</Label>
                  <Input value={backerEmail} readOnly className="bg-gray-100 cursor-not-allowed" />
                </div>
              </CardContent>
            </Card>

            {/* 선택한 리워드 */}
            <Card>
              <CardHeader>
                <CardTitle>선택한 리워드</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRewards.map((r) => (
                  <div key={r.rewardId} className="p-3 border rounded-lg">
                    <p className="font-medium">{r.rewardName}</p>
                    <p className="text-gray-600 text-sm">{r.rewardContent}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      가격: {r.price.toLocaleString()}원 | 예상 발송: {new Date(r.deliveryDate).toLocaleDateString()}
                    </p>

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

            {/* 배송지 선택 / 직접 입력 */}
            <Card>
              <CardHeader>
                <CardTitle>배송지 선택 / 직접 입력</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant={addressMode === 'select' ? 'default' : 'outline'} size="sm" onClick={() => setAddressMode('select')}>
                    배송지 관리에서 선택
                  </Button>
                  <Button variant={addressMode === 'manual' ? 'default' : 'outline'} size="sm" onClick={() => setAddressMode('manual')}>
                    직접 입력
                  </Button>
                </div>

                {addressMode === 'select' ? (
                  <>
                    <SavedAddressModal mode="backing" onSelectAddress={setShippingAddress} />
                    {shippingAddress ? (
                      <div className="text-sm p-3 border rounded-lg">
                        <p>{shippingAddress.addrName}</p>
                        <p>
                          {shippingAddress.roadAddr} {shippingAddress.detailAddr}
                        </p>
                        <p>
                          {shippingAddress.recipient} ({shippingAddress.recipientPhone})
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">배송지를 선택해주세요.</p>
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
                  {selectedRewards.map((r) => (
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
                <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700" disabled={selectedRewards.length === 0}>
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
