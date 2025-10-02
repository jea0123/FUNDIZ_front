import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { endpoints, getData, postData } from "@/api/apis";
import type { creatorPList } from "@/types/creator";

export function CreatorPage() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [roleView, setRoleView] = useState<"user" | "creator">("creator");
  const [projects, setProjects] =useState<creatorPList[]>([]);
  const navigate = useNavigate();

  const creatorId = 96;

  useEffect(() => {
    if(activeMenu === "manage"){
      getData(endpoints.getCreatorPageList(creatorId)).then((res)=>{
        if(res && res.status ===200){
          setProjects(res.data);
        }
      }).catch((err)=>{
        console.error("프로젝트 리스트 불러오기 실패" ,err);
      });    
    }
  },[activeMenu, creatorId]);

const statusMap: Record<string, {class: string; label: string}> ={
  DRAFT: {class : "bg-gray-100 text-gray-700" , label: "작성 중"},
  VERIFYING: {class : "bg-blue-100 text-blue-700", label : "심사 중"},
  UPCOMING: {class : "bg-yellow-100 text-yellow-700", label: "오픈 예정"},
  REJECTED: {class : "bg-red=100 text-red-700", label: "반려"},
  OPEN: { class : "bg-purple-100 text-purple-700", label : "진행 중"},
  SUCCESS : {class : "bg-green-100 text-green-700", label : "성공"},
  FAILED : { class : "bg-red-100 text-red-700", label: "실패"},
  CANCELED: {class : "bg-lime-100 text-lime-700", label : "취소"},
  SETTLED: {class : "bg-rose-100 text-rose-700", label : "정산 완료"},
  CLOSED: {class : "bg-fuchsia-100 text-fuchsia-700", label : "종료"}  
}

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
              <h3 className="font-semibold mb-1">성직자</h3>
              <p className="text-sm text-gray-500 mb-4">hong@example.com</p>
              <Badge variant="secondary">크리에이터</Badge>
            </CardContent>
          </Card>

          {/* 메뉴 버튼 */}
          <div className="mt-6 space-y-2">
            {[
              { key: "dashboard", label: "창작자 대시보드" },
              { key: "register", label: "프로젝트 등록" },
              { key: "manage", label: "프로젝트 관리" },
              { key: "fundings", label: "후원 내역" },
              { key: "shipping", label: "배송 내역" },
              { key: "qna", label: "QnA" },
              { key: "settlement", label: "정산 내역" },
            ].map((menu) => (
              <Button
                key={menu.key}
                variant={activeMenu === menu.key ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveMenu(menu.key)}
              >
                {menu.label}
              </Button>
            ))}
          </div>          
        </div>

        {/* 오른쪽 컨텐츠 */}
        <div className="lg:col-span-3">
          {activeMenu === "dashboard" && (
            <div>
              <h2 className="text-xl font-bold mb-4">프로젝트 관리</h2>
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
                    <CardTitle>총 후원받은 수</CardTitle>
                  </CardHeader>
                  <CardContent>34,567</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>프로젝트 승인 대기</CardTitle>
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
          {activeMenu === "register" && <div>프로젝트 등록 페이지로</div>}
          {activeMenu === "manage" && (
            <div>
              <h2 className="text-xl font-bold mb-4">내 프로젝트 관리</h2>
              {projects.length === 0 ? (
                <p className="text-gray-500">등록된 프로젝트가 없습니다.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <Card key={project.projectId} className="overflow-hidden">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="h-40 w-full object-cover"
                      />
                      <CardHeader>
                        <CardTitle>{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">
                            목표 {project.goalAmount.toLocaleString()}원
                          </span>
                          <Badge className={statusMap[project.projectStatus]?.class || "bg-gray-100 text-gray-600"}>
                            {statusMap[project.projectStatus]?.label || project.projectStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          현재 {project.currAmount.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          생성일: {project.createdAt}
                        </p>
                        <Button
                          variant="outline"
                          className="mt-3 w-full"
                          onClick={() =>
                            alert(`프로젝트 ${project.projectId} 상세 관리`)
                          }
                        >
                          상세 관리
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeMenu === "fundings" && <div>후원 내역 화면</div>}
          {activeMenu === "shipping" && <div>배송 내역 화면</div>}
          {activeMenu === "qna" && <div>QnA 관리 화면</div>}
          {activeMenu === "settlement" && <div>정산 내역 화면</div>}
        </div>
      </div>
    </div>
  );
}
