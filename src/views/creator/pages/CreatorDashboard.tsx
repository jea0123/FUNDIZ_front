import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreatorDashboard() {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">프로젝트 관리</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>총 프로젝트</CardTitle>
                    </CardHeader>
                    <CardContent>1,247</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>총 후원금</CardTitle>
                    </CardHeader>
                    <CardContent>₩154.2억</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>총 후원받은 수</CardTitle>
                    </CardHeader>
                    <CardContent>34,567</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>프로젝트 승인 대기</CardTitle>
                    </CardHeader>
                    <CardContent>23</CardContent>
                </Card>
            </div>
            {/* 그래프 자리 */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>월별 프로젝트 현황</CardTitle>
                </CardHeader>
                <CardContent>📊 차트 컴포넌트 자리</CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>카테고리별 분포</CardTitle>
                </CardHeader>
                <CardContent>🟢 파이차트 자리</CardContent>
            </Card>
        </div>
    )
}