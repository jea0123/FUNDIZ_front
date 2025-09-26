import { endpoints, getData, postData } from "@/api/apis";
import FundingLoader from "@/components/FundingLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProjectVerifyDetail, ProjectVerifyList } from "@/types/admin";
import { formatDate } from "@/utils/utils";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function ApprovalDetail() {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    const [ detail, setDetail ] = useState<ProjectVerifyDetail>();
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<unknown>(null);

    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [reason, setReason] = useState("");

    const projectData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getData(endpoints.getProjectVerifyDetail(Number(projectId)));
            if (response.status === 200) {
                setDetail(response.data);
            }
        } catch (err) {
            setError(err);
            setDetail(undefined);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!projectId) return;
        projectData();
    }, [projectId]);

    const handleApprove = async () => {
        if (!detail || !projectId) return;
        try {
            if (!window.confirm(`[${detail.title}]\n프로젝트를 승인하시겠습니까?`)) return;
            setApproving(true);
            const response = await postData(endpoints.approveProject(Number(projectId)));
            if (response.status === 200) {
                alert(`[${detail.title}] 승인되었습니다.`);
                navigate(-1);
            }
        } catch (err) {
            console.log(err);
            alert(`[${detail.title}] 승인 실패했습니다.`);
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async () => {
        if (!detail || !projectId) return;
        try {
            setRejecting(true);
            const response = await postData(endpoints.rejectProject(Number(projectId)), { rejectedReason: reason });
            if (response.status === 200) {
                alert(`[${detail.title}] 반려되었습니다.\n사유: ${reason}`);
                setOpenRejectModal(false);
                navigate(-1);
            }
        } catch (err) {
            console.log(err);
            alert(`[${detail.title}] 반려 실패했습니다.`);
        } finally {
            setRejecting(false);
        }
    };

    if (loading || !detail) return <FundingLoader />;
    if (error) return <p className="text-red-600">프로젝트를 불러오지 못했습니다.</p>;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>프로젝트 심사 상세</CardTitle>
                    <CardDescription className="leading-relaxed">
                        창작자가 제출한 프로젝트의 상세 정보를 확인하고 승인/반려를 결정하세요.
                    </CardDescription>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                            <span className="text-gray-500 mr-2">기간</span> 
                            {formatDate(detail.startDate)} ~ {formatDate(detail.endDate)}
                        </div>
                        <div>
                            <span className="text-gray-500 mr-2">목표금액</span>
                            {detail.goalAmount.toLocaleString()}원
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <section>
                        <h3 className="text-lg font-semibold mb-6">{detail.title}</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            창작자: <span className="font-medium text-gray-800">{detail.creatorName}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            카테고리: {detail.ctgrName} &gt; {detail.subctgrName ?? "-"}
                        </p>
                        <div className="prose prose-sm max-w-none text-gray-800">
                            <p className="whitespace-pre-line">{detail.content}</p>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div className="rounded-lg border bg-white p-3">
                                <div className="text-gray-500 mb-1">사업자번호</div>
                                <div className="font-medium">{detail.businessNum}</div>
                            </div>
                            <div className="rounded-lg border bg-white p-3">
                                <div className="text-gray-500 mb-1">이메일</div>
                                <div className="font-medium break-all">{detail.email}</div>
                            </div>
                            <div className="rounded-lg border bg-white p-3">
                                <div className="text-gray-500 mb-1">전화번호</div>
                                <div className="font-medium">{detail.phone}</div>
                            </div>
                        </div>
                    </section>

                    <div className="border-t" />

                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">태그</h4>
                            <span className="text-xs text-gray-500">총 {detail.tagList.length}개</span>
                        </div>
                        {detail.tagList.length ? (
                            <div className="flex fled-wrap gap-2">
                                {detail.tagList.map((t) => (
                                    <span key={t.tagId} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                        #{t.tagName}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">등록된 태그가 없습니다.</p>
                        )}
                    </section>

                    <div className="border-t" />

                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">리워드</h4>
                            <span className="text-xs text-gray-500">총 {detail.rewardList.length}개</span>
                        </div>

                        {detail.rewardList.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {detail.rewardList.map((r) => {
                                    const hasRemain = r.remain != null;
                                    const isSoldOut = hasRemain && r.remain === 0;
                                    const isLow = hasRemain && r.remain! > 0 && r.remain! <= 5;

                                    return (
                                        <div key={r.rewardId} className="rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="font-semibold">{r.rewardName}</p>
                                                <span className="text-sm font-medium">{r.price.toLocaleString()}원</span>
                                            </div>
                                            <p  className="mt-1 text-sm text-gray-700">{r.rewardContent}</p>

                                            <div className="mt-2 flex items-center gap-2">
                                                {hasRemain && (
                                                    <span
                                                        className={[
                                                            "px-2 py-0.5 rounded-full text-xs",
                                                            isSoldOut
                                                                ? "bg-rose-100 text-rose-800"
                                                                : isLow
                                                                ? "bg-amber-100 text-amber-800"
                                                                : "bg-gray-100 text-gray-700",
                                                            ].join(" ")}
                                                        aria-label={isSoldOut ? "품절" : `재고 ${r.remain}개`}
                                                        title={isSoldOut ? "품절" : `재고 ${r.remain}개`}
                                                    >
                                                        {isSoldOut ? "품절" : `재고 ${r.remain}개`}
                                                    </span>
                                                )}
                                                {r.deliveryDate != null && (
                                                    <span className="text-xs text-gray-500">
                                                        배송예정일: {formatDate(r.deliveryDate)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">등록된 리워드가 없습니다.</p>
                        )}
                    </section>
                </CardContent>
            </Card>
            
            <div className="sticky bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" className="leading-none min-w-0 w-auto" onClick={() => navigate(-1)}>뒤로</Button>
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleApprove} disabled={approving}>
                            <CheckCircle className="h-4 w-4 mr-1" />{approving ? "승인중" : "승인"}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => { setReason(""); setOpenRejectModal(true); }}>
                            <XCircle className="h-4 w-4 mr-1" />반려
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={openRejectModal} onOpenChange={setOpenRejectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>프로젝트 반려</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-700">[{detail.title}]</p>
                        <Input
                            value={reason}
                            placeholder="프로젝트 반려 사유를 입력하세요."
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpenRejectModal(false)}>취소</Button>
                        <Button variant="destructive" disabled={!reason.trim() || rejecting} onClick={handleReject}>
                            {rejecting ? "반려중" : "확인"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}