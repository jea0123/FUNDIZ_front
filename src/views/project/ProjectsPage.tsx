import { useState } from 'react';
import { Heart, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const categories = [
    { id: 'all', name: '전체' },
    { id: 'tech', name: '테크/가전/리빙' },
    { id: 'fashion', name: '패션/뷰티' },
    { id: 'character', name: '캐릭터/굿즈/디자인' },
];

const sortOptions = [
    { id: 'likes', name: '좋아요순' },
    { id: 'latest', name: '최신순' },
    { id: 'amount', name: '모집금액순' },
    { id: 'deadline', name: '마감임박순' },
    { id: 'achievement', name: '달성률순' },
];

const mockProjects = [
    {
        id: '1',
        title: '혁신적인 스마트 홈 IoT 디바이스',
        description: '집안의 모든 기기를 하나로 연결하는 스마트 허브',
        category: 'tech',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
        creator: '테크노베이션',
        targetAmount: 10000000,
        currentAmount: 7500000,
        backers: 234,
        daysLeft: 15,
        likes: 142,
        tags: ['IoT', '스마트홈', '혁신기술'],
    },
    {
        id: '2',
        title: '친환경 대나무 패션 액세서리',
        description: '지속가능한 대나무 소재로 만든 프리미엄 액세서리',
        category: 'fashion',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
        creator: '에코스타일',
        targetAmount: 5000000,
        currentAmount: 3200000,
        backers: 89,
        daysLeft: 28,
        likes: 76,
        tags: ['친환경', '패션', '대나무'],
    },
    {
        id: '3',
        title: '귀여운 동물 캐릭터 굿즈 세트',
        description: '사랑스러운 동물 친구들과 함께하는 일상용품',
        category: 'character',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
        creator: '큐티팩토리',
        targetAmount: 3000000,
        currentAmount: 4200000,
        backers: 167,
        daysLeft: 8,
        likes: 203,
        tags: ['캐릭터', '굿즈', '동물'],
    },
    {
        id: '4',
        title: '혁신적인 무선 충전 스탠드',
        description: '빠르고 안전한 무선 충전 기술의 새로운 표준',
        category: 'tech',
        image: 'https://images.unsplash.com/photo-1609592918894-1cbbd04d2c5b?w=400',
        creator: '차지텍',
        targetAmount: 8000000,
        currentAmount: 9600000,
        backers: 312,
        daysLeft: 22,
        likes: 188,
        tags: ['무선충전', '스마트폰', '기술'],
    },
];

export function ProjectsPage(
    // { onNavigate }: MainPageProps
) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSort, setSelectedSort] = useState('latest');
    const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
    const navigate = useNavigate();
    const filteredProjects = mockProjects.filter(
        project => selectedCategory === 'all' || project.category === selectedCategory
    );

    const toggleLike = (projectId: string) => {
        const newLikedProjects = new Set(likedProjects);
        if (newLikedProjects.has(projectId)) {
            newLikedProjects.delete(projectId);
        } else {
            newLikedProjects.add(projectId);
        }
        setLikedProjects(newLikedProjects);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount);
    };

    const calculateAchievementRate = (current: number, target: number) => {
        return Math.round((current / target) * 100);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category.id)}
                    >
                        {category.name}
                    </Button>
                ))}
            </div>

            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                    총 {filteredProjects.length}개의 프로젝트
                </p>
                <div className="flex gap-2">
                    {sortOptions.map((option) => (
                        <Button
                            key={option.id}
                            variant={selectedSort === option.id ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedSort(option.id)}
                        >
                            {option.name}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                    <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                            <ImageWithFallback
                                src={project.image}
                                alt={project.title}
                                className="w-full h-48 object-cover cursor-pointer"
                                onClick={() => navigate(`/project/${project.id}`)}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`absolute top-2 right-2 ${likedProjects.has(project.id) ? 'text-red-500' : 'text-white'
                                    } hover:text-red-500`}
                                onClick={() => toggleLike(project.id)}
                            >
                                <Heart className={`h-4 w-4 ${likedProjects.has(project.id) ? 'fill-current' : ''}`} />
                            </Button>
                        </div>

                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-1 mb-2">
                                {project.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            <h3
                                className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                                onClick={() => navigate(`/project/${project.id}`)}
                            >
                                {project.title}
                            </h3>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {project.description}
                            </p>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">달성률</span>
                                    <span className="font-semibold text-blue-600">
                                        {calculateAchievementRate(project.currentAmount, project.targetAmount)}%
                                    </span>
                                </div>

                                <Progress
                                    value={calculateAchievementRate(project.currentAmount, project.targetAmount)}
                                    className="h-2"
                                />

                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold">
                                        {formatCurrency(project.currentAmount)}원
                                    </span>
                                    <span className="text-gray-500">
                                        목표 {formatCurrency(project.targetAmount)}원
                                    </span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-4 pt-0">
                            <div className="w-full flex justify-between items-center text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{project.backers}명</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{project.daysLeft}일 남음</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    <span>{project.likes}</span>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                    더 많은 프로젝트 보기
                </Button>
            </div>
        </div>
    );
}