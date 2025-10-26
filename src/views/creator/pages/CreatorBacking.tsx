import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { getData, endpoints } from '@/api/apis';
import type { BackingCreatorProjectList } from '@/types/backing';
import FundingLoader from '@/components/FundingLoader';
import { useCookies } from 'react-cookie';

// 공통 페이지네이션 함수
const paginate = <T,>(arr: T[], page: number, perPage: number): T[] => {
  const start = (page - 1) * perPage;
  return arr.slice(start, start + perPage);
};

export default function CreatorBacking() {
  const [cookie] = useCookies();
  const [projects, setProjects] = useState<BackingCreatorProjectList[]>([]);
  const [loading, setLoading] = useState(false);

  // 페이지네이션
  const [page, setPage] = useState(1);
  const itemsPerPage = 3; // 한 페이지에서 보여줄 프로젝트 개수

  //상태
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectSortOrder, setProjectSortOrder] = useState('latest');
  const [backingSortOrders, setBackingSortOrders] = useState<Record<number, string>>({});
  const [backingSearch, setBackingSearch] = useState<Record<number, string>>({});
  const [backingPage, setBackingPage] = useState<Record<number, number>>({});
  const fetched = useRef(false);

  // 데이터 불러오기
  useEffect(() => {
    if (fetched.current || loading) return;
    fetched.current = true;

    (async () => {
      try {
        setLoading(true);
        const res = await getData(endpoints.creatorBackingList, cookie.accessToken);
        if (res.status === 200 && Array.isArray(res.data)) setProjects(res.data);
        else setProjects([]);
      } catch (err) {
        console.error('후원 내역 불러오기 실패:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [loading, fetched]);

  // 프로젝트 검색/정렬
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (projectSortOrder === 'latest') filtered = [...filtered].reverse();
    if (projectSortOrder === 'highAmount') filtered = [...filtered].sort((a, b) => b.currAmount - a.currAmount);
    if (projectSortOrder === 'lowAmount') filtered = [...filtered].sort((a, b) => a.currAmount - b.currAmount);
    return filtered;
  }, [projects, searchTerm, projectSortOrder]);

  const paginatedProjects = paginate(filteredProjects, page, itemsPerPage);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleBackingSortChange = (projectId: number, value: string) => setBackingSortOrders((prev) => ({ ...prev, [projectId]: value }));

  const handleBackingSearch = (projectId: number, value: string) => {
    setBackingSearch((prev) => ({ ...prev, [projectId]: value }));
    setBackingPage((prev) => ({ ...prev, [projectId]: 1 }));
  };

  const handleBackingPageChange = (projectId: number, newPage: number) => setBackingPage((prev) => ({ ...prev, [projectId]: newPage }));

  const toggleProject = (id: number) => setSelectedProjectId(selectedProjectId === id ? null : id);

  // 프로젝트 페이지 이동
  const handleProjectPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <FundingLoader />
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-2">후원 내역</h2>

          {/* 검색 & 정렬 */}
          <div className="flex flex-wrap gap-2 items-center">
            <Input placeholder="프로젝트명 검색" value={searchTerm} onChange={handleSearch} className="w-[220px]" />

            <Select value={projectSortOrder} onValueChange={setProjectSortOrder}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="highAmount">금액 높은순</SelectItem>
                <SelectItem value="lowAmount">금액 낮은순</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 프로젝트 카드 */}
          {paginatedProjects.map((project) => {
            const realPercent = (project.currAmount / project.goalAmount) * 100;
            const barPercent = Math.min(realPercent, 100);
            const projectId = project.projectId;
            const backers = project.backerList ?? [];

            const sortType = backingSortOrders[projectId] || 'latest';
            const searchKeyword = (backingSearch[projectId] || '').toLowerCase();
            const currentPage = backingPage[projectId] || 1;
            const itemsPerPageBacking = 10;

            let filteredBacking = backers.filter((b) => b.nickname.toLowerCase().includes(searchKeyword));
            if (sortType === 'highAmount') filteredBacking.sort((a, b) => b.amount - a.amount);
            if (sortType === 'lowAmount') filteredBacking.sort((a, b) => a.amount - b.amount);
            if (sortType === 'oldest') filteredBacking.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            if (sortType === 'latest') filteredBacking.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const totalBackingPages = Math.ceil(filteredBacking.length / itemsPerPageBacking);
            const paginatedBacking = paginate(filteredBacking, currentPage, itemsPerPageBacking);

            return (
              <Card key={projectId} className="p-5 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* 🔹 썸네일 */}
                  <div className="flex-shrink-0 w-full sm:w-40 aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                  </div>

                  {/* 🔹 프로젝트 정보 */}
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.currAmount.toLocaleString()}원 / {project.goalAmount.toLocaleString()}원
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        총 <span className="font-semibold">{project.backerCnt ?? backers.length}</span>명 후원
                      </p>

                      {/* 진행률 바 */}
                      <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${realPercent >= 100 ? 'bg-green-500' : realPercent >= 70 ? 'bg-emerald-400' : realPercent >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${barPercent}%` }} />
                      </div>

                      {/* 달성률 숫자 */}
                      <p className={`text-xs mt-1 font-medium ${realPercent >= 100 ? 'text-green-600' : realPercent >= 70 ? 'text-emerald-500' : realPercent >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{realPercent.toFixed(2)}% 달성</p>
                    </div>

                    {/* 🔹 버튼 */}
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProject(projectId);
                        }}
                      >
                        {selectedProjectId === projectId ? '닫기' : '후원자 보기'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 후원자 리스트 */}
                {selectedProjectId === projectId && (
                  <CardContent className="mt-4 border-t pt-4 space-y-3">
                    <div className="flex flex-wrap gap-2 items-center">
                      <Input placeholder="후원자 닉네임 검색" value={backingSearch[projectId] || ''} onChange={(e) => handleBackingSearch(projectId, e.target.value)} className="w-[200px]" />
                      <Select value={sortType} onValueChange={(v) => handleBackingSortChange(projectId, v)}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="정렬 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest">최신순</SelectItem>
                          <SelectItem value="oldest">오래된순</SelectItem>
                          <SelectItem value="highAmount">금액 높은순</SelectItem>
                          <SelectItem value="lowAmount">금액 낮은순</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="p-2">후원자 닉네임</th>
                          <th className="p-2">후원 금액</th>
                          <th className="p-2">후원 날짜</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBacking.map((b, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-2">{b.nickname}</td>
                            <td className="p-2">{b.amount.toLocaleString()}원</td>
                            <td className="p-2">{new Date(b.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* 후원자 페이지네이션 */}
                    {totalBackingPages > 0 && (
                      <div className="flex justify-center mt-3 gap-2">
                        <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => handleBackingPageChange(projectId, currentPage - 1)}>
                          이전
                        </Button>
                        {Array.from({ length: totalBackingPages }, (_, i) => i + 1).map((n) => (
                          <Button key={n} size="sm" variant={currentPage === n ? 'default' : 'outline'} onClick={() => handleBackingPageChange(projectId, n)}>
                            {n}
                          </Button>
                        ))}
                        <Button size="sm" variant="outline" disabled={currentPage === totalBackingPages} onClick={() => handleBackingPageChange(projectId, currentPage + 1)}>
                          다음
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}

          {/* 프로젝트 페이지네이션 */}
          {totalPages > 0 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => handleProjectPageChange(page - 1)}>
                이전
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Button key={n} size="sm" variant={page === n ? 'default' : 'outline'} onClick={() => setPage(n)}>
                  {n}
                </Button>
              ))}

              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => handleProjectPageChange(page + 1)}>
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
