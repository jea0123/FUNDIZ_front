import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

const mockReports = [
    { id: "1", type: "comment", content: "부적절한 댓글 내용", reporter: "사용자A", target: "프로젝트 댓글", date: "2024-02-21", status: "pending", reason: "욕설/비방" },
    { id: "2", type: "project", content: "허위/과장 광고 의심", reporter: "사용자B", target: "스마트 디바이스 프로젝트", date: "2024-02-20", status: "reviewing", reason: "허위광고" },
];

export function ReportsTab() {
    const handleResolveReport = (reportId: string, action: string) => alert(`신고 ${reportId}가 ${action} 처리되었습니다.`);

    return (
        <Card>
            <CardHeader>
                <CardTitle>신고 관리</CardTitle>
                <CardDescription>사용자가 신고한 콘텐츠를 검토하고 적절한 조치를 취하세요.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex space-x-2">
                    <Select>
                        <SelectTrigger className="w-40"><SelectValue placeholder="신고 유형" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="spam">스팸</SelectItem>
                            <SelectItem value="inappropriate">부적절한 내용</SelectItem>
                            <SelectItem value="fake">허위정보</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className="w-40"><SelectValue placeholder="처리 상태" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="pending">대기중</SelectItem>
                            <SelectItem value="reviewing">검토중</SelectItem>
                            <SelectItem value="resolved">처리완료</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    {mockReports.map((report) => (
                        <Card key={report.id}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Badge variant="outline">{report.reason}</Badge>
                                            <Badge variant={report.status === "pending" ? "destructive" : "secondary"}>
                                                {report.status === "pending" ? "대기중" : report.status === "reviewing" ? "검토중" : "처리완료"}
                                            </Badge>
                                        </div>
                                        <h4 className="font-medium mb-1">{report.target}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{report.content}</p>
                                        <div className="text-xs text-gray-500">신고자: {report.reporter} | 신고일: {report.date}</div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />확인</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleResolveReport(report.id, "승인")}>승인</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleResolveReport(report.id, "삭제")}>삭제</Button>
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