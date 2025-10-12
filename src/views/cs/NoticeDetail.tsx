import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import type { Notice } from '@/types/notice';
import { endpoints, getData } from "@/api/apis";
import { Button } from '@/components/ui/button';
import { Pencil } from "lucide-react";

export function NoticeDetailPage() {
    const { noticeId } = useParams();

    const [activeTab, setActiveTab] = useState("notice");

    const [noticeDetail, setNoticeDetail] = useState<Notice>();

    const [loadingNoticeDetail, setLoadingNoticeDetail] = useState(false);

    const noticeData = async () => {
        setLoadingNoticeDetail(true);
        const response = await getData(endpoints.getNoticeDetail(Number(noticeId)));
        if (response.status === 200) {
            setNoticeDetail(response.data);
        }
    };

    useEffect(() => {
            noticeData().finally(() => setLoadingNoticeDetail(false));
        }, []);

    return (
        <div className="min-h-screen bg-zinc-50">
            <Card>
                <CardContent>
                    <div className="text-2xl font-bold">{noticeDetail?.title}</div>
                    <div className="pt-3 text-sm pb-1">{noticeDetail?.createdAt}</div>
                    <div className="text-sm pb-1">조회수 {noticeDetail?.viewCnt}</div>
                    <div className="py-10 text-sm">{noticeDetail?.content}</div>
                </CardContent>
            </Card>
            <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm">
                    <a href="../notice">목록</a>
                </Button>
            </div>
        </div>
    );
}
