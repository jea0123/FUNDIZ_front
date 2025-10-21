import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { endpoints, getData, postData } from "@/api/apis";
import type { NoticeUpdateRequest } from "@/types/notice";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

export function NoticeUpdtTab() {

    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const navigate = useNavigate();

    const query = useQuery();
    const noticeId = query.get('id');

    const [noticeUpdt, setNoticeUpdt] = useState<NoticeUpdateRequest>({
        noticeId: Number(noticeId),
        adId: 10,
        title: "",
        content: ""
    });

    const onFileChange = (file?: File) => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
    };

    const fetchNotice = async () => {
        const response = await getData(endpoints.getNoticeDetail(Number(noticeId)));
        if (response.status === 200) {
            setNoticeUpdt(response.data);
        }
        console.log(response.data);
    };

    useEffect(() => {
        fetchNotice();
    }, []);

    const handleNoticeUpdt = async () => {
        const response = await postData(endpoints.updateNotice(Number(noticeId)), noticeUpdt);
        if (response.status === 200) {
            alert("공지사항이 수정되었습니다.");
        } else {
            alert("공지사항 수정 실패");
            return false;
        }

        navigate('../notice');
    };

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">공지사항 수정</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                        <Label className="mb-1 block">제목</Label>
                        <Input
                            type="text"
                            value={noticeUpdt.title}
                            onChange={e => setNoticeUpdt({ ...noticeUpdt, title: e.target.value })}
                            placeholder="제목을 입력하세요"
                        />
                    </div>
                    <div>
                        <Label className="mb-1 block">내용</Label>
                        <Textarea
                            value={noticeUpdt.content}
                            onChange={e => setNoticeUpdt({ ...noticeUpdt, content: e.target.value })}
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
                        <Button onClick={handleNoticeUpdt} className="flex items-center gap-2"><Send className="w-4 h-4" /> 등록</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

