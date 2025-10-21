import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useCreatorId } from '../../../types/useCreatorId';
import { getData, endpoints } from '@/api/apis';
import FundingLoader from '@/components/FundingLoader';
import type { CreaotrShippingProjectList } from '@/types/shipping';
import { setDevCreatorIdHeader } from '@/api/apis';
setDevCreatorIdHeader(2);

export default function CreatorShippingList() {
  const navigate = useNavigate();
  const { creatorId, loading: idLoading } = useCreatorId(2);
  const [projects, setProjects] = useState<CreaotrShippingProjectList[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'backerCnt' | 'completed' | 'status'>('backerCnt');
  //페이지네이션
  const [page, setPage] = useState(1);
  const itemsPerPage = 5; //한 페이지에서 보여줄 개수

  const effectiveCreatorId = creatorId || Number(localStorage.getItem('DEV_CREATOR_ID')) || Number(import.meta.env.VITE_DEV_CREATOR_ID) || 1;
  // 배송 리스트 불러오기
  useEffect(() => {
    if (idLoading || !effectiveCreatorId || fetched.current) return;
    fetched.current = true;

    (async () => {
      try {
        setLoading(true);
        const res = await getData(endpoints.creatorShippingList);
        if (res.status === 200 && Array.isArray(res.data)) {
          setProjects(res.data);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error('🚫 배송 리스트 로드 실패:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [idLoading, effectiveCreatorId]);

  // 상태 계산
  const getStatus = (p: CreaotrShippingProjectList) => {
    if (p.completedShippingCnt === 0) return 'READY'; // 0이면 배송 준비중
    if (p.completedShippingCnt < p.backerCnt) return 'SHIPPING'; // 0 < 완료수 < 총배송수 -> 배송중
    if (p.completedShippingCnt === p.backerCnt) return 'DELIVERED'; // 완료수 = 총배송수 -> 배송완료
    return 'READY';
  };

  // 검색 + 정렬
  const filteredProjects = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return [...projects]
      .filter((p) => p.title.toLowerCase().includes(term))
      .sort((a, b) => {
        switch (sortBy) {
          case 'backerCnt':
            return b.backerCnt - a.backerCnt; // 총 후원자 많은 순
          case 'completed':
            return b.completedShippingCnt - a.completedShippingCnt; // 배송 완료 많은 순
          case 'status':
            const order = { READY: 1, SHIPPING: 2, DONE: 3 };
            return order[getStatus(a)] - order[getStatus(b)];
          default:
            return 0;
        }
      });
  }, [projects, searchTerm, sortBy]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const pagedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  // 상태 뱃지
  const statusLabel = (status: string) => {
    switch (status) {
      case 'READY':
        return <Badge className="bg-yellow-100 text-yellow-700">배송 준비중</Badge>;
      case 'SHIPPING':
        return <Badge className="bg-blue-100 text-blue-700">배송중</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-700">배송 완료</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">기타</Badge>;
    }
  };

  // 로딩 중
  if (loading || idLoading) return <FundingLoader />;

  // UI 동일 유지
  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">📦 프로젝트별 배송 관리</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 검색 & 정렬 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            {/* 검색 */}
            <div className="flex gap-2">
              <Input placeholder="프로젝트명 검색" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-64" />
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
              onValueChange={(v: 'backerCnt' | 'completed' | 'status') => {
                setSortBy(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backerCnt">총 후원자순</SelectItem>
                <SelectItem value="completed">배송 완료순</SelectItem>
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
                {pagedProjects.map((p) => {
                  const status = getStatus(p);
                  return (
                    <tr key={p.projectId} className="border-b hover:bg-gray-50">
                      <td className="p-2">{p.title}</td>
                      <td className="p-2 text-center">{p.backerCnt}</td>
                      <td className="p-2 text-center">
                        {p.completedShippingCnt} / {p.backerCnt}
                      </td>
                      <td className="p-2 text-center">{statusLabel(status)}</td>
                      <td className="p-2 text-center">
                        <Button variant="default" onClick={() => navigate(`/creator/shipping/${p.projectId}`)}>
                          상세 보기
                        </Button>
                      </td>
                    </tr>
                  );
                })}

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
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              이전
            </Button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} onClick={() => setPage(i + 1)}>
                {i + 1}
              </Button>
            ))}

            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              다음
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
