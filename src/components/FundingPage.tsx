import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SavedAddressModal } from "./SavedAddressModal";

import { endpoints, getData, postData } from "@/api/apis";
import type { Reward } from "@/types/reward";
import type { ProjectDetail } from "@/types/projects";

export function FundingPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const rewardId = searchParams.get("rewardId");
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetail>();
  const [selectedReward, setSelectedReward] = useState<Reward>();
  const [customAmount, setCustomAmount] = useState<string>("");

  // 수량
  const [quantity, setQuantity] = useState<number>(1);

  // 배송지
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [manualAddress, setManualAddress] = useState({
    recipient: "",
    recipientPhone: "",
    roadAddr: "",
    detailAddr: "",
    postalCode: "",
  });

  // 후원자 정보
  const [backerName, setBackerName] = useState<string>("");
  const [backerEmail, setBackerEmail] = useState<string>("");

  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      const response = await getData(endpoints.getProjectDetail(Number(projectId)));
      if (response.status === 200) {
        setProject(response.data);
        const reward = response.data.rewardList.find(
          (r: Reward) => String(r.rewardId) === rewardId
        );
        setSelectedReward(reward);
      }
    };
    fetchData();
  }, [projectId, rewardId]);

  const achievementRate = project
    ? Math.round((project.currAmount / project.goalAmount) * 100)
    : 0;

  const getTotalAmount = () => {
    const rewardAmount = selectedReward ? selectedReward.price * quantity : 0;
    const additional = customAmount ? parseInt(customAmount) : 0;
    return rewardAmount + additional;
  };

  const handleSubmit = async () => {
    if (!selectedReward || !projectId) return;

    const finalAddress = shippingAddress
      ? { addrId: shippingAddress.addrId }
      : manualAddress.recipient && manualAddress.roadAddr
      ? { newAddress: manualAddress }
      : null;

    if (!finalAddress) {
      alert("배송지를 선택하거나 입력해주세요.");
      return;
    }

    const payload = {
      userId: 1, // TODO: 로그인 유저 ID
      ...finalAddress,
      backingRewardList: [
        {
          rewardId: selectedReward.rewardId,
          price: selectedReward.price,
          quantity,
          deliveryDate: selectedReward.deliveryDate,
        },
      ],
    };

    const res = await postData(endpoints.createBacking(Number(projectId)), payload);
    if (res.status === 200) {
      alert("후원이 완료되었습니다!");
      navigate("/mypage");
    }
  };

  if (!project || !selectedReward) {
    return <p>프로젝트 정보를 불러오는 중...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
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
                  <ImageWithFallback
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">by {project.creatorName}</p>
                  <Progress value={achievementRate} className="h-2 mt-2" />
                  <p className="text-sm mt-1">{achievementRate}% 달성</p>
                </div>
              </CardContent>
            </Card>

            {/* 선택된 리워드 */}
            <Card>
              <CardHeader>
                <CardTitle>선택한 리워드</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{selectedReward.rewardName}</p>
                <p className="text-gray-600">{selectedReward.rewardContent}</p>
                <p className="mt-2">금액: {selectedReward.price.toLocaleString()}원</p>
                <p className="text-sm text-gray-500">
                  예상 발송: {new Date(selectedReward.deliveryDate).toLocaleDateString()}
                </p>

                {/* 수량 선택 */}
                <div className="mt-4 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg">{quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-8 h-8 p-0"
                  >
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
                <Input
                  type="number"
                  placeholder="0"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* 후원자 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>후원자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>이름</Label>
                  <Input value={backerName} onChange={(e) => setBackerName(e.target.value)} />
                </div>
                <div>
                  <Label>이메일</Label>
                  <Input
                    type="email"
                    value={backerEmail}
                    onChange={(e) => setBackerEmail(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 배송지 */}
            <Card>
              <CardHeader>
                <CardTitle>배송지 선택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SavedAddressModal onSelect={setShippingAddress} />

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
                  <>
                    <p className="text-sm text-gray-500">등록된 배송지가 없으면 직접 입력하세요.</p>
                    <div className="space-y-3 mt-3">
                      <Input
                        placeholder="배송지 명"
                        value={manualAddress.recipient}
                        onChange={(e) =>
                          setManualAddress({ ...manualAddress, recipient: e.target.value })
                        }
                      />
                      <Input
                        placeholder="수령인"
                        value={manualAddress.recipient}
                        onChange={(e) =>
                          setManualAddress({ ...manualAddress, recipient: e.target.value })
                        }
                      />
                      <Input
                        placeholder="우편번호"
                        value={manualAddress.recipientPhone}
                        onChange={(e) =>
                          setManualAddress({ ...manualAddress, recipientPhone: e.target.value })
                        }
                      />
                      <Input
                        placeholder="도로명 주소"
                        value={manualAddress.roadAddr}
                        onChange={(e) =>
                          setManualAddress({ ...manualAddress, roadAddr: e.target.value })
                        }
                      />
                      <Input
                        placeholder="상세주소"
                        value={manualAddress.detailAddr}
                        onChange={(e) =>
                          setManualAddress({ ...manualAddress, detailAddr: e.target.value })
                        }
                      />
                      <Input
                        placeholder="수령인 전화번호"
                        value={manualAddress.postalCode}
                        onChange={(e) =>
                          setManualAddress({ ...manualAddress, postalCode: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 사이드 요약 */}
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
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={
                    !backerName ||
                    !backerEmail ||
                    (!shippingAddress && !manualAddress.recipient)
                  }
                >
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
