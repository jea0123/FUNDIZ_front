import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ShippingItem {
  id: number;
  backerName: string;
  rewardName: string;
  quantity: number;
  address: string;
  status: 'READY' | 'SHIPPED' | 'DELIVERED';
  date: string;
}

const MOCK_SHIPPINGS: Record<number, ShippingItem[]> = {
  1: [
    {
      id: 101,
      backerName: '홍길동',
      rewardName: '화이트 세트',
      quantity: 2,
      address: '서울 강남구',
      status: 'READY',
      date: '2025-10-01',
    },
    {
      id: 102,
      backerName: '이민지',
      rewardName: '블랙 세트',
      quantity: 1,
      address: '부산 해운대',
      status: 'SHIPPED',
      date: '2025-10-03',
    },
    {
      id: 103,
      backerName: '박성민',
      rewardName: '그린 세트',
      quantity: 1,
      address: '대구 남구',
      status: 'DELIVERED',
      date: '2025-10-05',
    },
  ],
  2: [
    {
      id: 201,
      backerName: '김수현',
      rewardName: '조명 세트',
      quantity: 1,
      address: '서울 서초구',
      status: 'DELIVERED',
      date: '2025-09-30',
    },
  ],
  3: [
    {
      id: 301,
      backerName: '최예린',
      rewardName: '키링 A세트',
      quantity: 2,
      address: '인천 남동구',
      status: 'READY',
      date: '2025-10-06',
    },
    {
      id: 302,
      backerName: '이성호',
      rewardName: '키링 B세트',
      quantity: 1,
      address: '수원 장안구',
      status: 'READY',
      date: '2025-10-07',
    },
  ],
};

export function CreatorShippingDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [shippingList, setShippingList] = useState<ShippingItem[]>(
    MOCK_SHIPPINGS[Number(projectId)] || []
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'status'>(
    'recent'
  );
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // 필터 + 정렬
  const filtered = shippingList
    .filter(
      (i) =>
        i.backerName.toLowerCase().includes(search.toLowerCase()) ||
        i.rewardName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'recent')
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest')
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'status') {
        const order = { READY: 1, SHIPPED: 2, DELIVERED: 3 };
        return order[a.status] - order[b.status];
      }
      return 0;
    });

  // 페이지네이션
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const currentList = filtered.slice(start, start + itemsPerPage);

  // 체크박스
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? currentList.map((i) => i.id) : []);
  };

  // 상태 변경
  const changeStatus = (id: number, newStatus: ShippingItem['status']) => {
    setShippingList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
  };

  const bulkChange = (newStatus: ShippingItem['status']) => {
    setShippingList((prev) =>
      prev.map((i) =>
        selectedIds.includes(i.id) ? { ...i, status: newStatus } : i
      )
    );
    setSelectedIds([]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">📦 프로젝트 {projectId} 배송 내역</h2>
        <button
          onClick={() => navigate(-1)}
          className="border px-3 py-1 rounded bg-gray-100"
        >
          ← 목록으로
        </button>
      </div>

      {/* 검색/정렬/일괄 변경 */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="후원자명 또는 리워드 검색"
            className="border rounded px-2 py-1"
          />
          <button className="border px-3 rounded bg-gray-100">검색</button>
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="recent">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="status">배송 상태순</option>
          </select>

          <select
            onChange={(e) =>
              bulkChange(e.target.value as ShippingItem['status'])
            }
            className="border rounded px-2 py-1"
          >
            <option value="">일괄 상태 변경</option>
            <option value="READY">배송 준비중</option>
            <option value="SHIPPED">배송중</option>
            <option value="DELIVERED">배송 완료</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-center">
              <input
                type="checkbox"
                checked={currentList.every((i) => selectedIds.includes(i.id))}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </th>
            <th className="p-2">후원자명</th>
            <th className="p-2">리워드명</th>
            <th className="p-2 text-center">수량</th>
            <th className="p-2">주소</th>
            <th className="p-2 text-center">날짜</th>
            <th className="p-2 text-center">상태</th>
            <th className="p-2 text-center">변경</th>
          </tr>
        </thead>
        <tbody>
          {currentList.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
              </td>
              <td className="p-2">{item.backerName}</td>
              <td className="p-2">{item.rewardName}</td>
              <td className="p-2 text-center">{item.quantity}</td>
              <td className="p-2">{item.address}</td>
              <td className="p-2 text-center">{item.date}</td>
              <td className="p-2 text-center">
                {item.status === 'READY'
                  ? '배송 준비중'
                  : item.status === 'SHIPPED'
                  ? '배송중'
                  : '배송 완료'}
              </td>
              <td className="p-2 text-center">
                <select
                  value={item.status}
                  onChange={(e) =>
                    changeStatus(
                      item.id,
                      e.target.value as ShippingItem['status']
                    )
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="READY">배송 준비중</option>
                  <option value="SHIPPED">배송중</option>
                  <option value="DELIVERED">배송 완료</option>
                </select>
              </td>
            </tr>
          ))}

          {currentList.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center p-4 text-gray-500">
                검색 결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          className="border px-3 py-1 rounded"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          이전
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={`border px-3 py-1 rounded ${
              page === i + 1 ? 'bg-gray-200' : ''
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="border px-3 py-1 rounded"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
}
