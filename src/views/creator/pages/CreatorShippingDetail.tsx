import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, postData, endpoints } from '@/api/apis';
import { useCreatorId } from '../../../types/useCreatorId';
import type { creatorShippingBackerList, creatorShippingStatus } from '@/types/shipping';
import FundingLoader from '@/components/FundingLoader';

import { setDevCreatorIdHeader } from '@/api/apis';
setDevCreatorIdHeader(2);

export default function CreatorShippingDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { creatorId, loading: idLoading } = useCreatorId();
  const navigate = useNavigate();

  const fetched = useRef(false);
  const [shippingList, setShippingList] = useState<creatorShippingBackerList[]>([]);
  const [hoveredBackingId, setHoveredBackingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'status'>('recent');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Record<number, string>>({});
  const itemsPerPage = 5;

  // 데이터 로드
  useEffect(() => {
    if (idLoading || !projectId) return;
    if (fetched.current) return;

    fetched.current = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getData(endpoints.creatorShippingBackerList(Number(projectId)));
        if (res?.status === 200 && Array.isArray(res.data)) {
          setShippingList(res.data);
        } else {
          setError(`서버 응답 코드 ${res?.status}`);
        }
      } catch (err) {
        console.error('배송 상세정보 로드 실패:', err);
        setError('서버 통신 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [idLoading, projectId]);

  // 상태 전환 허용 규칙 (취소 확장)
  const allowedTransitions: Record<string, string[]> = {
    PENDING: ['READY', 'CANCELED'],
    READY: ['SHIPPED', 'CANCELED'],
    SHIPPED: ['DELIVERED', 'FAILED', 'CANCELED'],
    DELIVERED: ['CANCELED'],
    CANCELED: [],
    FAILED: ['CANCELED'],
  };

  const statusLabel: Record<string, string> = {
    PENDING: '후원 완료',
    READY: '상품 준비 중',
    SHIPPED: '배송 시작',
    DELIVERED: '배송 완료',
    CANCELED: '취소',
    FAILED: '배송 실패',
  };

  // backingId 그룹 전체 상태 변경
  const changeStatus = async (backingId: number, newStatus: string) => {
    const groupItems = shippingList.filter((i) => i.backingId === backingId);
    const current = groupItems[0]?.shippingStatus;

    if (!allowedTransitions[current]?.includes(newStatus)) {
      alert(`현재 상태(${statusLabel[current]})에서는 '${statusLabel[newStatus]}'(으)로 변경할 수 없습니다.\n\n가능한 상태: ${allowedTransitions[current].length > 0 ? allowedTransitions[current].map((s) => statusLabel[s]).join(', ') : '없음'}`);
      return;
    }

    const invalidTracking = groupItems.some((i) => (newStatus === 'SHIPPED' || newStatus === 'DELIVERED') && (!i.trackingNum || !/^[0-9]{10,14}$/.test(i.trackingNum)));
    if (invalidTracking) {
      alert(`${statusLabel[newStatus]} 상태로 변경하려면 모든 항목에 운송장번호가 필요합니다.`);
      return;
    }

    try {
      let successCount = 0;

      for (const item of groupItems) {
        const updateDto: creatorShippingStatus = {
          backingId: item.backingId,
          shippingStatus: newStatus,
          trackingNum: item.trackingNum || '',
          shippedAt: newStatus === 'SHIPPED' ? new Date() : null,
          deliveredAt: newStatus === 'DELIVERED' ? new Date() : null,
        };
        const res = await postData(endpoints.creatorShippingBackerList(Number(projectId)), updateDto);
        if (res.status === 200) successCount++;
      }

      if (successCount > 0) {
        alert(`${groupItems.length}개의 항목이 '${statusLabel[newStatus]}'로 변경되었습니다.`);

        setShippingList((prev) => prev.map((it) => (it.backingId === backingId ? { ...it, shippingStatus: newStatus } : it)));
      }
    } catch (err) {
      console.error('배송 상태 변경 오류:', err);
      alert('배송 상태 변경 중 오류가 발생했습니다.');
    }
  };

  // select 변경 시 같은 backingId 그룹 전체 드롭다운 동기화
  const handleSelectStatus = (backingId: number, newStatus: string) => {
    setPendingStatus((prev) => ({
      ...prev,
      [backingId]: newStatus,
    }));
  };

  // 검색 + 정렬
  const filtered = shippingList
    .filter((i) => i.nickname.toLowerCase().includes(search.toLowerCase()) || i.rewardName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.shippedAt || '').getTime() - new Date(a.shippedAt || '').getTime();
      if (sortBy === 'oldest') return new Date(a.shippedAt || '').getTime() - new Date(b.shippedAt || '').getTime();
      if (sortBy === 'status') {
        const order = { READY: 1, SHIPPED: 2, DELIVERED: 3 };
        return order[a.shippingStatus] - order[b.shippingStatus];
      }
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const currentList = filtered.slice(start, start + itemsPerPage);

  const renderStatusBadge = (status: string) => {
    const base = 'px-2 py-1 rounded text-xs font-medium';
    const colors: Record<string, string> = {
      PENDING: 'bg-gray-100 text-gray-700',
      READY: 'bg-yellow-100 text-yellow-700',
      SHIPPED: 'bg-blue-100 text-blue-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELED: 'bg-gray-300 text-gray-800',
      FAILED: 'bg-red-100 text-red-700',
    };
    return <span className={`${base} ${colors[status] || ''}`}>{statusLabel[status] || status}</span>;
  };

  if (loading || idLoading) return <FundingLoader />;
  if (error)
    return (
      <div className="p-6 text-red-600">
        데이터를 불러올 수 없습니다.
        <br />
        <span className="text-sm">{error}</span>
      </div>
    );

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">프로젝트 {projectId} 배송 내역</h2>
        <button onClick={() => navigate(-1)} className="border px-3 py-1 rounded bg-gray-100">
          ← 목록으로
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
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
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="border rounded px-2 py-1">
          <option value="recent">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="status">배송 상태순</option>
        </select>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">후원자명</th>
            <th className="p-2">리워드명</th>
            <th className="p-2 text-center">수량</th>
            <th className="p-2">주소</th>
            <th className="p-2 text-center">운송장번호</th>
            <th className="p-2 text-center">발송일</th>
            <th className="p-2 text-center">상태</th>
            <th className="p-2 text-center">변경</th>
          </tr>
        </thead>
        <tbody>
          {currentList.map((item) => {
            const current = item.shippingStatus;
            const isHovered = hoveredBackingId === item.backingId;
            const trackingDisabled = ['CANCELED'].includes(current);
            const selectedStatus = pendingStatus[item.backingId] ?? item.shippingStatus;

            return (
              <tr key={item.backingId + '-' + item.rewardName} onMouseEnter={() => setHoveredBackingId(item.backingId)} onMouseLeave={() => setHoveredBackingId(null)} className={`border-b cursor-pointer transition-colors duration-150 ${isHovered ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                <td className="p-2">{item.nickname}</td>
                <td className="p-2">{item.rewardName}</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2">
                  {item.roadAddr} {item.detailAddr}
                </td>
                <td className="p-2 text-center">
                  <input type="text" value={item.trackingNum || ''} onChange={(e) => setShippingList((prev) => prev.map((it) => (it.backingId === item.backingId && it.rewardName === item.rewardName ? { ...it, trackingNum: e.target.value } : it)))} placeholder="운송장번호" className="border rounded px-2 py-1 w-32 text-center" onClick={(e) => e.stopPropagation()} disabled={trackingDisabled} />
                </td>
                <td className="p-2 text-center">{item.shippedAt ? new Date(item.shippedAt).toLocaleDateString() : '—'}</td>
                <td className="p-2 text-center">{renderStatusBadge(item.shippingStatus)}</td>
                <td className="p-2 text-center flex items-center justify-center gap-2">
                  <select value={selectedStatus} onChange={(e) => handleSelectStatus(item.backingId, e.target.value)} className="border rounded px-2 py-1" onClick={(e) => e.stopPropagation()} disabled={current === 'CANCELED'}>
                    {Object.keys(statusLabel).map((status) => {
                      const disabled = !allowedTransitions[current]?.includes(status) && status !== current;
                      return (
                        <option key={status} value={status} disabled={disabled}>
                          {statusLabel[status]}
                        </option>
                      );
                    })}
                  </select>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newStatus = pendingStatus[item.backingId] ?? item.shippingStatus;
                      changeStatus(item.backingId, newStatus);
                    }}
                    className={`border rounded px-2 py-1 text-xs ${item.shippingStatus === 'CANCELED' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200'}`}
                    disabled={item.shippingStatus === 'CANCELED'}
                  >
                    변경
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
