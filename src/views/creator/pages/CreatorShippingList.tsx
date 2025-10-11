import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

interface ProjectItem {
  id: number;
  title: string;
  totalBackers: number;
  totalShipCount: number;
  shippedCount: number;
  status: 'READY' | 'SHIPPING' | 'DONE';
}

const MOCK_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: '따뜻한 머그컵 만들기',
    totalBackers: 52,
    totalShipCount: 52,
    shippedCount: 12,
    status: 'SHIPPING',
  },
  {
    id: 2,
    title: '감성 조명 프로젝트',
    totalBackers: 38,
    totalShipCount: 38,
    shippedCount: 38,
    status: 'DONE',
  },
  {
    id: 3,
    title: '친환경 키링 제작',
    totalBackers: 21,
    totalShipCount: 21,
    shippedCount: 5,
    status: 'READY',
  },
  {
    id: 4,
    title: '손뜨개 인형 만들기',
    totalBackers: 14,
    totalShipCount: 14,
    shippedCount: 8,
    status: 'SHIPPING',
  },
  {
    id: 5,
    title: '커스텀 폰케이스 제작',
    totalBackers: 41,
    totalShipCount: 41,
    shippedCount: 0,
    status: 'READY',
  },
  {
    id: 6,
    title: '아트 포스터 시리즈',
    totalBackers: 23,
    totalShipCount: 23,
    shippedCount: 23,
    status: 'DONE',
  },
  {
    id: 7,
    title: '핸드메이드 향초 프로젝트',
    totalBackers: 18,
    totalShipCount: 18,
    shippedCount: 10,
    status: 'SHIPPING',
  },
  {
    id: 8,
    title: '재활용 에코백 만들기',
    totalBackers: 30,
    totalShipCount: 30,
    shippedCount: 5,
    status: 'READY',
  },
  {
    id: 9,
    title: '일러스트 캘린더 제작',
    totalBackers: 27,
    totalShipCount: 27,
    shippedCount: 27,
    status: 'DONE',
  },
  {
    id: 10,
    title: '목제 인테리어 소품',
    totalBackers: 20,
    totalShipCount: 20,
    shippedCount: 2,
    status: 'READY',
  },
];

export function CreatorShippingList() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'status'>(
    'recent'
  );
  const [page, setPage] = useState(1);
  const itemsPerPage = 5; // 페이지당 5개

  // 🔍 검색 + 정렬
  const filteredProjects = MOCK_PROJECTS.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.id - a.id;
      case 'oldest':
        return a.id - b.id;
      case 'status':
        const order = { READY: 1, SHIPPING: 2, DONE: 3 };
        return order[a.status] - order[b.status];
      default:
        return 0;
    }
  });

  // 📑 페이지네이션
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const pagedProjects = filteredProjects.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 🚚 상태 뱃지
  const statusLabel = (status: string) => {
    switch (status) {
      case 'READY':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">배송 준비중</Badge>
        );
      case 'SHIPPING':
        return <Badge className="bg-blue-100 text-blue-700">배송중</Badge>;
      case 'DONE':
        return <Badge className="bg-green-100 text-green-700">배송 완료</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">기타</Badge>;
    }
  };

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            📦 프로젝트별 배송 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 검색 & 정렬 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            {/* 검색 */}
            <div className="flex gap-2">
              <Input
                placeholder="프로젝트명 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64"
              />
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm(searchInput);
                  setPage(1);
                }}
              >
                검색
              </Button>
            </div>

            {/* 정렬 */}
            <Select
              value={sortBy}
              onValueChange={(v: 'recent' | 'oldest' | 'status') => {
                setSortBy(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">최신순</SelectItem>
                <SelectItem value="oldest">오래된순</SelectItem>
                <SelectItem value="status">배송 상태순</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 리스트 */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="p-2">프로젝트명</th>
                  <th className="p-2 text-center">총 후원자</th>
                  <th className="p-2 text-center">배송완료/총 배송수</th>
                  <th className="p-2 text-center">상태</th>
                  <th className="p-2 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {pagedProjects.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{p.title}</td>
                    <td className="p-2 text-center">{p.totalBackers}</td>
                    <td className="p-2 text-center">
                      {p.shippedCount} / {p.totalShipCount}
                    </td>
                    <td className="p-2 text-center">{statusLabel(p.status)}</td>
                    <td className="p-2 text-center">
                      <Button
                        variant="default"
                        onClick={() => navigate(`/creator/shipping/${p.id}`)}
                      >
                        상세 보기
                      </Button>
                    </td>
                  </tr>
                ))}

                {pagedProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </Button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? 'default' : 'outline'}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
