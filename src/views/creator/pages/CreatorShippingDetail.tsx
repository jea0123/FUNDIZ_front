import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, postData, endpoints } from '@/api/apis';
import { useCreatorId } from '../../../types/useCreatorId';
import type { creatorShippingBackerList, creatorShippingStatus } from '@/types/shipping';
import FundingLoader from '@/components/FundingLoader';

export default function CreatorShippingDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { creatorId, loading: idLoading } = useCreatorId();
  const navigate = useNavigate();

  const fetched = useRef(false);
  const [shippingList, setShippingList] = useState<creatorShippingBackerList[]>([]);
  const [selectedItem, setSelectedItem] = useState<creatorShippingBackerList | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'status'>('recent');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // 상태 전환 허용 규칙
  const allowedTransitions: Record<string, string[]> = {
    PENDING: ['READY'], // 후원 완료 → 준비중
    READY: ['SHIPPED'], // 준비중 → 배송시작
    SHIPPED: ['DELIVERED', 'FAILED'], // 배송중 → 완료/실패
    DELIVERED: ['CANCELED'], // 완료 → 취소
    CANCELED: [],
    FAILED: [],
  };

  const statusLabel: Record<string, string> = {
    PENDING: '후원 완료',
    READY: '상품 준비 중',
    SHIPPED: '배송 시작',
    DELIVERED: '배송 완료',
    CANCELED: '취소',
    FAILED: '배송 실패',
  };

  // 배송상태 변경 함수
  const changeStatus = async (idx: number, newStatus: string) => {
    const item = shippingList[idx];
    const current = item.shippingStatus;

    // 허용되지 않은 상태 전환 방지
    if (!allowedTransitions[current]?.includes(newStatus)) {
      alert(`현재 상태(${statusLabel[current]})에서는 '${statusLabel[newStatus]}'(으)로 변경할 수 없습니다.\n\n가능한 상태: ${allowedTransitions[current].length > 0 ? allowedTransitions[current].map((s) => statusLabel[s]).join(', ') : '없음'}`);
      return;
    }

    // 운송장번호 필수 검사
    if ((newStatus === 'SHIPPED' || newStatus === 'DELIVERED') && (!item.trackingNum || !/^[0-9]{10,14}$/.test(item.trackingNum))) {
      alert(`${statusLabel[newStatus]} 상태로 변경하려면 10~14자리 운송장 번호가 필요합니다.`);
      return;
    }

    const updateDto: creatorShippingStatus = {
      backingId: item.backingId,
      shippingStatus: newStatus,
      trackingNum: item.trackingNum || '',
      shippedAt: newStatus === 'SHIPPED' ? new Date() : null,
      deliveredAt: newStatus === 'DELIVERED' ? new Date() : null,
    };

    try {
      const res = await postData(endpoints.creatorShippingBackerList(Number(projectId)), updateDto);
      if (res.status === 200) {
        alert('배송 상태가 변경되었습니다.');
        setShippingList((prev) => prev.map((it, i) => (i === idx ? { ...it, shippingStatus: newStatus } : it)));
        if (selectedItem && item.backingId === selectedItem.backingId) {
          setSelectedItem((prev) => (prev ? { ...prev, shippingStatus: newStatus } : prev));
        }
      } else {
        alert(`배송 상태 변경 실패 (code: ${res.status})`);
      }
    } catch (err) {
      console.error('배송 상태 변경 오류:', err);
      alert('배송 상태 변경 중 오류가 발생했습니다.');
    }
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
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">프로젝트 {projectId} 배송 내역</h2>
        <button onClick={() => navigate(-1)} className="border px-3 py-1 rounded bg-gray-100">
          ← 목록으로
        </button>
      </div>

      {/* 검색/정렬 */}
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

      {/* 테이블 */}
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
          {currentList.map((item, idx) => {
            const current = item.shippingStatus;
            const trackingDisabled = ['SHIPPED', 'DELIVERED', 'CANCELED', 'FAILED'].includes(current); // 🚫 운송장 수정 제한
            return (
              <tr key={idx} onClick={() => setSelectedItem(item)} className={`border-b hover:bg-gray-50 cursor-pointer ${selectedItem?.backingId === item.backingId ? 'bg-yellow-50' : ''}`}>
                <td className="p-2">{item.nickname}</td>
                <td className="p-2">{item.rewardName}</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2">
                  {item.roadAddr} {item.detailAddr}
                </td>
                <td className="p-2 text-center">
                  <input type="text" value={item.trackingNum || ''} onChange={(e) => setShippingList((prev) => prev.map((it, i) => (i === idx ? { ...it, trackingNum: e.target.value } : it)))} placeholder="운송장번호" className="border rounded px-2 py-1 w-32 text-center" onClick={(e) => e.stopPropagation()} disabled={trackingDisabled} />
                </td>
                <td className="p-2 text-center">{item.shippedAt ? new Date(item.shippedAt).toLocaleDateString() : '—'}</td>
                <td className="p-2 text-center">{renderStatusBadge(item.shippingStatus)}</td>
                <td className="p-2 text-center flex items-center justify-center gap-2">
                  <select value={item.shippingStatus} onChange={(e) => changeStatus(idx, e.target.value)} className="border rounded px-2 py-1" onClick={(e) => e.stopPropagation()} disabled={current === 'CANCELED' || current === 'FAILED'}>
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
                      changeStatus(idx, item.shippingStatus);
                    }}
                    className={`border rounded px-2 py-1 text-xs ${item.shippingStatus === 'DELIVERED' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200'}`}
                    disabled={item.shippingStatus === 'DELIVERED'}
                  >
                    변경
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 상세보기 */}
      {selectedItem && (
        <div className="mt-6 p-6 border rounded-xl bg-gray-50 shadow-md space-y-6">
          <h3 className="text-lg font-semibold mb-4">{selectedItem.recipient} 님 배송 상세정보</h3>

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

          <section>
            <h4 className="font-semibold text-gray-800 mb-2">📦 프로젝트 정보</h4>
            <p>
              <strong>프로젝트명:</strong> {selectedItem.title}
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
