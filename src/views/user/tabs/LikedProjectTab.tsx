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
  const [likedProjects, setLikedProjects] = useState<LikedDetail[]>([]);
  const [likedPage, setLikedPage] = useState(1);
  const [sortOption, setSortOption] = useState<string>('RECENT');

  const itemsPerPage = 5; // 한 페이지당 항목 수
  const pagesPerGroup = 10; // 페이지 버튼 10개씩 보여주기

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

  // 전체 페이지 수 계산
  const totalPages = Math.max(1, Math.ceil(likedProjects.length / itemsPerPage));

  // 현재 페이지 그룹 계산
  const currentGroup = Math.ceil(likedPage / pagesPerGroup);
  const startPage = (currentGroup - 1) * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center flex-wrap gap-2 text-2xl">
        <CardTitle className="flex items-center">찜한 프로젝트 ({likedProjects?.length}개)</CardTitle>

        <div className="flex items-center gap-2">
          {/* 정렬 옵션 */}
          <select className="border rounded px-2 py-1 text-sm" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="RECENT">최신순</option>
            <option value="OLD">오래된순</option>
            <option value="HIGH_RATE">달성률 높은순</option>
            <option value="LOW_RATE">달성률 낮은순</option>
            <option value="HIGH_AMOUNT">금액 높은순</option>
            <option value="LOW_AMOUNT">금액 낮은순</option>
          </select>

          {/* 검색창 */}
          <input
            type="text"
            placeholder="프로젝트 또는 창작자 검색"
            className="border rounded px-3 py-1 text-sm w-48"
            value={likedSearch}
            onChange={(e) => {
              setLikedSearch(e.target.value);
              setLikedPage(1);
            }}
          />
        </div>
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
                  <Button variant="outline" size="sm" onClick={() => navigate(`/project/${likedList.projectId}`)}>
                    해당 프로젝트로
                  </Button>
                </div>
              </div>
            ))}
        </div>

        {/* 페이지네이션 */}
        {likedProjects && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            {/* 이전 그룹 */}
            <Button size="sm" variant="outline" disabled={startPage === 1} onClick={() => setLikedPage(startPage - 1)}>
              이전
            </Button>

            {/* 현재 그룹의 페이지 번호 */}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
              <Button key={pageNum} size="sm" variant={likedPage === pageNum ? 'default' : 'outline'} onClick={() => setLikedPage(pageNum)}>
                {pageNum}
              </Button>
            ))}

            {/* 다음 그룹 */}
            <Button size="sm" variant="outline" disabled={endPage >= totalPages} onClick={() => setLikedPage(endPage + 1)}>
              다음
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
