import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
//import { Input } from './ui/input';
//import { Label } from './ui/label';
//import { Textarea } from './ui/textarea';
import {
  Heart,
  Package,
  Settings,
  CreditCard,
  MapPin,
  Bell,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";
//import { useLoginUserStore } from '@/store/LoginUserStore.store';
//import { endpoints } from '@/api/apis';
import { endpoints, getData } from "@/api/apis";
import type { LoginUser } from "@/types";
//import { set } from 'date-fns';
//import { useParams } from 'react-router-dom';
import type { BackingMyPageDetail } from "@/types/backing";
import type { LikedDetail } from "@/types/liked";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// const mockSupportedProjects = [
//     {
//         id: '1',
//         title: '혁신적인 스마트 홈 IoT 디바이스',
//         image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200',
//         amount: 80000,
//         reward: '스탠다드 패키지',
//         status: '진행중',
//         date: '2024-02-01',
//     },
//     {
//         id: '2',
//         title: '친환경 대나무 패션 액세서리',
//         image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200',
//         amount: 45000,
//         reward: '베이직 세트',
//         status: '발송완료',
//         date: '2024-01-15',
//     },
// ];

// const mockWishlistProjects = [
//     {
//         id: '3',
//         title: '귀여운 동물 캐릭터 굿즈 세트',
//         image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200',
//         creator: '큐티팩토리',
//         daysLeft: 8,
//         achievementRate: 140,
//     },
// ];

export function MyPage() {
  const [editMode, setEditMode] = useState(false);
  //const { loginUser } = useLoginUserStore();
  //const { projectId } = useParams();
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState<LoginUser>();
  //const[projects, setProjects] =useState<ProjectDetail[]>();
  const [backingProjects, setBackingProjects] =
    useState<BackingMyPageDetail[]>();
  const [likedProjects, setLikedProjects] = useState<LikedDetail[]>();

  useEffect(() => {
    const MypageUser = async () => {
      const response = await getData(endpoints.getMypage(4));
      if (response.status === 200) {
        setLoginUser(response.data);
      }
    };

    const MypageBackingList = async () => {
      const response = await getData(endpoints.getBackingList(4));
      if (response.status === 200) {
        setBackingProjects(response.data);
      }
    };

    const MypageLikedList = async () => {
      const response = await getData(endpoints.getLikedList(4));

      if (response.status === 200) {
        setLikedProjects(response.data);
      }
    };
    MypageUser();
    MypageBackingList();
    MypageLikedList();
  }, []);

  // useEffect(() => {
  //     if(!loginUser){
  //        navigate("/login");
  //        return;
  //     }
  //     const myPageData = async()=>{
  //         const response = await getData(endpoints.getMypage(loginUser.userId));
  //         if(response.status === 2000){
  //             console.log(response.data);
  //         }
  //     };
  //     myPageData();
  // }, [loginUser, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  // if (!loginUser) {
  //     navigate('/login');
  //     return;
  // }

  console.log(likedProjects);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" />
                <AvatarFallback>{loginUser?.nickname}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold mb-1">{loginUser?.nickname}</h3>
              <p className="text-sm text-gray-500 mb-4">{loginUser?.email}</p>
              <Badge variant="secondary">
                {loginUser?.role === "creator"
                  ? "크리에이터"
                  : loginUser?.role === "admin"
                  ? "관리자"
                  : "일반회원"}
              </Badge>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  후원한 프로젝트
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>후원한 프로젝트</DialogTitle>
                  <DialogDescription>후원한 프로젝트</DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[500px] overflow-y-auto space-y-4 mt-4">
                  {backingProjects && backingProjects.length > 0 ? (
                    backingProjects.map((backing) => (
                      <div
                        key={backing.backingReward.backingProject.projectId}
                        className="flex items-center space-x-4 p-3 border rounded-lg"
                      >
                        {/* 썸네일 */}
                        <ImageWithFallback
                          src={backing.backingReward.backingProject.thumbnail}
                          alt={backing.backingReward.backingProject.title}
                          className="w-14 h-14 object-cover rounded"
                        />

                        {/* 프로젝트 정보 */}
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {backing.backingReward.backingProject.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {backing.backingReward.rewardName}
                          </p>
                          <p className="text-sm text-gray-500">
                            후원금액: {formatCurrency(backing.price)}원
                          </p>
                          <p className="text-xs text-gray-400">
                            배송 예정일:{" "}
                            {backing.backingReward.deliveryDate
                              ? new Date(backing.backingReward.deliveryDate)
                                  .toISOString()
                                  .split("T")[0]
                              : "미정"}
                          </p>
                        </div>

                        {/* 버튼 */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/project/${backing.backingReward.backingProject.projectId}`
                            )
                          }
                        >
                          상세보기
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">
                      후원한 프로젝트가 없습니다.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Heart className="mr-2 h-4 w-4" />
                  찜한 프로젝트
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>찜한 프로젝트</DialogTitle>
                </DialogHeader>
                <div className="mt-4 max-h-[500px] overflow-y-auto space-y-4 mt-4">
                  {likedProjects && likedProjects.length > 0 ? (
                    likedProjects.map((liked) => (
                      <div
                        key={liked.projectId}
                        className="flex items-center space-x-4 p-3 border rounded-lg"
                      >
                        {/* 썸네일 */}
                        <ImageWithFallback
                          src={liked.thumbnail}
                          alt={liked.title}
                          className="w-14 h-14 object-cover rounded"
                        />

                        {/* 프로젝트 정보 */}
                        <div className="flex-1">
                          <h4 className="font-medium">{liked.title}</h4>
                          <p className="text-sm text-gray-600">
                            by {liked.creatorName}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>
                              달성률:{" "}
                              {(
                                (liked.currAmount / liked.goalAmount) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                            <span>{3}일 남음</span>
                          </div>
                        </div>

                        {/* 버튼 */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/project/${liked.projectId}`)
                            }
                          >
                            상세보기
                          </Button>
                          <Button size="sm">후원하기</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">
                      찜한 프로젝트가 없습니다.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  계정 설정
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>계정 설정</DialogTitle>
                </DialogHeader>
                <div className="mt-4 max-h-[400px] overflow-y-auto space-y-4">
                  <div className="p-4 border rouded-lg">
                    <h4 className="front-medium mb-2">프로필 수정</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      닉네임, 프로필 이미지를 수정할 수 있습니다.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        닉네임 변경
                      </Button>
                      <Button size="sm" variant="outline">
                        프로필 이미지 변경
                      </Button>
                    </div>
                  </div>
                  {/* 비밀번호 번경 */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">비밀번호 변경</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      계정 보안을 위해 주기적으로 비밀번호를 변경하세요
                    </p>
                    <Button size="sm" variant="outline">
                      비밀번호 변경
                    </Button>
                  </div>
                  {/* 회원 탈퇴 */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 text-red-600">회원 탈퇴</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      탈퇴 시 모든 회원 정보가 삭제되며, 복구할 수 없습니다.
                    </p>
                    <Button size="sm" variant="destructive">
                      회원 탈퇴
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  결제 수단
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>결제 수단</DialogTitle>
                </DialogHeader>
                <div className="mt-4 max-h-[400px] overflow-y-auto space-y-4">
                  {/* 결제 수단 내용 */}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  배송지 관리
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>배송지 관리</DialogTitle>
                </DialogHeader>
                {/* 배송지 추후 수정예정 */}
                <div className="mt-4 max-h-[400px] overflow-y-auto space-y-4">
                  {loginUser &&
                  loginUser.addressList &&
                  loginUser.addressList.length > 0 ? (
                    loginUser.addressList.map((addr) => (
                      <div
                        key={addr.addrId}
                        className="p-4 border rounded-lg flex items-start justify-between"
                      >
                        <div>
                          <h4 className="font-medium">{addr.addrName}</h4>
                          <p className="text-sm text-gray-500">
                            {addr.recipient} ({addr.recipientPhone})
                          </p>
                          <p className="text-sm text-gray-500">
                            {addr.roadAddr} {addr.detailAddr}
                          </p>
                          <Badge
                            variant={addr.isDefault ? "default" : "secondary"}
                          >
                            {addr.isDefault ? "기본배송지" : "보조배송지"}
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // 기본 배송지 설정 API 호출
                            }}
                          >
                            기본 설정
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // 수정 모달 열기
                            }}
                          >
                            수정
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              // 삭제 API 호출
                            }}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">
                      등록된 배송지가 없습니다.
                    </p>
                  )}
                </div>

                {/* 하단 추가 버튼 */}
                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      // 새 배송지 추가 모달 열기
                    }}
                  >
                    배송지 추가
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  알림 설정
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>알림 설정</DialogTitle>
                </DialogHeader>
                <div className="mt-4 max-h-[400px] overflow-y-auto space-y-4">
                  {/* 알림 설정 내용 */}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="supported" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="supported">후원한 프로젝트</TabsTrigger>
              <TabsTrigger value="wishlist">찜한 프로젝트</TabsTrigger>
              <TabsTrigger value="notifications">알림</TabsTrigger>
            </TabsList>

            <TabsContent value="supported" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    후원한 프로젝트 ({backingProjects?.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {backingProjects?.map((backingList) => (
                      <div
                        key={backingList.backingReward.backingProject.projectId}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <ImageWithFallback
                          src={
                            backingList.backingReward.backingProject.thumbnail
                          }
                          alt={backingList.backingReward.backingProject.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">
                            {backingList.backingReward.backingProject.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {backingList.backingReward.rewardName}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span>
                              후원금액: {formatCurrency(backingList.price)}원
                            </span>
                            <Badge
                              variant={
                                backingList.backing.backingStatus === "PENDING"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              <span>
                                {backingList.backing.backingStatus === "PENDING"
                                  ? "진행중"
                                  : backingList.backing.backingStatus ===
                                    "COMPLETED"
                                  ? "결제완료"
                                  : backingList.backing.backingStatus ===
                                    "CANCELED "
                                  ? "결제취소"
                                  : backingList.backing.backingStatus ===
                                    "FAILED "
                                  ? "결제"
                                  : "환불"}
                              </span>
                            </Badge>
                            <span className="text-gray-500">
                              {backingList.backingReward.deliveryDate
                                ? new Date(
                                    backingList.backingReward.deliveryDate
                                  )
                                    .toISOString()
                                    .split("T")[0]
                                : ""}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/project/${backingList.backingReward.backingProject.projectId}`
                            )
                          }
                        >
                          상세보기
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    찜한 프로젝트 ({likedProjects?.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {likedProjects?.map((likedList) => (
                      <div
                        key={likedList.userId}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <ImageWithFallback
                          src={likedList.thumbnail}
                          alt={likedList.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">
                            {likedList.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            by {likedList.creatorName}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span>
                              달성률:{" "}
                              {(
                                (likedList.currAmount / likedList.goalAmount) *
                                100
                              ).toFixed(2)}
                              %
                            </span>
                            <span className="text-gray-500">{3}일 남음</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/project/${likedList.userId}`)
                            }
                          >
                            상세보기
                          </Button>
                          <Button size="sm">후원하기</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>계정 관리</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    비밀번호 변경
                  </Button>
                  <Button variant="outline" className="w-full">
                    배송지 관리
                  </Button>
                  <Button variant="outline" className="w-full">
                    결제 수단 관리
                  </Button>
                  <Button variant="destructive" className="w-full">
                    회원 탈퇴
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>알림 설정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">프로젝트 업데이트</h4>
                        <p className="text-sm text-gray-500">
                          후원한 프로젝트의 새소식 알림
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        설정
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">마케팅 알림</h4>
                        <p className="text-sm text-gray-500">
                          새로운 프로젝트 및 이벤트 소식
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        설정
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">시스템 알림</h4>
                        <p className="text-sm text-gray-500">
                          결제, 배송 등 중요한 알림
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        설정
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
