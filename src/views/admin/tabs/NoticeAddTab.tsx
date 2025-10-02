import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { endpoints, postData } from "@/api/apis";
import type { NoticeAddRequest } from "@/types/notice";
import { useNavigate } from "react-router-dom";

export function NoticeAddTab() {

    const navigate = useNavigate();

    const [noticeAdd, setNoticeAdd] = useState<NoticeAddRequest>({
        title : "",
        content : "",
        viewCnt : 0,
        createdAt : new Date(Date.now())
    });

    const handleNoticeAdd = async () => {
            const response = await postData(endpoints.addNotice, noticeAdd);
            if (response.status === 200) {
              alert("공지사항이 등록되었습니다.");
            } else {
              alert("공지사항 등록 실패");
              return false;
            }

            navigate('?tab=notice');
          };

    return (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">공지사항 등록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                            <Label className="mb-1 block">제목</Label>
                            <Input
                                type="text"
                                value={noticeAdd.title}
                                onChange={e => setNoticeAdd({ ...noticeAdd, title: e.target.value })}
                                placeholder="제목을 입력하세요"
                            />
                        </div>
                        <div>
                            <Label className="mb-1 block">내용</Label>
                            <Textarea
                                value={noticeAdd.content}
                                onChange={e => setNoticeAdd({ ...noticeAdd, content: e.target.value })}
                                rows={20}
                                placeholder="내용을 입력하세요" />
                        </div>
                        <div className="flex justify-content-end">
                            <Button onClick={handleNoticeAdd} className="flex items-center gap-2"><Send className="w-4 h-4" /> 제출</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
    );
}

