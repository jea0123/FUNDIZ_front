import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

export function UsersTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>회원 관리</CardTitle>
                <CardDescription>회원 정보를 조회하고 계정 상태를 관리하세요.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex space-x-2">
                    <Input placeholder="회원 검색 (이름, 이메일)" className="max-w-sm" />
                    <Select>
                        <SelectTrigger className="w-40"><SelectValue placeholder="계정 상태" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="active">활성</SelectItem>
                            <SelectItem value="suspended">정지</SelectItem>
                            <SelectItem value="withdrawn">탈퇴</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>검색</Button>
                </div>
                <div className="text-center py-8 text-gray-500">회원 목록이 여기에 표시됩니다.</div>
            </CardContent>
        </Card>
    );
}