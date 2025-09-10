import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Eye, CheckCircle, XCircle } from "lucide-react";

const mockPendingProjects = [
    { id: "1", title: "혁신적인 스마트 워치 개발", creator: "테크스타트업", category: "테크/가전", targetAmount: 5000000, submittedDate: "2024-02-20", status: "pending" },
    { id: "2", title: "친환경 패션 브랜드 론칭", creator: "그린패션", category: "패션/뷰티", targetAmount: 3000000, submittedDate: "2024-02-19", status: "pending" },
];

export function ApprovalsTab() {
    const handleApproveProject = (projectId: string) => alert(`프로젝트 ${projectId}가 승인되었습니다.`);
    const handleRejectProject = (projectId: string) => {
        const reason = prompt("반려 사유를 입력하세요:");
        if (reason) alert(`프로젝트 ${projectId}가 반려되었습니다.\n사유: ${reason}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>프로젝트 승인 관리</CardTitle>
                <CardDescription>크리에이터가 제출한 프로젝트를 검토하고 승인/반려를 결정하세요.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockPendingProjects.map((project) => (
                        <Card key={project.id}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold mb-2">{project.title}</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                            <div>크리에이터: {project.creator}</div>
                                            <div>카테고리: {project.category}</div>
                                            <div>목표금액: {project.targetAmount.toLocaleString()}원</div>
                                            <div>제출일: {project.submittedDate}</div>
                                        </div>
                                        <Badge variant="secondary">심사 대기중</Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />상세보기</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleApproveProject(project.id)}><CheckCircle className="h-4 w-4 mr-1" />승인</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleRejectProject(project.id)}><XCircle className="h-4 w-4 mr-1" />반려</Button>
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