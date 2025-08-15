import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, Share2, Calendar, Users, Target, MapPin, MessageCircle, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProjectDetailProps {
  projectId: string | null;
  onNavigate: (page: string) => void;
}

const mockProject = {
  id: '1',
  title: '혁신적인 스마트 홈 IoT 디바이스',
  description: '집안의 모든 기기를 하나로 연결하는 스마트 허브로, 음성 인식과 AI 기술을 활용하여 더 스마트한 생활을 제공합니다.',
  fullDescription: `
    <h2>프로젝트 소개</h2>
    <p>이 프로젝트는 가정의 모든 IoT 기기를 하나로 연결하는 혁신적인 스마트 허브입니다.</p>
    
    <h3>주요 기능</h3>
    <ul>
      <li>음성 인식을 통한 기기 제어</li>
      <li>스마트폰 앱을 통한 원격 제어</li>
      <li>에너지 사용량 모니터링</li>
      <li>보안 시스템 연동</li>
    </ul>

    <h3>기술 사양</h3>
    <p>Wi-Fi 6, Bluetooth 5.0, Zigbee 3.0 지원으로 다양한 기기와 호환됩니다.</p>
  `,
  category: '테크/가전',
  image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
  creator: {
    name: '테크노베이션',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    followers: 1234,
    projects: 3,
  },
  targetAmount: 10000000,
  currentAmount: 7500000,
  backers: 234,
  daysLeft: 15,
  likes: 142,
  tags: ['IoT', '스마트홈', '혁신기술'],
  startDate: '2024-01-15',
  endDate: '2024-03-15',
  paymentDate: '2024-03-16',
  deliveryDate: '2024-06-01',
  rewards: [
    {
      id: 1,
      amount: 50000,
      title: '얼리버드 특가',
      description: '스마트 허브 1개 + 전용 앱',
      backers: 89,
      limited: 100,
      estimated_delivery: '2024-06-01',
    },
    {
      id: 2,
      amount: 80000,
      title: '스탠다드 패키지',
      description: '스마트 허브 1개 + 센서 3개 + 전용 앱',
      backers: 112,
      limited: null,
      estimated_delivery: '2024-06-01',
    },
    {
      id: 3,
      amount: 150000,
      title: '프리미엄 패키지',
      description: '스마트 허브 2개 + 센서 10개 + 프리미엄 앱 + 설치 서비스',
      backers: 33,
      limited: 50,
      estimated_delivery: '2024-06-15',
    },
  ],
};

export function ProjectDetail(props: ProjectDetailProps) {
  const [selectedReward, setSelectedReward] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const calculateAchievementRate = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  const handleSupport = (rewardId: number) => {
    setSelectedReward(rewardId);
    alert('후원하기 페이지로 이동합니다.');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative mb-6">
            <ImageWithFallback
              src={mockProject.image}
              alt={mockProject.title}
              className="w-full h-96 object-cover rounded-lg"
            />
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="ml-1">{mockProject.likes}</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">{mockProject.category}</Badge>
              {mockProject.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl mb-3">{mockProject.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{mockProject.description}</p>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Avatar>
                <AvatarImage src={mockProject.creator.avatar} />
                <AvatarFallback>{mockProject.creator.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold">{mockProject.creator.name}</h4>
                <p className="text-sm text-gray-600">
                  팔로워 {formatCurrency(mockProject.creator.followers)}명 ·
                  프로젝트 {mockProject.creator.projects}개
                </p>
              </div>
              <Button variant="outline" size="sm">
                팔로우
              </Button>
            </div>
          </div>

          <Tabs defaultValue="description" className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">프로젝트 소개</TabsTrigger>
              <TabsTrigger value="updates">새소식</TabsTrigger>
              <TabsTrigger value="community">커뮤니티</TabsTrigger>
              <TabsTrigger value="reviews">후기</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: mockProject.fullDescription }}
              />
            </TabsContent>

            <TabsContent value="updates" className="mt-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">프로젝트 진행 현황 업데이트</CardTitle>
                    <p className="text-sm text-gray-500">2024년 2월 15일</p>
                  </CardHeader>
                  <CardContent>
                    <p>현재 목표 금액의 75%를 달성했습니다. 많은 후원에 감사드립니다!</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>김</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">김후원</span>
                          <span className="text-sm text-gray-500">2일 전</span>
                        </div>
                        <p className="text-sm">정말 기대되는 프로젝트네요! 응원합니다.</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button variant="ghost" size="sm">
                            <Heart className="h-3 w-3 mr-1" />
                            3
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            답글
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>이</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">이사용자</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">1주 전</span>
                        </div>
                        <p className="text-sm">제품 품질이 매우 우수하고 배송도 빨랐습니다.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {calculateAchievementRate(mockProject.currentAmount, mockProject.targetAmount)}%
                      </span>
                      <span className="text-sm text-gray-500">달성</span>
                    </div>
                    <Progress value={calculateAchievementRate(mockProject.currentAmount, mockProject.targetAmount)} className="h-3 mb-3" />
                    <div className="text-xl font-bold">
                      {formatCurrency(mockProject.currentAmount)}원
                    </div>
                    <div className="text-sm text-gray-500">
                      목표 {formatCurrency(mockProject.targetAmount)}원
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="font-semibold">{mockProject.backers}</span>
                      </div>
                      <div className="text-xs text-gray-500">후원자</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="font-semibold">{mockProject.daysLeft}</span>
                      </div>
                      <div className="text-xs text-gray-500">일 남음</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">펀딩 기간</span>
                      <span>{mockProject.startDate} ~ {mockProject.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">결제일</span>
                      <span>{mockProject.paymentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">예상 발송</span>
                      <span>{mockProject.deliveryDate}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">리워드 선택</h3>
              {mockProject.rewards.map((reward) => (
                <Card
                  key={reward.id}
                  className={`cursor-pointer transition-colors ${selectedReward === reward.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  onClick={() => setSelectedReward(reward.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-lg font-semibold">
                        {formatCurrency(reward.amount)}원
                      </span>
                      {reward.limited && (
                        <Badge variant="secondary" className="text-xs">
                          한정 {reward.limited}개
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium mb-2">{reward.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{reward.backers}명 후원</span>
                      <span className="text-gray-500">예상 발송: {reward.estimated_delivery}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                className="w-full"
                size="lg"
                onClick={() => selectedReward && handleSupport(selectedReward)}
                disabled={!selectedReward}
              >
                {selectedReward ? '이 리워드로 후원하기' : '리워드를 선택하세요'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}