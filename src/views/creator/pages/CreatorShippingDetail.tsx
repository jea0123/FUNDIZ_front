import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getData, postData, endpoints } from "@/api/apis";
import type {
  creatorShippingBackerList,
  creatorShippingStataus,
} from "@/types/shipping";
import FundingLoader from "@/components/FundingLoader";
import { useCookies } from "react-cookie";

export default function CreatorShippingDetail() {
  const [cookie] = useCookies();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [expandedBackingId, setExpandedBackingId] = useState<number | null>(
    null
  );

  const fetched = useRef(false);
  const [shippingList, setShippingList] = useState<creatorShippingBackerList[]>(
    []
  );
  const [hoveredBackingId, setHoveredBackingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "status">(
    "recent"
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Record<number, string>>(
    {}
  );
  const itemsPerPage = 10;

  // 데이터 로드
  useEffect(() => {
    if (!projectId) return;
    if (fetched.current) return;

    fetched.current = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getData(
          endpoints.creatorShippingBackerList(Number(projectId)),
          cookie.accessToken
        );
        if (res?.status === 200 && Array.isArray(res.data)) {
          setShippingList(res.data);
        } else {
          setError(`서버 응답 코드 ${res?.status}`);
        }
      } catch (err) {
        console.error("배송 상세정보 로드 실패:", err);
        setError("서버 통신 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, cookie.accessToken]);

  // 상태 전환 허용 규칙 (취소 확장)
  const allowedTransitions: Record<string, string[]> = {
    PENDING: ["READY", "CANCELED"],
    READY: ["SHIPPED", "CANCELED"],
    SHIPPED: ["DELIVERED", "FAILED", "CANCELED"],
    DELIVERED: ["CANCELED"],
    CANCELED: [],
    FAILED: ["CANCELED"],
  };

  const statusLabel: Record<string, string> = {
    PENDING: "후원 완료",
    READY: "상품준비중",
    SHIPPED: "배송 시작",
    DELIVERED: "배송 완료",
    CANCELED: "취소",
    FAILED: "배송 실패",
  };

  // backingId 그룹 전체 상태 변경
  const changeStatus = async (backingId: number, newStatus: string) => {
    const groupItems = shippingList.filter((i) => i.backingId === backingId);
    const current = groupItems[0]?.shippingStatus;

    if (!allowedTransitions[current]?.includes(newStatus)) {
      alert(
        `현재 상태(${statusLabel[current]})에서는 '${
          statusLabel[newStatus]
        }'(으)로 변경할 수 없습니다.\n\n가능한 상태: ${
          allowedTransitions[current].length > 0
            ? allowedTransitions[current].map((s) => statusLabel[s]).join(", ")
            : "없음"
        }`
      );
      return;
    }

    const invalidTracking = groupItems.some(
      (i) =>
        (newStatus === "SHIPPED" || newStatus === "DELIVERED") &&
        (!i.trackingNum || !/^[0-9]{10,14}$/.test(i.trackingNum))
    );
    if (invalidTracking) {
      alert(
        `${statusLabel[newStatus]} 상태로 변경하려면 모든 항목에 운송장번호가 필요합니다.`
      );
      return;
    }

    try {
      let successCount = 0;

      for (const item of groupItems) {
        const updateDto: creatorShippingStataus = {
          backingId: item.backingId,
          shippingStatus: newStatus,
          trackingNum: item.trackingNum || "",
          shippedAt: newStatus === "SHIPPED" ? new Date() : null,
          deliveredAt: newStatus === "DELIVERED" ? new Date() : null,
        };
        const res = await postData(
          endpoints.creatorShippingBackerList(Number(projectId)),
          updateDto,
          cookie.accessToken
        );
        if (res.status === 200) successCount++;
      }

      if (successCount > 0) {
        alert(
          `${groupItems.length}개의 항목이 '${statusLabel[newStatus]}'로 변경되었습니다.`
        );

        setShippingList((prev) =>
          prev.map((it) =>
            it.backingId === backingId
              ? { ...it, shippingStatus: newStatus }
              : it
          )
        );
      }
    } catch (err) {
      console.error("배송 상태 변경 오류:", err);
      alert("배송 상태 변경 중 오류가 발생했습니다.");
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
    .filter(
      (i) =>
        i.nickname.toLowerCase().includes(search.toLowerCase()) ||
        i.rewardName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      if (sortBy === "recent") return dateB - dateA; // 최신순
      if (sortBy === "oldest") return dateA - dateB; // 오래된순

      if (sortBy === "status") {
        const order: Record<string, number> = {
          PENDING: 1,
          READY: 2,
          SHIPPED: 3,
          DELIVERED: 4,
          FAILED: 5,
          CANCELED: 6,
        };
        return (
          (order[a.shippingStatus] || 999) - (order[b.shippingStatus] || 999)
        );
      }

      return 0;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const currentList = filtered.slice(start, start + itemsPerPage);

  const renderStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    const colors: Record<string, string> = {
      PENDING: "bg-gray-100 text-gray-700",
      READY: "bg-yellow-100 text-yellow-700",
      SHIPPED: "bg-blue-100 text-blue-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELED: "bg-gray-300 text-gray-800",
      FAILED: "bg-red-100 text-red-700",
    };
    return (
      <span className={`${base} ${colors[status] || ""}`}>
        {statusLabel[status] || status}
      </span>
    );
  };

  if (loading) return <FundingLoader />;
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
        <h2 className="text-2xl font-bold">배송 내역</h2>
        <button
          onClick={() => navigate(-1)}
          className="border px-3 py-1 rounded bg-gray-100"
        >
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
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="recent">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="status">배송 상태순</option>
        </select>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr className="text-center text-sm font-semibold text-gray-700 whitespace-nowrap">
            <th className="p-3">후원자명</th>
            <th className="p-3">리워드명</th>
            <th className="p-3">수량</th>
            <th className="p-3">주소</th>
            <th className="p-3">운송장번호</th>
            <th className="p-3">발송일</th>
            <th className="p-3">상태</th>
            <th className="p-3">변경</th>
          </tr>
        </thead>
        <tbody className="text-xs">
          {currentList.map((item) => {
            const current = item.shippingStatus;
            const isHovered = hoveredBackingId === item.backingId;
            const trackingDisabled = ["CANCELED"].includes(current);
            const selectedStatus =
              pendingStatus[item.backingId] ?? item.shippingStatus;

            return (
              <>
                <tr
                  key={item.backingId + "-" + item.rewardName}
                  onClick={() =>
                    setExpandedBackingId(
                      expandedBackingId === item.backingId
                        ? null
                        : item.backingId
                    )
                  }
                  onMouseEnter={() => setHoveredBackingId(item.backingId)}
                  onMouseLeave={() => setHoveredBackingId(null)}
                  className={`border-b cursor-pointer transition-colors duration-150 ${
                    expandedBackingId === item.backingId
                      ? "bg-yellow-50"
                      : isHovered
                      ? "bg-gray-50"
                      : ""
                  }`}
                >
                  <td className="p-2 text-center">{item.nickname}</td>
                  <td className="p-2 text-center">{item.rewardName}</td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2">
                    {item.roadAddr} {item.detailAddr}
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="text"
                      value={item.trackingNum || ""}
                      onChange={(e) =>
                        setShippingList((prev) =>
                          prev.map((it) =>
                            it.backingId === item.backingId &&
                            it.rewardName === item.rewardName
                              ? { ...it, trackingNum: e.target.value }
                              : it
                          )
                        )
                      }
                      placeholder="운송장번호"
                      className="border rounded px-2 py-1 w-28 text-center"
                      onClick={(e) => e.stopPropagation()}
                      disabled={trackingDisabled}
                    />
                  </td>

                  <td className="p-2 text-center w-[90px] text-xs text-gray-700">
                    {item.shippedAt
                      ? new Date(item.shippedAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="p-2 text-center w-[90px]">
                    {renderStatusBadge(item.shippingStatus)}
                  </td>

                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          handleSelectStatus(item.backingId, e.target.value)
                        }
                        className="border rounded px-2 py-1 text-xs"
                        onClick={(e) => e.stopPropagation()}
                        disabled={current === "CANCELED"}
                      >
                        {Object.keys(statusLabel).map((status) => {
                          const disabled =
                            !allowedTransitions[current]?.includes(status) &&
                            status !== current;
                          return (
                            <option
                              key={status}
                              value={status}
                              disabled={disabled}
                            >
                              {statusLabel[status]}
                            </option>
                          );
                        })}
                      </select>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newStatus =
                            pendingStatus[item.backingId] ??
                            item.shippingStatus;
                          changeStatus(item.backingId, newStatus);
                        }}
                        className={`border rounded px-2 py-1 text-xs font-medium whitespace-nowrap ${
                          item.shippingStatus === "CANCELED"
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                        }`}
                        disabled={item.shippingStatus === "CANCELED"}
                      >
                        변경
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedBackingId === item.backingId && (
                  <tr className="bg-gray-50 border-b">
                    <td colSpan={8} className="p-4">
                      <div className="bg-white rounded-lg shadow-md p-5 text-sm text-gray-800 space-y-4">
                        <div>
                          <h3 className="font-semibold text-blue-600 mb-2">
                            👤 유저 정보
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1">
                            <p>
                              <strong>이메일:</strong> {item.email}
                            </p>
                            <p>
                              <strong>닉네임:</strong> {item.nickname}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-amber-600 mb-2">
                            🎁 리워드 정보
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1">
                            <p>
                              <strong>리워드명:</strong> {item.rewardName}
                            </p>
                            <p>
                              <strong>수량:</strong> {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-green-700 mb-2">
                            📦 배송지 정보
                          </h3>
                          <div className="space-y-1">
                            <p>
                              <strong>수취인:</strong> {item.recipient}
                            </p>
                            <p>
                              <strong>전화번호:</strong> {item.recipientPhone}
                            </p>
                            <p>
                              <strong>주소:</strong> ({item.postalCode}){" "}
                              {item.roadAddr} {item.detailAddr}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-indigo-600 mb-2">
                            🚚 배송 상태
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1">
                            <p>
                              <strong>상태:</strong>{" "}
                              {statusLabel[item.shippingStatus]}
                            </p>
                            <p>
                              <strong>운송장번호:</strong>{" "}
                              {item.trackingNum || "—"}
                            </p>
                            <p>
                              <strong>발송일:</strong>{" "}
                              {item.shippedAt
                                ? new Date(item.shippedAt).toLocaleString()
                                : "—"}
                            </p>
                            <p>
                              <strong>배송완료일:</strong>{" "}
                              {item.deliveredAt
                                ? new Date(item.deliveredAt).toLocaleString()
                                : "—"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-rose-600 mb-2">
                            💰 후원 정보
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1">
                            <p>
                              <strong>후원일:</strong>{" "}
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">
                            📘 프로젝트 정보
                          </h3>
                          <div className="space-y-1">
                            <p>
                              <strong>프로젝트명:</strong> {item.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
      {/*  페이지네이션 영역  */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="border px-3 py-1 rounded disabled:opacity-50"
        >
          이전
        </button>

        <span>
          {page} / {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="border px-3 py-1 rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}
