import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, Share2, Calendar, Users, MessageCircle, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { ProjectDetail } from '@/types/projects';
import { endpoints, getData } from '@/api/apis';
import { useParams } from 'react-router-dom';
import type { Community } from '@/types/community';
import { formatDate } from '@/utils/utils';

/*
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
*/

export function ProjectDetailPage() {
    const { projectId } = useParams();
    const [selectedReward, setSelectedReward] = useState<number | null>(null);
    const [isLiked, setIsLiked] = useState(false);

    const [project, setProject] = useState<ProjectDetail>();
    const [community, setCommunity] = useState<Community[]>([]);
    const [review, setReview] = useState<Community[]>([]);

    useEffect(() => {
        const projectData = async () => {
            const response = await getData(endpoints.getProjectDetail(Number(projectId)));
            if (response.status === 200) {
                setProject(response.data);
            }
        };
        const communityData = async () => {
            const response = await getData(endpoints.getCommunity(Number(projectId)));
            if (response.status === 200) {
                setCommunity(response.data);
            }
        };
        const reviewData = async () => {
            const response = await getData(endpoints.getReview(Number(projectId)));
            if (response.status === 200) {
                setReview(response.data);
            }
        };
        projectData();
        communityData();
        reviewData();
    }, []);



    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount);
    };

    const handleSupport = (rewardId: number) => {
        setSelectedReward(rewardId);
        alert('후원하기 페이지로 이동합니다.');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다.');
    };

    if (!projectId || !project) {
        return (
            <p>프로젝트가 없습니다.</p>
        )
    }

    console.log(project);
    

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="relative mb-6">
                        <ImageWithFallback
                            src={project.thumbnail}
                            alt={project.title}
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
                                {/* //TODO: 좋아요수 */}
                                {/* <span className="ml-1">{project.likeCnt}</span> */}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleShare}>
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary">{project.subcategory.ctgrName}</Badge>
                            {project.tagList.map((tag) => (
                                <Badge key={tag.tagId} variant="outline">
                                    {tag.tagName}
                                </Badge>
                            ))}
                        </div>
                        <h1 className="text-3xl mb-3">{project.title}</h1>

                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <Avatar>
                                <AvatarImage src={project.profileImg} />
                                <AvatarFallback>{project.creatorName}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h4 className="font-semibold">{project.creatorName}</h4>
                                <p className="text-sm text-gray-600">
                                    팔로워 {formatCurrency(project.followerCnt)}명 ·
                                    프로젝트 {project.projectCnt}개
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                팔로우
                            </Button>
                            <Button variant="outline" size="sm">
                                문의하기
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
                                dangerouslySetInnerHTML={{ __html: project.content }}
                            />
                        </TabsContent>

                        {project.newsList.map((news) => (
                            <TabsContent value="updates" className="mt-6">
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{news.content}</CardTitle>
                                            <p className="text-sm text-gray-500">{(news.createdAt).toLocaleString()}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <p>{news.content}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        ))}

                        {community.map((cm) => (
                        <TabsContent value="community" className="mt-6">
                            <div className="space-y-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start space-x-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback>{cm.profileImg}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium">{cm.nickname}</span>
                                                    {/* //TODO: 현재 기준으로 며칠전 /utils 파일 */}
                                                    {/* <span className="text-sm text-gray-500">2일 전</span> */}
                                                </div>
                                                <p className="text-sm">{cm.content}</p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Button variant="ghost" size="sm">
                                                        <MessageCircle className="h-3 w-3 mr-1" />
                                                        댓글
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        ))}

                        {review.map((rv) => (
                        <TabsContent value="reviews" className="mt-6">
                            <div className="space-y-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start space-x-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback>{rv.nickname}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium"></span>
                                                    <div className="flex items-center">
                                                        {[...Array(rv.rating)].map((_, i) => (
                                                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                    </div>
                                                    {/* //TODO: 현재 기준으로 며칠전 /utils 파일 */}
                                                    {/* <span className="text-sm text-gray-500">1주 전</span> */}
                                                </div>
                                                <p className="text-sm">{rv.content}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        ))}
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
                                                {project.percentNow}%
                                            </span>
                                            <span className="text-sm text-gray-500">달성</span>
                                        </div>
                                        <Progress value={project.percentNow} className="h-3 mb-3" />
                                        <div className="text-xl font-bold">
                                            {formatCurrency(project.currAmount)}원
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            목표 {formatCurrency(project.goalAmount)}원
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center mb-1">
                                                <Users className="h-4 w-4 mr-1" />
                                                <span className="font-semibold">{project.backerCnt}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">후원자</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center mb-1">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {/* //TODO: 프로젝트 종료일까지 남은 일수 /utils 파일 */}
                                                {/* <span className="font-semibold">{mockProject.daysLeft}</span> */}
                                            </div>
                                            <div className="text-xs text-gray-500">일 남음</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">펀딩 기간</span>
                                            <span>{formatDate(project.startDate)} ~ {formatDate(project.endDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">결제일</span>
                                            <span>{formatDate(project.paymentDate)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">리워드 선택</h3>
                            {project.rewardList.map((reward) => (
                                <Card
                                    key={reward.rewardId}
                                    className={`cursor-pointer transition-colors ${selectedReward === reward.rewardId ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    onClick={() => setSelectedReward(reward.rewardId)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-lg font-semibold">
                                                {formatCurrency(reward.price)}원
                                            </span>
                                            {reward.rewardCnt && (
                                                <Badge variant="secondary" className="text-xs">
                                                    한정 {reward.rewardCnt}개
                                                </Badge>
                                            )}
                                        </div>
                                        <h4 className="font-medium mb-2">{reward.rewardName}</h4>
                                        <p className="text-sm text-gray-600 mb-3">{reward.rewardContent}</p>
                                        <div className="flex justify-between items-center text-sm">
                                            {/* //TODo: 리워드당 후원자수 */}
                                            {/* <span className="text-gray-500">{reward.backers}명 후원</span> */}
                                            <span className="text-gray-500">예상 발송: {formatDate(reward.deliveryDate)}</span>
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
                                {selectedReward ? '후원하기' : '리워드를 선택하세요'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}