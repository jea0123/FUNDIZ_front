import { useEffect, useState } from 'react';
import { Heart, Share2, Calendar, Users, MessageCircle, Star } from 'lucide-react';
import type { ProjectDetail } from '@/types/projects';
import { endpoints, getData } from '@/api/apis';
import { useParams } from 'react-router-dom';
import type { Community } from '@/types/community';
import { formatDate, getDaysLeft } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Progress } from '@/components/ui/progress';

export function ProjectDetailPage() {
    const { projectId } = useParams();

    const [project, setProject] = useState<ProjectDetail>();
    const [selectedReward, setSelectedReward] = useState<number | null>(null);
    const [community, setCommunity] = useState<Community[]>([]);
    const [review, setReview] = useState<Community[]>([]);
    const [isLiked, setIsLiked] = useState(false);
    
    const [loadingProject, setLoadingProject] = useState(false);
    const [loadingCommunity, setLoadingCommunity] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);

    const projectData = async () => {
        setLoadingProject(true);
        const response = await getData(endpoints.getProjectDetail(Number(projectId)));
        if (response.status === 200) {
            setProject(response.data);
        }
    };
    const communityData = async () => {
        setLoadingCommunity(true);
        const response = await getData(endpoints.getCommunity(Number(projectId)));
        if (response.status === 200) {
            setCommunity(response.data);
        }
    };
    const reviewData = async () => {
        setLoadingReview(true);
        const response = await getData(endpoints.getReview(Number(projectId)));
        if (response.status === 200) {
            setReview(response.data);
        }
    };

    useEffect(() => {
        projectData().finally(() => setLoadingProject(false));
        communityData().finally(() => setLoadingCommunity(false));
        reviewData().finally(() => setLoadingReview(false));
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

    if (!projectId || !project || loadingProject || loadingCommunity || loadingReview) {
        return (
            <p>불러오는 중…</p>
        )
    }

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
                                <span className="ml-1">{project.likeCnt}</span>
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleShare}>
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary">{project.ctgrName}</Badge>
                            <Badge variant="secondary">{project.subctgrName}</Badge>
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

                        <TabsContent value="updates">
                            {project.newsList.length == 0 ? (
                                <div className="text-sm text-muted-foreground">게시글이 존재하지 않습니다.</div>
                            ) : (
                                <>
                                    {project.newsList.map((news) => (
                                        <div className="space-y-4 mt-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">{news.content}</CardTitle>
                                                    <p className="text-sm text-gray-500">{formatDate(news.createdAt)}</p>
                                                </CardHeader>
                                                <CardContent>
                                                    <p>{news.content}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </>)}
                        </TabsContent>

                        <TabsContent value="community">
                            {community.length == 0 ? (
                                <div className="text-sm text-muted-foreground">게시글이 존재하지 않습니다.</div>
                            ) : (<>
                                {community.map((cm) => (
                                    <div className="space-y-4 mt-6">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-start space-x-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarFallback>{cm.profileImg}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className="font-medium">{cm.nickname}</span>
                                                            <span className="text-sm text-gray-500">{getDaysLeft(cm.createdAt)} 전</span>
                                                        </div>
                                                        <p className="text-sm">{cm.cmContent}</p>
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
                                ))}
                            </>)}
                        </TabsContent>

                        <TabsContent value="reviews">
                            {review.length == 0 ? (
                                <div className="text-sm text-muted-foreground">게시글이 존재하지 않습니다.</div>
                            ) : (<>
                                {review.map((rv) => (
                                    <div className="space-y-4 mt-6">
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
                                                            <span className="text-sm text-gray-500">{getDaysLeft(rv.createdAt)} 전</span>
                                                        </div>
                                                        <p className="text-sm">{rv.cmContent}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </>)}
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
                                                <span className="font-semibold">{getDaysLeft(project.endDate)}</span>
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