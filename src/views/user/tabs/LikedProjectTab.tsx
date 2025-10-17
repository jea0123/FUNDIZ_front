import { endpoints, getData } from '@/api/apis';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LikedDetail } from '@/types/liked';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tempUserId = 1;

export default function LikedProjectTab() {
    const navigate = useNavigate();
    const [likedProjects, setLikedProjects] = useState<LikedDetail[]>();

    const [likedPage, setLikedPage] = useState(1);
    const itemsPerPage = 5; // 한 페이지당 보여줄 항목 수

    const [likedSearch, setLikedSearch] = useState('');

    const MypageLikedList = async () => {
        const response = await getData(endpoints.getLikedList(tempUserId));
        console.log('찜 목록 응답:', response);
        if (response.status === 200) {
            setLikedProjects(response.data);
        }
    };

    useEffect(() => {
        MypageLikedList();
    }, []);

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <CardTitle>찜한 프로젝트 ({likedProjects?.length}개)</CardTitle>
                <input
                    type="text"
                    placeholder="프로젝트 또는 창작자 검색"
                    className="border rounded px-3 py-1 text-sm w-48"
                    value={likedSearch}
                    onChange={(e) => {
                        setLikedSearch(e.target.value);
                        setLikedPage(1); // 검색 시 1페이지로 이동
                    }}
                />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {likedProjects
                        ?.filter((l) => l.title.toLowerCase().includes(likedSearch.toLowerCase()) || l.creatorName.toLowerCase().includes(likedSearch.toLowerCase()))
                        .slice((likedPage - 1) * itemsPerPage, likedPage * itemsPerPage)
                        .map((likedList) => (
                            <div key={likedList.projectId} className="flex items-center space-x-4 p-4 border rounded-lg">
                                <ImageWithFallback src={likedList.thumbnail} alt={likedList.title} className="w-16 h-16 object-cover rounded" />
                                <div className="flex-1">
                                    <h4 className="font-medium mb-1">{likedList.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">by {likedList.creatorName}</p>
                                    <div className="flex items-center space-x-4 text-sm">
                                        <span>달성률: {((likedList.currAmount / likedList.goalAmount) * 100).toFixed(2)}%</span>
                                        <span className="text-gray-500">{3}일 남음</span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/project/${likedList.userId}`)}>
                                        해당 프로젝트로
                                    </Button>
                                </div>
                            </div>
                        ))}
                </div>
                {/* 페이지네이션 */}
                {likedProjects && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <Button size="sm" variant="outline" disabled={likedPage === 1} onClick={() => setLikedPage(likedPage - 1)}>
                            이전
                        </Button>

                        {Array.from({
                            length: Math.max(1, Math.ceil(likedProjects.length / itemsPerPage)),
                        }).map((_, idx) => (
                            <Button key={idx} size="sm" variant={likedPage === idx + 1 ? 'default' : 'outline'} onClick={() => setLikedPage(idx + 1)}>
                                {idx + 1}
                            </Button>
                        ))}

                        <Button size="sm" variant="outline" disabled={likedPage === Math.max(1, Math.ceil(likedProjects.length / itemsPerPage))} onClick={() => setLikedPage(likedPage + 1)}>
                            다음
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
