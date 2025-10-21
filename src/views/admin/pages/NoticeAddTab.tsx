import { useState, useRef } from "react";
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
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const navigate = useNavigate();

    const [noticeAdd, setNoticeAdd] = useState<NoticeAddRequest>({
        title : "",
        content : "",
        viewCnt : 0,
        createdAt : new Date(Date.now())
    });

    const onFileChange = (file?: File) => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
    };

    const handleNoticeAdd = async () => {
            const response = await postData(endpoints.addNotice, noticeAdd);
            if (response.status === 200) {
              alert("공지사항이 등록되었습니다.");
            } else {
              alert("공지사항 등록 실패");
              return false;
            }

            navigate('../notice');
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
                        <div>
                            <Label className="mb-1 block">파일 첨부</Label>
                            <Input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                const file = e.target.files?.[0];
                                onFileChange(file);
                                field.onChange(e.target.files);
                                }}
                            />
                        </div>
                        <div className="flex justify-content-end">
                            <Button onClick={handleNoticeAdd} className="flex items-center gap-2"><Send className="w-4 h-4" /> 제출</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
    );
}

