import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

interface Project {
  id: number;
  title: string;
  goalAmount: number;
  currAmount: number;
  thumbnail: string;
}

interface Backing {
  userId: string;
  amount: number;
  date: string;
}

// 페이지네이션 유틸
function paginate<T>(array: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return array.slice(start, start + perPage);
}

export default function CreatorBacking() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  // 🔍 검색/정렬 상태 (프로젝트용)
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'project' | 'user'>('project');
  const [projectSortOrder, setProjectSortOrder] = useState('latest');
  const [page, setPage] = useState(1);

  // 🔽 내부 후원자 상태
  const [backingSortOrders, setBackingSortOrders] = useState<
    Record<number, string>
  >({});
  const [backingSearch, setBackingSearch] = useState<Record<number, string>>(
    {}
  );
  const [backingPage, setBackingPage] = useState<Record<number, number>>({});

  // ✅ 하드코딩된 프로젝트 데이터 (thumbnail 추가)
  const projectList: Project[] = [
    {
      id: 1,
      title: '지구를 지키는 텀블러',
      goalAmount: 1000000,
      currAmount: 650000,
      thumbnail: 'https://images.unsplash.com/photo-1616628188186-9ef2e1e69a4d',
    },
    {
      id: 2,
      title: '고양이 포스터 아트북',
      goalAmount: 500000,
      currAmount: 530000,
      thumbnail: 'https://images.unsplash.com/photo-1601758123927-194f605b2b8b',
    },
    {
      id: 3,
      title: '친환경 비누 세트',
      goalAmount: 800000,
      currAmount: 200000,
      thumbnail: 'https://images.unsplash.com/photo-1606813903260-53982c31a720',
    },
    {
      id: 4,
      title: '플라스틱 제로 키트',
      goalAmount: 400000,
      currAmount: 390000,
      thumbnail: 'https://images.unsplash.com/photo-1616627453754-53c43f6ff9c8',
    },
  ];

  const backingData: Record<number, Backing[]> = {
    1: [
      { userId: 'user01', amount: 30000, date: '2025-09-10' },
      { userId: 'user02', amount: 50000, date: '2025-09-12' },
      { userId: 'user03', amount: 20000, date: '2025-09-18' },
    ],
    2: [
      { userId: 'mimi', amount: 15000, date: '2025-09-22' },
      { userId: 'dong', amount: 20000, date: '2025-09-25' },
    ],
    3: [
      { userId: 'hana', amount: 10000, date: '2025-09-15' },
      { userId: 'lee', amount: 5000, date: '2025-09-20' },
    ],
    4: [
      { userId: 'jin', amount: 70000, date: '2025-09-10' },
      { userId: 'woo', amount: 80000, date: '2025-09-15' },
      { userId: 'kim', amount: 20000, date: '2025-09-17' },
      { userId: 'park', amount: 15000, date: '2025-09-18' },
    ],
  };

  // 🔍 프로젝트 리스트 필터/정렬
  const filteredProjects = useMemo(() => {
    let filtered = projectList.filter((p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (projectSortOrder === 'latest') filtered = [...filtered].reverse();
    if (projectSortOrder === 'highAmount')
      filtered = [...filtered].sort((a, b) => b.currAmount - a.currAmount);
    if (projectSortOrder === 'lowAmount')
      filtered = [...filtered].sort((a, b) => a.currAmount - b.currAmount);

    return filtered;
  }, [projectList, searchTerm, projectSortOrder]);

  const paginatedProjects = paginate(filteredProjects, page, 3);
  const totalPages = Math.ceil(filteredProjects.length / 3);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const toggleProject = (id: number) => {
    setSelectedProjectId(selectedProjectId === id ? null : id);
  };

  const handleBackingSortChange = (projectId: number, value: string) => {
    setBackingSortOrders((prev) => ({ ...prev, [projectId]: value }));
  };

  const handleBackingSearch = (projectId: number, value: string) => {
    setBackingSearch((prev) => ({ ...prev, [projectId]: value }));
    setBackingPage((prev) => ({ ...prev, [projectId]: 1 }));
  };

  const handleBackingPageChange = (projectId: number, newPage: number) => {
    setBackingPage((prev) => ({ ...prev, [projectId]: newPage }));
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-2">후원 내역</h2>

      {/* 🔍 상단 검색/정렬 */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={searchType}
          onValueChange={(v: 'project' | 'user') => setSearchType(v)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="검색 유형" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="project">프로젝트명</SelectItem>
            <SelectItem value="user">후원자 ID</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={handleSearch}
          className="w-[220px]"
        />

        <Select
          value={projectSortOrder}
          onValueChange={(v) => setProjectSortOrder(v)}
        >
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
        const percent = Math.min(
          ((project.currAmount / project.goalAmount) * 100).toFixed(1),
          100
        );
        const projectId = project.id;

        const sortType = backingSortOrders[projectId] || 'latest';
        const searchKeyword = (backingSearch[projectId] || '').toLowerCase();
        const currentPage = backingPage[projectId] || 1;
        const PER_PAGE = 3;

        let filteredBacking = backingData[projectId]?.filter((b) =>
          b.userId.toLowerCase().includes(searchKeyword)
        );

        if (sortType === 'highAmount')
          filteredBacking.sort((a, b) => b.amount - a.amount);
        if (sortType === 'lowAmount')
          filteredBacking.sort((a, b) => a.amount - b.amount);
        if (sortType === 'oldest')
          filteredBacking.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        if (sortType === 'latest')
          filteredBacking.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        const totalBackingPages = Math.ceil(filteredBacking.length / PER_PAGE);
        const paginatedBacking = paginate(
          filteredBacking,
          currentPage,
          PER_PAGE
        );

        // ✅ 후원자 수 계산
        const backerCount = backingData[projectId]?.length || 0;

        return (
          <Card key={project.id} className="border shadow-sm">
            {/* ✅ 썸네일 이미지 */}
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />

            <CardHeader
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleProject(project.id)}
            >
              <div>
                <CardTitle>{project.title}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {project.currAmount.toLocaleString()}원 /{' '}
                  {project.goalAmount.toLocaleString()}원
                </p>

                {/* ✅ 후원자 수 추가 */}
                <p className="text-sm text-gray-600 mt-1">
                  총 <span className="font-semibold">{backerCount}</span>명 후원
                </p>

                <div className="w-full bg-gray-200 h-3 rounded-full mt-2">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      percent >= 100
                        ? 'bg-green-500'
                        : percent >= 70
                        ? 'bg-emerald-400'
                        : percent >= 40
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1 font-medium text-gray-700">
                  {percent}% 달성
                </p>
              </div>

              <Button variant="outline" size="sm">
                {selectedProjectId === project.id ? '닫기' : '후원자 보기'}
              </Button>
            </CardHeader>

            {/* 🔽 내부 후원자 리스트 */}
            {selectedProjectId === project.id && (
              <CardContent className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <Input
                    placeholder="후원자 ID 검색"
                    value={backingSearch[project.id] || ''}
                    onChange={(e) =>
                      handleBackingSearch(project.id, e.target.value)
                    }
                    className="w-[200px]"
                  />
                  <Select
                    value={sortType}
                    onValueChange={(v) =>
                      handleBackingSortChange(project.id, v)
                    }
                  >
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
                      <th className="p-2">후원자 ID</th>
                      <th className="p-2">후원 금액</th>
                      <th className="p-2">후원 날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBacking.map((b, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2">{b.userId}</td>
                        <td className="p-2">{b.amount.toLocaleString()}원</td>
                        <td className="p-2">{b.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalBackingPages > 1 && (
                  <div className="flex justify-center mt-3 gap-2">
                    {Array.from(
                      { length: totalBackingPages },
                      (_, i) => i + 1
                    ).map((n) => (
                      <Button
                        key={n}
                        size="sm"
                        variant={currentPage === n ? 'default' : 'outline'}
                        onClick={() => handleBackingPageChange(project.id, n)}
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* 외부 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              size="sm"
              variant={page === n ? 'default' : 'outline'}
              onClick={() => setPage(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
