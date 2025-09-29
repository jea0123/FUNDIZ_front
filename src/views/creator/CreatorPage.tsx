import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export function CreatorPage() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [roleView, setRoleView] = useState<"user" | "creator">("creator");
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 좌측 메뉴 */}
        <div className="lg:col-span-1">
          {/* 프로필 카드 */}
          <Card>
            <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4 space-x-2">
                <Button
                  variant={roleView === "user" ? "default" : "outline"}
                  onClick={() => navigate("/user/mypage")}
                >
                  후원자
                </Button>
                <Button
                  variant={roleView === "creator" ? "default" : "outline"}
                  onClick={() => setRoleView("creator")}
                >
                  창작자
                </Button>
              </div>
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" />
                <AvatarFallback>유저</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold mb-1">성직자명</h3>
              <p className="text-sm text-gray-500 mb-4">hong@example.com</p>
              <Badge variant="secondary">크리에이터</Badge>
            </CardContent>
          </Card>

          {/* 메뉴 버튼 */}
          <div className="mt-6 space-y-2">
            <Button
              variant={activeMenu === "register" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveMenu("register")}
            >
              프로젝트 등록
            </Button>
            <Button
              variant={activeMenu === "manage" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveMenu("manage")}
            >
              프로젝트 관리
            </Button>
            <Button
              variant={activeMenu === "fundings" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveMenu("fundings")}
            >
              후원 내역
            </Button>
            <Button
              variant={activeMenu === "shipping" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveMenu("shipping")}
            >
              배송 내역
            </Button>
            <Button
              variant={activeMenu === "qna" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveMenu("qna")}
            >
              QnA
            </Button>
            <Button
              variant={activeMenu === "settlement" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveMenu("settlement")}
            >
              정산 내역
            </Button>
          </div>
        </div>

        {/* 오른쪽 컨텐츠 */}
        <div className="lg:col-span-3">
          {activeMenu === "dashboard" && (
            <div>
              <h2 className="text-xl font-bold mb-4">창작자 대시보드</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>총 프로젝트</CardTitle>
                  </CardHeader>
                  <CardContent>1,247</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>총 후원금</CardTitle>
                  </CardHeader>
                  <CardContent>₩154.2억</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>총 회원</CardTitle>
                  </CardHeader>
                  <CardContent>34,567</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>승인 대기</CardTitle>
                  </CardHeader>
                  <CardContent>23</CardContent>
                </Card>
              </div>
              {/* 그래프 자리 */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>월별 프로젝트 현황</CardTitle>
                </CardHeader>
                <CardContent>📊 차트 컴포넌트 자리</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>카테고리별 분포</CardTitle>
                </CardHeader>
                <CardContent>🟢 파이차트 자리</CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "register" && <div>프로젝트 등록 화면</div>}
          {activeMenu === "manage" && <div>프로젝트 관리 화면</div>}
          {activeMenu === "fundings" && <div>후원 내역 화면</div>}
          {activeMenu === "shipping" && <div>배송 내역 화면</div>}
          {activeMenu === "qna" && <div>QnA 관리 화면</div>}
          {activeMenu === "settlement" && <div>정산 내역 화면</div>}
        </div>
      </div>
    </div>
  );
}
