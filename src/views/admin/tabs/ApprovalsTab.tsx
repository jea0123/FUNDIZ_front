import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReviewListDto } from "@/types/admin";
import { endpoints, getData } from "@/api/apis";
import { useSearchParams } from "react-router-dom";
import { formatDate } from "@/utils/utils";

function useQueryState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "20", 20));

    const setParam = (k: string, v?: string) => {
        const next = new URLSearchParams(searchParams);

        if (v && v.length) {
            next.set(k, v);
        } else {
            next.delete(k);
        }
        setSearchParams(next, { replace: true });
    };

    const setPage = (p: number) => setParam("page", String(p));
    const setSize = (s: number) => setParam("size", String(s));

    return { page, size, setPage, setSize };
}

export function ApprovalsTab() {
    const [reviewList, setReviewList] = useState<ReviewListDto[]>([]);
    const [loadingReview, setLoadingReview] = useState(false);

    const { page, size } = useQueryState();

    const reviewData = async () => {
        setLoadingReview(true);
        const response = await getData(endpoints.getReviewList(page, size));
        if (response.status === 200) {
            setReviewList(response.data);
        }
    };

    useEffect(() => {
            reviewData().finally(() => setLoadingReview(false));
    }, [page, size]);

    const handleApproveProject = (projectId: string) => alert(`프로젝트 ${projectId}가 승인되었습니다.`);
    const handleRejectProject = (projectId: string) => {
        const reason = prompt("반려 사유를 입력하세요:");
        if (reason) alert(`프로젝트 ${projectId}가 반려되었습니다.\n사유: ${reason}`);
    };

    if (!reviewList || loadingReview) {
        return (
            <p>불러오는 중…</p>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>프로젝트 심사 관리</CardTitle>
                <CardDescription>창작자가 제출한 프로젝트를 심사하고 승인/반려를 결정하세요.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {reviewList.map((r) => (
                        <Card key={r.projectId}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold mb-2">{r.title}</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                            <div>크리에이터: {r.creatorName}</div>
                                            <div>카테고리: {r.ctgrName}</div>
                                            <div>세부카테고리: {}</div>
                                            <div>목표금액: {r.goalAmount}원</div>
                                            <div>요청일: {formatDate(r.requestedAt)}</div>
                                        </div>
                                        <Badge variant="secondary">심사 대기중</Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />상세보기</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleApproveProject(r.projectId)}><CheckCircle className="h-4 w-4 mr-1" />승인</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleRejectProject(r.projectId)}><XCircle className="h-4 w-4 mr-1" />반려</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}