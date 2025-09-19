import { useEffect, useState } from "react";
import { Megaphone, MessageCircle } from "lucide-react";
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { Notice } from '@/types/notice';
import { endpoints, getData } from "@/api/apis";
import { Button } from '@/components/ui/button';

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
            <div className="mx-auto max-w-6xl px-5 py-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">고객센터</h1>
                    <div className="hidden md:flex items-center gap-2">
                        <Input placeholder="키워드 검색" className="w-64" />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                    <TabsList className="grid grid-cols-3 w-full md:w-auto">
                        <TabsTrigger value="notice" className="flex items-center gap-1"><Megaphone className="w-4 h-4" /> 공지사항</TabsTrigger>
                        <TabsTrigger value="ticket" className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 1:1 문의</TabsTrigger>
                        <TabsTrigger value="report" className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 신고하기</TabsTrigger>
                    </TabsList>

                    <TabsContent value="notice">
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5" /> 공지사항</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{noticeDetail?.title}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>{noticeDetail?.createdAt}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>조회수 {noticeDetail?.viewCnt}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>{noticeDetail?.content}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <Button variant="outline" size="sm">
                    <a href="../">목록</a>
                </Button>
            </div>
        </div>
    );
}
