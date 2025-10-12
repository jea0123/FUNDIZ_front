import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, endpoints } from '@/api/apis';
import { useCreatorId } from '../useCreatorId';
import type { creatorShippingBackerList } from '@/types/shipping';
import FundingLoader from '@/components/FundingLoader';

export default function CreatorShippingDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { creatorId, loading: idLoading } = useCreatorId();
  const navigate = useNavigate();

  const fetched = useRef(false);

  const [shippingList, setShippingList] = useState<creatorShippingBackerList[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<creatorShippingBackerList | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'status'>('recent');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    if (idLoading || !projectId) return;
    if (fetched.current) return;

    fetched.current = true;
    (async () => {
      try {
        setLoading(true);
        console.log('요청 URL:', endpoints.creatorShippingBackerList(Number(projectId)));
        const res = await getData(endpoints.creatorShippingBackerList(Number(projectId)));
        console.log('응답:', res);

        if (res?.status === 200 && Array.isArray(res.data)) {
          setShippingList(res.data);
        } else {
          console.warn('서버 응답 이상:', res);
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

  // 검색 + 정렬
  const filtered = shippingList
    .filter((i) => i.nickname.toLowerCase().includes(search.toLowerCase()) || i.rewardName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.shippedAt || '').getTime() - new Date(a.shippedAt || '').getTime();
      if (sortBy === 'oldest') return new Date(a.shippedAt || '').getTime() - new Date(b.shippedAt || '').getTime();
      if (sortBy === 'status') {
        const order = { READY: 1, SHIPPING: 2, DONE: 3 };
        return order[a.shippingStatus] - order[b.shippingStatus];
      }
      return 0;
    });

  // 페이지네이션
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const currentList = filtered.slice(start, start + itemsPerPage);

  // 선택 기능
  const toggleSelect = (idx: number) => {
    setSelectedIds((prev) => (prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]));
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? currentList.map((_, idx) => idx) : []);
  };

  const changeStatus = (idx: number, newStatus: string) => {
    setShippingList((prev) => prev.map((item, i) => (i === idx ? { ...item, shippingStatus: newStatus } : item)));
    if (selectedItem && shippingList[idx]?.recipient === selectedItem.recipient) {
      setSelectedItem((prev) => (prev ? { ...prev, shippingStatus: newStatus } : prev));
    }
  };

  const bulkChange = (newStatus: string) => {
    if (!newStatus) return;
    setShippingList((prev) => prev.map((item, idx) => (selectedIds.includes(idx) ? { ...item, shippingStatus: newStatus } : item)));
    setSelectedIds([]);
  };

  //배송상태
  const renderStatusBadge = (status: string) => {
    const base = 'px-2 py-1 rounded text-xs font-medium';
    switch (status) {
      case 'PENDING':
        return <span className={`${base} bg-gray-100 text-gray-700`}>후원 완료</span>;
      case 'READY':
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>상품 준비 중</span>;
      case 'SHIPPED':
        return <span className={`${base} bg-blue-100 text-blue-700`}>배송 시작</span>;
      case 'DELIVERED':
        return <span className={`${base} bg-green-100 text-green-700`}>배송 완료</span>;
      case 'CANCELED':
        return <span className={`${base} bg-gray-300 text-gray-800`}>취소</span>;
      case 'FAILED':
        return <span className={`${base} bg-red-100 text-red-700`}>배송 실패</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  // 로딩 및 오류
  if (loading || idLoading) return <FundingLoader />;
  if (error)
    return (
      <div className="p-6 text-red-600">
        데이터를 불러올 수 없습니다.
        <br />
        <span className="text-sm">{error}</span>
      </div>
    );

  // UI (기존 구조 유지)
  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">프로젝트 {projectId} 배송 내역</h2>
        <button onClick={() => navigate(-1)} className="border px-3 py-1 rounded bg-gray-100">
          ← 목록으로
        </button>
      </div>

      {/* 검색 / 정렬 / 일괄 변경 */}
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
        </div>

        <div className="flex gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="recent">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="status">배송 상태순</option>
          </select>

          <select onChange={(e) => bulkChange(e.target.value)} className="border rounded px-2 py-1">
            <option value="">일괄 상태 변경</option>
            <option value="PENDING">후원 완료</option>
            <option value="READY">상품 준비 중</option>
            <option value="SHIPPED">배송 시작</option>
            <option value="DELIVERED">배송 완료</option>
            <option value="CANCELED">취소</option>
            <option value="FAILED">배송 실패</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-center">
              <input type="checkbox" checked={currentList.every((_, idx) => selectedIds.includes(idx))} onChange={(e) => toggleSelectAll(e.target.checked)} />
            </th>
            <th className="p-2">후원자명</th>
            <th className="p-2">리워드명</th>
            <th className="p-2 text-center">수량</th>
            <th className="p-2">주소</th>
            <th className="p-2 text-center">발송일</th>
            <th className="p-2 text-center">상태</th>
            <th className="p-2 text-center">변경</th>
          </tr>
        </thead>
        <tbody>
          {currentList.map((item, idx) => (
            <tr key={idx} onClick={() => setSelectedItem(item)} className={`border-b hover:bg-gray-50 cursor-pointer ${selectedItem?.recipient === item.recipient ? 'bg-yellow-50' : ''}`}>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(idx)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(idx);
                  }}
                />
              </td>
              <td className="p-2">{item.nickname}</td>
              <td className="p-2">{item.rewardName}</td>
              <td className="p-2 text-center">{item.quantity}</td>
              <td className="p-2">
                {item.roadAddr} {item.detailAddr}
              </td>
              <td className="p-2 text-center">{item.shippedAt ? new Date(item.shippedAt).toLocaleDateString() : '—'}</td>
              <td className="p-2 text-center">{renderStatusBadge(item.shippingStatus)}</td>
              <td className="p-2 text-center">
                <select value={item.shippingStatus} onChange={(e) => changeStatus(idx, e.target.value)} className="border rounded px-2 py-1" onClick={(e) => e.stopPropagation()}>
                  <option value="PENDING">후원 완료</option>
                  <option value="READY">상품 준비 중</option>
                  <option value="SHIPPED">배송 시작</option>
                  <option value="DELIVERED">배송 완료</option>
                  <option value="CANCELED">취소</option>
                  <option value="FAILED">배송 실패</option>
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

      {/* 상세보기 */}
      {selectedItem && (
        <div className="mt-6 p-6 border rounded-xl bg-gray-50 shadow-md space-y-6">
          <h3 className="text-lg font-semibold mb-4">{selectedItem.recipient} 님 배송 상세정보</h3>

          {/*유저 정보 */}
          <section>
            <h4 className="font-semibold text-gray-800 mb-2">👤 유저 정보</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                <strong>이메일:</strong> {selectedItem.email}
              </p>
              <p>
                <strong>닉네임:</strong> {selectedItem.nickname}
              </p>
            </div>
          </section>

          {/*리워드 정보 */}
          <section>
            <h4 className="font-semibold text-gray-800 mb-2">🎁 리워드 정보</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                <strong>리워드명:</strong> {selectedItem.rewardName}
              </p>
              <p>
                <strong>수량:</strong> {selectedItem.quantity}
              </p>
            </div>
          </section>

          {/* 배송지 정보 */}
          <section>
            <h4 className="font-semibold text-gray-800 mb-2">🏠 배송지 정보</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                <strong>수령인:</strong> {selectedItem.recipient}
              </p>
              <p>
                <strong>전화번호:</strong> {selectedItem.recipientPhone}
              </p>
              <p>
                <strong>우편번호:</strong> {selectedItem.postalCode}
              </p>
              <p className="col-span-2">
                <strong>주소:</strong> {selectedItem.roadAddr} {selectedItem.detailAddr}
              </p>
            </div>
          </section>

          {/* 배송 정보 */}
          <section>
            <h4 className="font-semibold text-gray-800 mb-2">🚚 배송 정보</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                <strong>운송장 번호:</strong> {selectedItem.trackingNum || '—'}
              </p>
              <p>
                <strong>배송 상태:</strong> {renderStatusBadge(selectedItem.shippingStatus)}
              </p>
              <p>
                <strong>발송일:</strong> {selectedItem.shippedAt ? new Date(selectedItem.shippedAt).toLocaleDateString() : '—'}
              </p>
              <p>
                <strong>배송 완료일:</strong> {selectedItem.deliveredAt ? new Date(selectedItem.deliveredAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </section>

          {/*프로젝트 정보 */}
          <section>
            <h4 className="font-semibold text-gray-800 mb-2">📦 프로젝트 정보</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                <strong>프로젝트명:</strong> {selectedItem.title}
              </p>
            </div>
          </section>
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="flex justify-center gap-2 mt-4">
        <button className="border px-3 py-1 rounded" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          이전
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button key={i} className={`border px-3 py-1 rounded ${page === i + 1 ? 'bg-gray-200' : ''}`} onClick={() => setPage(i + 1)}>
            {i + 1}
          </button>
        ))}

        <button className="border px-3 py-1 rounded" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
          다음
        </button>
      </div>
    </div>
  );
}
