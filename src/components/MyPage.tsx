import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Heart, Package, Settings, CreditCard, MapPin, Bell } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MyPageProps {
  user: any;
  userRole: 'user' | 'creator' | 'admin';
  onNavigate: (page: string) => void;
}

const mockSupportedProjects = [
  {
    id: '1',
    title: '혁신적인 스마트 홈 IoT 디바이스',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200',
    amount: 80000,
    reward: '스탠다드 패키지',
    status: '진행중',
    date: '2024-02-01',
  },
  {
    id: '2',
    title: '친환경 대나무 패션 액세서리',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200',
    amount: 45000,
    reward: '베이직 세트',
    status: '발송완료',
    date: '2024-01-15',
  },
];

const mockWishlistProjects = [
  {
    id: '3',
    title: '귀여운 동물 캐릭터 굿즈 세트',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200',
    creator: '큐티팩토리',
    daysLeft: 8,
    achievementRate: 140,
  },
];

export function MyPage({ user, userRole, onNavigate }: MyPageProps) {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '홍길동',
    email: user?.email || 'hong@example.com',
    phone: '010-1234-5678',
    bio: '크라우드펀딩을 사랑하는 얼리어답터입니다.',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const handleProfileSave = () => {
    setEditMode(false);
    alert('프로필이 저장되었습니다.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold mb-1">{profile.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{profile.email}</p>
              <Badge variant="secondary">
                {userRole === 'creator' ? '크리에이터' : userRole === 'admin' ? '관리자' : '일반회원'}
              </Badge>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Package className="mr-2 h-4 w-4" />
              후원한 프로젝트
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Heart className="mr-2 h-4 w-4" />
              찜한 프로젝트
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              계정 설정
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              결제 수단
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <MapPin className="mr-2 h-4 w-4" />
              배송지 관리
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              알림 설정
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="supported" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="supported">후원한 프로젝트</TabsTrigger>
              <TabsTrigger value="wishlist">찜한 프로젝트</TabsTrigger>
              <TabsTrigger value="profile">프로필 설정</TabsTrigger>
              <TabsTrigger value="notifications">알림</TabsTrigger>
            </TabsList>

            <TabsContent value="supported" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>후원한 프로젝트 ({mockSupportedProjects.length}개)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSupportedProjects.map((project) => (
                      <div key={project.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <ImageWithFallback
                          src={project.image}
                          alt={project.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{project.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{project.reward}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span>후원금액: {formatCurrency(project.amount)}원</span>
                            <Badge
                              variant={project.status === '진행중' ? 'default' : 'secondary'}
                            >
                              {project.status}
                            </Badge>
                            <span className="text-gray-500">{project.date}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate(project.id)}
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
                  <CardTitle>찜한 프로젝트 ({mockWishlistProjects.length}개)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockWishlistProjects.map((project) => (
                      <div key={project.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <ImageWithFallback
                          src={project.image}
                          alt={project.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{project.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">by {project.creator}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span>달성률: {project.achievementRate}%</span>
                            <span className="text-gray-500">{project.daysLeft}일 남음</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate(project.id)}
                          >
                            상세보기
                          </Button>
                          <Button size="sm">
                            후원하기
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>프로필 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" />
                      <AvatarFallback>{profile.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        프로필 사진 변경
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG 파일을 업로드하세요. (최대 5MB)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">휴대폰 번호</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">자기소개</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!editMode}
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2">
                    {editMode ? (
                      <>
                        <Button onClick={handleProfileSave}>저장</Button>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                          취소
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditMode(true)}>편집</Button>
                    )}
                  </div>
                </CardContent>
              </Card>

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
                        <p className="text-sm text-gray-500">후원한 프로젝트의 새소식 알림</p>
                      </div>
                      <Button variant="outline" size="sm">
                        설정
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">마케팅 알림</h4>
                        <p className="text-sm text-gray-500">새로운 프로젝트 및 이벤트 소식</p>
                      </div>
                      <Button variant="outline" size="sm">
                        설정
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">시스템 알림</h4>
                        <p className="text-sm text-gray-500">결제, 배송 등 중요한 알림</p>
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