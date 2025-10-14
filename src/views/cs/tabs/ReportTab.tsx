import { useState } from "react";
import { Siren, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { endpoints, postData } from "@/api/apis";
import type { ReportAddRequest } from "@/types/report";
import { useNavigate } from "react-router-dom";

export function ReportTab() {
    const navigate = useNavigate();
    const tempUserId = 4
    const [rptAdd, setRptAdd] = useState<ReportAddRequest>({
        userId : tempUserId,
        target : 26,
        reason : "",
        reportDate : new Date(Date.now()),
        reportStatus : "RECEIVED",
        reportType : ""
    });

    const handleRptAdd = async () => {
            const response = await postData(endpoints.addReport(tempUserId), rptAdd);
            if (response.status === 200) {
              alert("신고가 등록되었습니다.");
            } else {
              alert("신고 등록 실패");
              return false;
            }

            navigate('/user/myreports');
          };

    return (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><Siren className="w-5 h-5" /> 신고하기</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                            <Label className="mb-1 block">유형</Label>
                            <Select value={rptAdd.reportType} onValueChange={e => setRptAdd({ ...rptAdd, reportType: e })}>
                                <SelectTrigger><SelectValue placeholder="분류 선택" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FRAUD">사기/허위정보</SelectItem>
                                    <SelectItem value="COPYRIGHT">지식재산권 침해</SelectItem>
                                    <SelectItem value="ILLEGAL">불법/금지된 상품</SelectItem>
                                    <SelectItem value="OBSCENE">음란/선정적/폭력적 콘텐츠</SelectItem>
                                    <SelectItem value="PRIVACY">개인정보 침해</SelectItem>
                                    <SelectItem value="DUPLICATE">타 플랫폼 동시 판매</SelectItem>
                                    <SelectItem value="UNCONTACTABLE">연락 두절</SelectItem>
                                    <SelectItem value="POLICY">정책 위반</SelectItem>
                                    <SelectItem value="OTHER">기타</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-1 block">신고 사유</Label>
                            <Textarea
                                value={rptAdd.reason}
                                onChange={e => setRptAdd({ ...rptAdd, reason: e.target.value })}
                                rows={20}
                                placeholder="신고 사유를 자세히 입력해주세요" />
                        </div>
                        <div className="flex justify-content-end">
                            <Button onClick={handleRptAdd} className="flex items-center gap-2"><Send className="w-4 h-4" /> 제출</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
    );
}

