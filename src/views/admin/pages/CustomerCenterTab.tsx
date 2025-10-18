import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

export function CustomerCenterTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>고객센터</CardTitle>
                <CardDescription>문의/공지/FAQ 관리 영역입니다. (추후 API 연동 예정)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 text-gray-500">고객센터 모듈이 여기에 표시됩니다.</div>
            </CardContent>
        </Card>
    );
}