import { useState } from "react";
import { Siren, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { endpoints, postData } from "@/api/apis";
import type { ReportAddRequest } from "@/types/report";

export function ReportTab() {
    const tempUserId = 4
    const [rptAdd, setRptAdd] = useState<ReportAddRequest>({
        userId : tempUserId,
        target : 26,
        reason : "",
        reportDate : new Date(Date.now()),
        reportStatus : "RECEIVED",
        reportType : "OTHER"
    });

    const handleRptAdd = async () => {
            const response = await postData(endpoints.addReport(tempUserId), rptAdd);
            if (response.status === 200) {
              alert("신고가 등록되었습니다.");
            } else {
              alert("신고 등록 실패");
              return false;
            }
          };

    return (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Siren className="w-5 h-5" /> 신고하기</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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

