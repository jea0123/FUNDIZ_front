import { useEffect, useState } from 'react';
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
import { endpoints, getData, postData } from '@/api/apis';
import type { Reward } from '@/types/reward';
import type { ProjectDetail } from '@/types/projects';

export function BackingPage() {
  const tempUserId = 1;
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const rewardId = searchParams.get('rewardId');
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const response = await getData<ProjectDetail>(endpoints.getProjectDetail(Number(projectId)));

        // ✅ response.data가 있을 때만 세팅
        if (response.status === 200 && response.data) {
          setProject(response.data);
          const foundReward = response.data.rewardList?.find((r: Reward) => String(r.rewardId) === rewardId);
          setSelectedReward(foundReward ?? response.data.rewardList?.[0] ?? null);
        } else {
          // ✅ fallback 예시 데이터
          console.warn('⚠️ 서버 응답 없음, 하드코딩 데이터로 대체합니다.');
          const fallback = {
            projectId: 43,
            title: '하드코딩 테스트 프로젝트',
            goalAmount: 500000,
            currAmount: 320000,
            creatorName: '홍길동',
            thumbnail: 'https://placehold.co/600x400',
            rewardList: [
              {
                rewardId: 1,
                rewardName: '머그컵 1개 세트',
                rewardContent: '핸드메이드 세라믹 머그컵',
                price: 12000,
                deliveryDate: '2025-11-01',
              },
              {
                rewardId: 2,
                rewardName: '머그컵 2개 세트',
                rewardContent: '머그컵 2개 + 포장 포함',
                price: 22000,
                deliveryDate: '2025-11-10',
              },
            ],
          } as any;
          setProject(fallback);
          setSelectedReward(fallback.rewardList[0]);
        }
      } catch (err) {
        console.error('❌ 프로젝트 API 실패:', err);

        // ✅ 예외 발생 시에도 fallback 사용
        const fallback = {
          projectId: 43,
          title: '하드코딩 테스트 프로젝트',
          goalAmount: 500000,
          currAmount: 320000,
          creatorName: '홍길동',
          thumbnail: 'https://placehold.co/600x400',
          rewardList: [
            {
              rewardId: 1,
              rewardName: '머그컵 1개 세트',
              rewardContent: '핸드메이드 세라믹 머그컵',
              price: 12000,
              deliveryDate: '2025-11-01',
            },
          ],
        } as any;
        setProject(fallback);
        setSelectedReward(fallback.rewardList[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, rewardId]);

  if (loading) {
    return <p className="text-center py-10 text-gray-500">프로젝트 정보를 불러오는 중...</p>;
  }

  if (!project || !selectedReward) {
    return <p className="text-center py-10 text-gray-500">⚠️ 프로젝트 정보를 불러올 수 없습니다.</p>;
  }

  const achievementRate = Math.round((project.currAmount / project.goalAmount) * 100);

  const getTotalAmount = () => {
    const rewardAmount = selectedReward.price * quantity;
    const additional = customAmount ? parseInt(customAmount) : 0;
    return rewardAmount + additional;
  };

  const handleSubmit = async () => {
    const totalAmount = getTotalAmount();
    alert(`✅ 후원이 완료되었습니다!\n총 금액: ${totalAmount.toLocaleString()}원`);
    navigate(`/project/${projectId}`);
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
          {/* 메인 */}
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

            {/* 리워드 */}
            <Card>
              <CardHeader>
                <CardTitle>선택한 리워드</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{selectedReward.rewardName}</p>
                <p className="text-gray-600">{selectedReward.rewardContent}</p>
                <p className="mt-2">금액: {selectedReward.price.toLocaleString()}원</p>
                <p className="text-sm text-gray-500">예상 발송: {new Date(selectedReward.deliveryDate).toLocaleDateString()}</p>

                <div className="mt-4 flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className="w-8 h-8 p-0">
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg">{quantity}</span>
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuantity((prev) => prev + 1)} className="w-8 h-8 p-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
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

            {/* 배송지 */}
            <Card>
              <CardHeader>
                <CardTitle>배송지 선택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>

          {/* 요약 */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>후원 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p>{selectedReward.rewardName}</p>
                  <p>
                    {selectedReward.price.toLocaleString()}원 × {quantity}개
                  </p>
                  {customAmount && <p>추가: {parseInt(customAmount).toLocaleString()}원</p>}
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span>총 금액</span>
                  <span className="text-blue-600">{getTotalAmount().toLocaleString()}원</span>
                </div>
                <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700" disabled={!selectedReward}>
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
