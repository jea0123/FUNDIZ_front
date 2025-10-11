import { useState } from "react";
import { Siren, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

            navigate('/user/mypage', {state : { tab : 'myreports'}});
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
                            <select
                                id="select-option"
                                value={rptAdd.reportType}
                                onChange={e => setRptAdd({ ...rptAdd, reportType: e.target.value })}
                                >
                                <option value="">분류</option>
                                <option value="FRAUD">사기/허위정보</option>
                                <option value="COPYRIGHT">지식재산권 침해</option>
                                <option value="ILLEGAL">불법/금지된 상품</option>
                                <option value="OBSCENE">음란/선정적/폭력적 콘텐츠</option>
                                <option value="PRIVACY">개인정보 침해</option>
                                <option value="DUPPLICATE">타 플랫폼 동시 판매</option>
                                <option value="UNCONTACTABLE">연락 두절</option>
                                <option value="POLICY">정책 위반</option>
                                <option value="OTHER">기타</option>
                            </select>
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

