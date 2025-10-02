import { useState } from "react";
import { MessagesSquare, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { endpoints, postData } from "@/api/apis";
import type { IqrAddRequest } from "@/types/inquiry";

export function InquiryTab() {
    const tempUserId = 4;

    const [inqAdd, setInqAdd] = useState<IqrAddRequest>({
        userId: tempUserId,
        title : "",
        content : "",
        createdAt : new Date(Date.now()),
        isCanceled : "N",
        ctgr : "GENERAL",
        isAnswer : "N"
    });

    const handleInqAdd = async () => {
            const response = await postData(endpoints.addInquiry(tempUserId), inqAdd);
            if (response.status === 200) {
              alert("문의사항이 등록되었습니다.");
            } else {
              alert("문의사항 등록 실패");
              return false;
            }
          };

    return (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessagesSquare className="w-5 h-5" /> 1:1 문의</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                            <Label className="mb-1 block">제목</Label>
                            <Input
                                type="text"
                                value={inqAdd.title}
                                onChange={e => setInqAdd({ ...inqAdd, title: e.target.value })}
                                placeholder="제목을 입력하세요"
                            />
                        </div>
                        <div>
                            <Label className="mb-1 block">내용</Label>
                            <Textarea
                                value={inqAdd.content}
                                onChange={e => setInqAdd({ ...inqAdd, content: e.target.value })}
                                rows={20}
                                placeholder="문의 사항을 입력하세요" />
                        </div>
                        <div className="flex justify-content-end">
                            <Button onClick={handleInqAdd} className="flex items-center gap-2"><Send className="w-4 h-4" /> 제출</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
    );
}

