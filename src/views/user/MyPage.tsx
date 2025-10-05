import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
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
  TrendingUpDown,
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";
//import { useLoginUserStore } from '@/store/LoginUserStore.store';
//import { endpoints } from '@/api/apis';
import { endpoints, getData, postData, deleteData } from "@/api/apis";
import type { LoginUser } from "@/types";
//import { set } from 'date-fns';
//import { useParams } from 'react-router-dom';
import type { BackingMyPageDetail } from "@/types/backing";
import type { LikedDetail } from "@/types/liked";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  AddrAddRequest,
  AddrUpdateRequest,
  AddressResponse,
} from "@/types/address";

import { SavedAddressModal } from "../backing/SavedAddressModal";

export function MyPage() {
  const tempUserId = 1;
  const [editMode, setEditMode] = useState(false);
  //const { loginUser } = useLoginUserStore();
  //const { projectId } = useParams();
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState<LoginUser>();
  //const[projects, setProjects] =useState<ProjectDetail[]>();
  const [addrList, setAddressList] = useState<AddressResponse[]>();
  const [addrAdd, setAddrAdd] = useState<AddrAddRequest>({
    addrName: "",
    recipient: "",
    postalCode: "",
    roadAddr: "",
    detailAddr: "",
    recipientPhone: "",
    isDefault: "N",
  });
  

  const [roleView, setRoleView] = useState<"user" | "creator">("user");

  const [addrEdit, setAddrEdit] = useState<AddrUpdateRequest>({
    addrId: 0,
    userId: tempUserId,
    addrName: "",
    recipient: "",
    postalCode: "",
    roadAddr: "",
    detailAddr: "",
    recipientPhone: "",
  });
  const statusLabel: Record<string, string> = {
    PENDING: "결제 대기",
    COMPLETED: "결제 완료",
    CANCELED: "결제 취소",
    FAILED: "결제 실패",
    REFUNDED: "환불",
  };
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("supported"); // 왼쪽 버튼 클릭 시 오른쪽 탭 제어
  const [backingProjects, setBackingProjects] =
    useState<BackingMyPageDetail[]>();
  const [likedProjects, setLikedProjects] = useState<LikedDetail[]>();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null);
  const [isBackingDetailOpen, setIsBackingDetailOpen] = useState(false);
  const [selectedBacking, setSelectedBacking] =
    useState<BackingMyPageDetail | null>(null);
  const MypageAddrDelete = async (addrId: number) => {
    const response = await deleteData(endpoints.deleteAddress(tempUserId, addrId), {});
    if (response.status === 200) {
      alert("배송지가 삭제되었습니다.");

      const addrResponse = await getData(endpoints.getAddressList(tempUserId));
      if (addrResponse.status === 200) {
        setAddressList(addrResponse.data);
      }
      setIsDeleteDialogOpen(false);
      setSelectedAddrId(null);

      return true;
    } else {
      alert("배송지 삭제 실패");
      return false;
    }
  };

  const MypageAddrAdd = async (newAddr: AddrAddRequest) => {
    const response = await postData(endpoints.createAddress(tempUserId), newAddr);
    if (response.status === 200) {
      alert("배송지가 추가되었습니다.");

      const addrResponse = await getData(endpoints.getAddressList(tempUserId));
      if (addrResponse.status === 200) {
        setAddressList(addrResponse.data);
      }
      return true;
      setIsAddDialogOpen(false);
    } else {
      alert("배송지 추가 실패");
      return false;
    }
  };


  const MyPageAddrUpdate = async (
    addrId: number,
    updateAddr: AddrUpdateRequest
  ) => {
    const response = await postData(
      endpoints.updateAddress(tempUserId, addrId),
      updateAddr
    );
    if (response.status === 200) {
      alert("배송지가 수정되었습니다.");

      const addrResponse = await getData(endpoints.getAddressList(tempUserId));
      if (addrResponse.status === 200) {
        setAddressList(addrResponse.data);
      }
      setIsEditDialogOpen(false);
      return true;
    } else {
      alert("배송지 수정 실패");
      return false;
    }
  };

  useEffect(() => {
    const MypageUser = async () => {
      const response = await getData(endpoints.getMypage(tempUserId));
      if (response.status === 200) {
        setLoginUser(response.data);
      }
    };

    const MypageAddressList = async () => {
      const response = await getData(endpoints.getAddressList(tempUserId));
      if (response.status === 200) {
        setAddressList(response.data);
      }
    };

    const MypageBackingList = async () => {
      const response = await getData(endpoints.getBackingList(tempUserId));
      if (response.status === 200) {
        setBackingProjects(response.data);
      }
    };

    const MypageLikedList = async () => {
      const response = await getData(endpoints.getLikedList(tempUserId));

      if (response.status === 200) {
        setLikedProjects(response.data);
      }
    };

    MypageUser();
    MypageBackingList();
    MypageLikedList();
    MypageAddressList();
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

  const fetchBackingdetail = async (
    userId: number,
    projectId: number,
    rewardId: number
  ) => {
    const response = await getData(
      endpoints.getBackingDetail(userId, projectId, rewardId)
    );
    if (response.status === 200) {
      setSelectedBacking(response.data as BackingMyPageDetail);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4 space-x-2">
                <Button
                  variant={roleView === "user" ? "default" : "outline"}
                  onClick={() => setRoleView("user")}
                >
                  후원자
                </Button>
                <Button
                  variant={roleView === "creator" ? "default" : "outline"}
                  onClick={() => navigate("/creator")}
                >
                  창작자
                </Button>
              </div>
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
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setActiveTab("supported")}
            >
              <Package className="mr-2 h-4 w-4" />
              후원한 프로젝트
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setActiveTab("wishlist")}
            >
              <Heart className="mr-2 h-4 w-4" />
              찜한 프로젝트
            </Button>

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

            {/* 모드에 따라 배송지 출력화면 다르게 */}
            <SavedAddressModal
              mode="mypage"
              triggerText="배송지 관리"
              onSelectAddress={(address) => {
                console.log("선택된 주소 : ", address);
              }}
            />

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="mr-2 h-4 w-4" />
              알림
            </Button>
          </div>
        </div>

        {/* 오른쪽 탭 */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} className="w-full">
            {/* 후원한 프로젝트 */}
            <TabsContent value="supported" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    후원한 프로젝트 ({backingProjects?.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {backingProjects?.map((backingList, index) => (
                      <div
                        key={`${backingList.backingReward.backingProject.projectId}-${index}`}
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
                                {statusLabel[
                                  backingList.backing.backingStatus
                                ] ?? "알 수 없음 "}
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
                        <Dialog
                          open={isBackingDetailOpen}
                          onOpenChange={setIsBackingDetailOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                fetchBackingdetail(
                                  tempUserId,
                                  backingList.backingReward.backingProject
                                    .projectId,
                                  backingList.backingReward.rewardId
                                );
                                setIsBackingDetailOpen(true);
                              }}
                            >
                              상세보기
                            </Button>
                          </DialogTrigger>
                          {selectedBacking && (
                            <DialogContent className="w-screen h-screen max-w-none p-6">
                              <DialogHeader>
                                <DialogTitle>
                                  {
                                    selectedBacking.backingReward.backingProject
                                      .title
                                  }
                                </DialogTitle>
                                <DialogDescription>
                                  후원 상세 내역을 확인하세요
                                </DialogDescription>
                              </DialogHeader>
                              <div className="h-full overflow-y-auto space-y-6">
                                <ImageWithFallback
                                  src={
                                    selectedBacking.backingReward.backingProject
                                      .thumbnail
                                  }
                                  alt={
                                    selectedBacking.backingReward.backingProject
                                      .title
                                  }
                                  className="w-24 h-24 object-cover rounded"
                                />

                                <div>
                                  <h2 className="font-semibold text-lg">
                                    {
                                      selectedBacking.backingReward
                                        .backingProject.title
                                    }
                                  </h2>
                                  <p className="text-sm text-gray-500">
                                    달성금액{" "}
                                    {formatCurrency(
                                      selectedBacking.backingReward
                                        .backingProject.currAmount ?? 0
                                    )}
                                    원 / 목표{" "}
                                    {formatCurrency(
                                      selectedBacking.backingReward
                                        .backingProject.goalAmount ?? 0
                                    )}
                                    원
                                  </p>
                                </div>
                              </div>

                              <section className="mt-4">
                                <h3 className="font-medium mb-2">후원 정보</h3>
                                <div className="text-sm space-y-1">
                                  <p>
                                    후원 상태 :{" "}
                                    {statusLabel[
                                      selectedBacking.backing.backingStatus.trim()
                                    ] ?? "알 수 없음"}
                                  </p>
                                  <p>
                                    후원일 :{" "}
                                    {
                                      new Date(
                                        selectedBacking.backing.createdAt
                                      )
                                        .toISOString()
                                        .split("T")[0]
                                    }
                                  </p>
                                  <p>
                                    프로젝트 종료일 :{" "}
                                    {
                                      new Date(
                                        selectedBacking.backingReward.backingProject.endDate
                                      )
                                        .toISOString()
                                        .split("T")[0]
                                    }
                                  </p>
                                  <p>
                                    총 후원 금액 :{" "}
                                    {formatCurrency(
                                      selectedBacking.backing.amount
                                    )}
                                    원
                                  </p>
                                </div>
                              </section>

                              <section className="mt-4">
                                <h3 className="font-medium mb-2">선물 정보</h3>
                                <div className="text-sm space-y-1">
                                  <p>
                                    리워드명 :{" "}
                                    {selectedBacking.backingReward.rewardName}
                                  </p>
                                  <p>수량 : {selectedBacking.quantity}개</p>
                                  <p>
                                    리워드 금액 :{" "}
                                    {formatCurrency(selectedBacking.price)}원
                                  </p>
                                  <p>
                                    배송 예정일 :{" "}
                                    {selectedBacking.backingReward.deliveryDate
                                      ? new Date(
                                          selectedBacking.backingReward.deliveryDate
                                        )
                                          .toISOString()
                                          .split("T")[0]
                                      : "미정"}
                                  </p>
                                </div>
                              </section>

                              <section className="mt-4">
                                <h3 className="font-medium mb-2">결제 정보</h3>
                                <div className="text-sm space-y-1">
                                  <p>결제 수단 : </p>
                                  <p>결제 금액 : </p>
                                  <p>결제 상태 : </p>
                                  <p></p>
                                </div>
                              </section>

                              <div className="absolute bottom-4 right-4">
                                <DialogClose asChild>
                                  <Button variant="outline">닫기</Button>
                                </DialogClose>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 찜한 프로젝트 */}
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
                        key={likedList.projectId}
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
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 알림 설정 */}
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
