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
import { endpoints, getData, postData } from "@/api/apis";
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

export function MyPage() {
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
  const [activeTab, setActiveTab] = useState("supported"); // 왼쪽 버튼 클릭 시 오른쪽 탭 제어
  const [backingProjects, setBackingProjects] =
    useState<BackingMyPageDetail[]>();
  const [likedProjects, setLikedProjects] = useState<LikedDetail[]>();

  const MypageAddrAdd = async (newAddr: AddrAddRequest) => {
    const response = await postData(endpoints.createAddress(4), newAddr);
    if (response.status === 200) {
      alert("배송지가 추가되었습니다.");

      const addrResponse = await getData(endpoints.getAddressList(4));
      if (addrResponse.status === 200) {
        setAddressList(addrResponse.data);
      }
    } else {
      alert("배송지 추가 실패");
    }
  };

  useEffect(() => {
    const MypageUser = async () => {
      const response = await getData(endpoints.getMypage(4));
      if (response.status === 200) {
        setLoginUser(response.data);
      }
    };

    const MypageAddressList = async () => {
      const response = await getData(endpoints.getAddressList(4));
      if (response.status === 200) {
        setAddressList(response.data);
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
            <Button variant="ghost" className="w-full justify-start"
              onClick={() => setActiveTab("supported")}>
                <Package className="mr-2 h-4 w-4"/>
                후원한 프로젝트
              </Button>

              <Button variant="ghost" className="w-full justify-start"
              onClick={() => setActiveTab("wishlist")}>
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
                  {addrList && addrList.length > 0 ? (
                    addrList.map((addr,index) => (
                      <div
                        key={`${addr.addrId}-${index}`}
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
                            {addr.isDefault === "Y"
                              ? "기본배송지"
                              : "보조배송지"}
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-2">
                          {/* 기본 설정 버튼 */}
                          <Button size="sm" variant="outline">
                            기본 설정
                          </Button>

                          {/* 수정 버튼 (모달) */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                수정
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>배송지 수정</DialogTitle>
                                <DialogDescription>
                                  기존 배송지 정보를 수정하세요.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium">
                                    배송지 명
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue={addr.addrName}
                                    className="w-full border p-2 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium">
                                    수령인
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue={addr.recipient}
                                    className="w-full border p-2 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium">
                                    우편번호
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue={addr.postalCode}
                                    className="w-full border p-2 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium">
                                    도로명 주소
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue={addr.roadAddr}
                                    className="w-full border p-2 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium">
                                    상세 주소
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue={addr.detailAddr}
                                    className="w-full border p-2 rounded"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium">
                                    수령인 전화번호
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue={addr.recipientPhone}
                                    className="w-full border p-2 rounded"
                                  />
                                </div>

                                {/* 기본 배송지 여부 라디오 버튼 */}
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    기본 배송지 여부
                                  </label>
                                  <div className="flext gap-6">
                                    <label className="flex items-center gap-2">
                                      <input type="radio" name="isDefaualt" value = "Y" checked={addrAdd.isDefault === "Y"} onChange={(e)=> setAddrAdd({...addrAdd, isDefault: e.target.value})}/>
                                      기본 배송지
                                    </label>
                                    <label className ="flex items-center gap-2">
                                      <input type="radio" name="isDefaualt" value = "N" checked={addrAdd.isDefault === "N"} onChange={(e)=> setAddrAdd({...addrAdd, isDefault: e.target.value})}/>
                                      보조 배송지
                                    </label>
                                  </div>
                                </div>
                              </div>
                              {/* 하단 버튼 */}
                              <div className="mt-4 flex justify-end gap-2">
                                <DialogClose asChild>
                                  <Button variant="outline">취소</Button>
                                </DialogClose>
                                <Button onClick={() => {
                                  if(!addrAdd.addrName || !addrAdd.recipient || !addrAdd.postalCode || !addrAdd.roadAddr || !addrAdd.detailAddr || !addrAdd.recipientPhone){ 
                                    alert("모든 항목을 입력해주세요.");
                                    return; 
                                  }
                                  MypageAddrAdd(addrAdd);
                                }}>저장</Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* 삭제 버튼 (모달) */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                삭제
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>배송지 삭제</DialogTitle>
                                <DialogDescription>
                                  정말 이 배송지를 삭제하시겠습니까?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 flex justify-end gap-2">
                                <Button variant="outline">취소</Button>
                                <Button variant="destructive">삭제</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">
                      등록된 배송지가 없습니다.
                    </p>
                  )}
                </div>

                {/* 하단 추가 버튼 (모달) */}
                <div className="mt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">배송지 추가</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>새 배송지 추가</DialogTitle>
                        <DialogDescription>
                          새로운 배송지를 입력해주세요.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="배송지 이름"
                          className="w-full border p-2 rounded"
                        />
                        <input
                          type="text"
                          placeholder="받는 사람"
                          className="w-full border p-2 rounded"
                        />
                        <input
                          type="text"
                          placeholder="연락처"
                          className="w-full border p-2 rounded"
                        />
                        <input
                          type="text"
                          placeholder="도로명 주소"
                          className="w-full border p-2 rounded"
                        />
                        <input
                          type="text"
                          placeholder="상세 주소"
                          className="w-full border p-2 rounded"
                        />
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button variant="outline">취소</Button>
                        </DialogClose>
                        <Button
                          onClick={() => {
                            if (
                              !addrAdd.addrName ||
                              !addrAdd.recipient ||
                              !addrAdd.postalCode ||
                              !addrAdd.roadAddr ||
                              !addrAdd.detailAddr ||
                              !addrAdd.recipientPhone
                            ) {
                              console.log(addrAdd);
                              alert("모든 항목을 입력해주세요.");
                              return;
                            }
                            MypageAddrAdd(addrAdd!);
                          }}
                        >
                          추가
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" className="w-full justify-start"
              onClick={() => setActiveTab("notifications")}>
                <Bell className="mr-2 h-4 w-4"/>
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

        