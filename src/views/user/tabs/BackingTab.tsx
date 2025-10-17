import { endpoints, getData } from "@/api/apis";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MyPageBackingDetail, MyPgaeBackingList } from "@/types/backing";
import { formatNumber } from "@/utils/utils";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const tempUserId = 1;

// 안전한 날짜 변환 함수
const safeDate = (value: any): string => {
  if (!value) return "-";
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? "-" : parsed.toISOString().split("T")[0];
};


export default function BackingTab() {
  const statusLabel: Record<string, string> = {
    PENDING: "결제 대기",
    COMPLETED: "결제 완료",
    CANCELED: "결제 취소",
    FAILED: "결제 실패",
    REFUNDED: "환불",
  };

  const shippingLabel: Record<string, string> = {
    PENDING: "후원 완료",
    READY: "상품 준비 중",
    SHIPPED: "배송 시작",
    DELIVERED: "배송 완료",
    CANCELED: "취소",
    FAILED: "배송 실패",
  };

  const [backingProjects, setBackingProjects] = useState<MyPgaeBackingList[]>(
    []
  );
  const navigate = useNavigate();
  const [backingPage, setBackingPage] = useState(1);
  const itemsPerPage = 5;
  const [backingSearch, setBackingSearch] = useState("");

  const [isBackingDetailOpen, setIsBackingDetailOpen] = useState(false);
  const [selectedBacking, setSelectedBacking] =
    useState<MyPageBackingDetail | null>(null);

  // 마이페이지 후원 리스트 호출
  const MypageBackingList = async () => {
    try {
      const response = await getData(
        endpoints.getMypageBackingList(tempUserId)
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        const safeData = response.data.map((b) => ({
          ...b,
          //  백엔드의 mpBackingList를 사용하도록 수정
          mpBackingList: Array.isArray(b.mpBackingList) ? b.mpBackingList : [],
        }));
        setBackingProjects(safeData);
      } else {
        setBackingProjects([]);
      }
    } catch (err) {
      console.error("❌ 후원 리스트 불러오기 실패:", err);
      setBackingProjects([]);
    }
  };

  useEffect(() => {
    MypageBackingList();
  }, []);

  const fetchBackingdetail = async (userId: number) => {
    try {
      const response = await getData(endpoints.getMypageBackingDetail(userId));
      if (response.status === 200 && response.data) {
        const safeDetail = {
          ...response.data,
          mpBackingList: Array.isArray(response.data.mpBackingList)
            ? response.data.mpBackingList
            : [],
        };
        setSelectedBacking(safeDetail);
        setIsBackingDetailOpen(true);
      }
    } catch (err) {
      console.error("❌ 후원 상세 불러오기 실패:", err);
    }
  };

  const openBackingById = (backingId: number) => {
    const target = backingProjects.find(
      (b) => Number(b.backingId) === Number(backingId)
    );
    if (!target) return;
    fetchBackingdetail(tempUserId);
  };

  //  검색 시 mpBackingList 사용
  const filteredBackings = backingProjects?.filter((b) => {
    const titleMatch = b?.title
      ?.toLowerCase()
      .includes(backingSearch.toLowerCase());
    const rewardMatch = b?.mpBackingList?.some((r) =>
      r?.rewardName?.toLowerCase().includes(backingSearch.toLowerCase())
    );
    return titleMatch || rewardMatch;
  });

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>
          후원한 프로젝트 ({backingProjects?.length ?? 0}개)
        </CardTitle>
        <input
          type="text"
          placeholder="프로젝트 또는 리워드 검색"
          className="border rounded px-3 py-1 text-sm w-48"
          value={backingSearch}
          onChange={(e) => {
            setBackingSearch(e.target.value);
            setBackingPage(1);
          }}
        />
      </CardHeader>

      {/* 리스트 */}
      <CardContent>
        <div className="space-y-4">
          {filteredBackings && filteredBackings.length > 0 ? (
            filteredBackings
              .slice(
                (backingPage - 1) * itemsPerPage,
                backingPage * itemsPerPage
              )
              .map((backingList, index) => {
                const completionRate =
                  backingList.goalAmount && backingList.goalAmount > 0
                    ? (backingList.currAmount / backingList.goalAmount) * 100
                    : 0;

                const isCompleted = backingList.backingStatus === "COMPLETED";
                const statusText = isCompleted
                  ? shippingLabel[backingList.shippingStatus] ?? "알 수 없음"
                  : statusLabel[backingList.backingStatus] ?? "알 수 없음";

                // mpBackingList 기준으로 리워드명 출력
                const rewardNames = backingList.mpBackingList
                  ?.map((r) => r.rewardName)
                  .filter(Boolean)
                  .join(", ");

                return (
                  <div
                    key={`${backingList.projectId}-${index}`}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    {/* 상단 */}
                    <div className="flex items-center space-x-4">
                      <ImageWithFallback
                        src={backingList.thumbnail}
                        alt={backingList.title}
                        className="w-20 h-20 object-cover rounded"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-base">
                            {backingList.title}
                          </h4>
                          <Badge variant="outline">{statusText}</Badge>
                        </div>

                        <p className="text-sm text-gray-600">
                          창작자: {backingList.creatorName ?? "-"}
                        </p>
                        <p className="text-sm text-gray-600">
                          후원 리워드:{" "}
                          {rewardNames?.length ? rewardNames : "없음"}
                        </p>

                        {/* 진행률 바 */}
                        <div className="mt-2 bg-gray-200 h-3 rounded-full w-full overflow-hidden">
                          {(() => {
                            //  색상 계산 로직 (25% 단위)
                            let progressColor = "bg-red-500";
                            if (completionRate >= 100)
                              progressColor = "bg-blue-500";
                            else if (completionRate >= 75)
                              progressColor = "bg-green-500";
                            else if (completionRate >= 50)
                              progressColor = "bg-yellow-500";
                            else if (completionRate >= 25)
                              progressColor = "bg-orange-500";

                            return (
                              <div
                                className={`h-full ${progressColor} rounded-full transition-all duration-300`}
                                style={{
                                  width: `${Math.min(completionRate, 300)}%`, // 최대 300% 시각적 한도
                                }}
                              ></div>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          달성률: {completionRate.toFixed(1)}% (
                          {formatNumber(backingList.currAmount)}원 /{" "}
                          {formatNumber(backingList.goalAmount)}원)
                        </p>
                      </div>
                    </div>

                    {/* 하단 */}
                    <div className="flex justify-between items-center text-sm text-gray-700 mt-2">
                      <span>후원일: {safeDate(backingList.createdAt)}</span>
                      <span>
                        총 후원금액: {formatNumber(backingList.amount)}원
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/user/support/${backingList.backingId}`)}
                      >
                        상세보기
                      </Button>
                    </div>
                  </div>
                );
              })
          ) : (
            <p className="text-center text-gray-500 py-8">
              후원한 프로젝트가 없습니다.
            </p>
          )}
        </div>

        {/* 페이지네이션 */}
        {backingProjects && backingProjects.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              size="sm"
              variant="outline"
              disabled={backingPage === 1}
              onClick={() => setBackingPage(backingPage - 1)}
            >
              이전
            </Button>

            {Array.from({
              length: Math.max(
                1,
                Math.ceil(backingProjects.length / itemsPerPage)
              ),
            }).map((_, idx) => (
              <Button
                key={idx}
                size="sm"
                variant={backingPage === idx + 1 ? "default" : "outline"}
                onClick={() => setBackingPage(idx + 1)}
              >
                {idx + 1}
              </Button>
            ))}

            <Button
              size="sm"
              variant="outline"
              disabled={
                backingPage ===
                Math.max(1, Math.ceil(backingProjects.length / itemsPerPage))
              }
              onClick={() => setBackingPage(backingPage + 1)}
            >
              다음
            </Button>
          </div>
        )}
      </CardContent>

    
    </Card>
  );
}
