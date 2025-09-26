import { endpoints, getData, postData } from "@/api/apis";
import FundingLoader from "@/components/FundingLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProjectVerifyDetail, ProjectVerifyList } from "@/types/admin";
import { formatDate } from "@/utils/utils";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ApprovalCard({ project, projectData }: { project: ProjectVerifyList; projectData: () => Promise<void> }) {
    const navigate = useNavigate();

    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    const [reason, setReason] = useState("");
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [targetProject, setTargetProject] = useState< { id: number; title: string } | null>(null);

    const handleApproveButton = async (projectId: number, title: string) => {
        try {
            setApprovingId(projectId);
            if (!window.confirm(`[${title}]\n프로젝트를 승인하시겠습니까?`)) {
                return;
            }
            const response = await postData(endpoints.approveProject(projectId));
            if (response.status === 200) {
                alert(`[${title}] 승인되었습니다.`);
                await projectData();
            }
        } catch (err) {
            console.log(err);
            alert(`[${title}] 승인 실패했습니다.`);
        } finally {
            setApprovingId(null);
        }
    };

    const handleRejectButton = async (projectId: number, title: string) => {
        try {
            setRejectingId(projectId);
            const response = await postData(endpoints.rejectProject(projectId), { rejectedReason: reason });
            if (response.status === 200) {
                alert(`[${title}] 반려되었습니다.\n사유: ${reason}`);
                await projectData();
                setOpenRejectModal(false);
            }
        } catch (err) {
            console.log(err);
            alert(`[${title}] 반려 실패했습니다.`);
        } finally {
            setRejectingId(null);
        }
    };

    return (
        <>
        <Card className="pb-4">
            <CardContent>
                <h4 className="font-semibold mb-4">{project.title}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>창작자명: {project.creatorName}</div>
                    <div>카테고리: {project.ctgrName} &gt; {project.subctgrName ?? "-"}</div>
                    <div>목표금액: {project.goalAmount}원</div>
                    <div>심사요청일: {formatDate(project.requestedAt)}</div>
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button
                    variant="outline" size="sm"
                    onClick={() => navigate(`/admin/verify/&{project.projectId}`)}
                >
                    <Eye className="h-4 w-4 mr-1" />상세보기
                </Button>
                <Button 
                    variant="default" size="sm"
                    onClick={() => handleApproveButton(project.projectId, project.title)}
                    disabled={approvingId === project.projectId}
                >
                    <CheckCircle className="h-4 w-4 mr-1"/>{approvingId === project.projectId ? "승인중" : "승인"}
                </Button>
                <Button
                    variant="destructive" size="sm"
                    onClick={() => {
                        setTargetProject({ id: project.projectId, title: project.title });
                        setReason("");
                        setOpenRejectModal(true);
                    }}
                >
                    <XCircle className="h-4 w-4 mr-1" />반려
                </Button>
            </CardFooter>
        </Card>

        <Dialog open={openRejectModal} onOpenChange={setOpenRejectModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>프로젝트 반려</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <p>[{targetProject?.title}]</p>
                    <Input value={reason} placeholder="프로젝트 반려 사유를 입력하세요." onChange={(e) => setReason(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpenRejectModal(false)}>취소</Button>
                    <Button
                        variant="destructive"
                        disabled={!reason.trim() || rejectingId === targetProject?.id}
                        onClick={() => handleRejectButton(targetProject!.id, targetProject!.title)}
                    >
                        {rejectingId === targetProject?.id ? "반려중" : "확인"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}

export function ApprovalDetail() {
    const navigate = useNavigate();

    const { projectId } = useParams<{ projectId: string }>();

    const [ detail, setDetail ] = useState<ProjectVerifyDetail>();
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<unknown>(null);

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
    }, []);

    if (loading || !detail) return <FundingLoader />;
    if (error) return <p className="text-red-600">프로젝트를 불러오지 못했습니다.</p>;

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">프로젝트 심사 상세</h2>
            <div className="space-y-4">
                <Card>
                    <CardContent>
                        <h3 className="text-lg font-semibold mb-2">{detail.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">창작자: {detail.creatorName} | 상태: {detail.projectStatus}</p>
                        <p className="mb-2">{detail.content}</p>
                        <p className="mb-2">목표금액: {detail.goalAmount}원</p>
                        <p className="mb-2">기간: {formatDate(detail.startDate)} ~ {formatDate(detail.endDate)}</p>
                        <p className="mb-2">카테고리: {detail.ctgrName} &gt; {detail.subctgrName}</p>
                        <p className="mb-2">사업자번호: {detail.businessNumb}</p>
                        <p className="mb-2">이메일: {detail.email}</p>
                        <p className="mb-2">전화번호: {detail.phone}</p>
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">태그</h4>
                            <div className="flex flex-wrap gap-2">
                                {detail.tagList.map((tag) => (
                                    <span key={tag.tagId} className="px-2 py-1 bg-gray-200 rounded-full text-sm">{tag.tagName}</span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">리워드</h4>
                            <div className="space-y-2">
                                {detail.rewardList.map((r) => {
                                const hasRemain = r.remain != null;
                                const isSoldOut = hasRemain && r.remain === 0;
                                const isLow = hasRemain && r.remain > 0 && r.remain <= 5;

                                return (
                                    <div key={r.rewardId} className="p-2 border border-gray-300 rounded">
                                        <p className="font-semibold">{r.rewardName}</p>
                                        <p>{r.rewardContent}</p>
                                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                                            <span>가격: {r.price}원</span>
                                            {hasRemain && (
                                                <Badge
                                                    variant={isSoldOut ? "destructive" : isLow ? "secondary" : "default"}
                                                    className="rounded-full"
                                                    aria-label={isSoldOut ? "품절" : `재고 ${r.remain}개`}
                                                    title={isSoldOut ? "품절" : `재고 ${r.remain}개`}
                                                >
                                                    {isSoldOut ? "품절" : `재고 ${r.remain}개`}
                                                </Badge>
                                            )}
                                        </div>
                                        {r.deliveryDate != null && (
                                            <p className="text-sm text-gray-600">
                                                배송예정일: {formatDate(r.deliveryDate)}
                                            </p>
                                        )}
                                    </div>
                                );
                                })}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="w-fit mx-auto">
                            <Button variant="ghost" className="leading-none min-w-0 w-auto" onClick={() => navigate(-1)}>뒤로</Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}