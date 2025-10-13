import { endpoints, getData } from '@/api/apis';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { BackingMyPageDetail } from '@/types/backing';
import { currency } from '@/utils/utils';
import React, { useEffect, useState } from 'react'

const tempUserId = 1; // 임시 유저 아이디, 추후 로그인 기능 구현 시 변경 필요

export default function BackingTab() {
    const statusLabel: Record<string, string> = {
        PENDING: '결제 대기',
        COMPLETED: '결제 완료',
        CANCELED: '결제 취소',
        FAILED: '결제 실패',
        REFUNDED: '환불',
    };
    const [backingProjects, setBackingProjects] = useState<BackingMyPageDetail[]>();

    const [backingPage, setBackingPage] = useState(1);
    const itemsPerPage = 5;

    const [backingSearch, setBackingSearch] = useState('');

    const [isBackingDetailOpen, setIsBackingDetailOpen] = useState(false);
    const [selectedBacking, setSelectedBacking] = useState<BackingMyPageDetail | null>(null);

    const MypageBackingList = async () => {
        const response = await getData(endpoints.getBackingList(tempUserId));
        if (response.status === 200) {
            setBackingProjects(response.data);
        }
    };

    useEffect(() => {
        MypageBackingList();
    }, []);

    const fetchBackingdetail = async (userId: number, projectId: number, rewardId: number) => {
        const response = await getData(endpoints.getBackingDetail(userId, projectId, rewardId));
        if (response.status === 200) {
            setSelectedBacking(response.data as BackingMyPageDetail);
        }
    };

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <CardTitle>후원한 프로젝트 ({backingProjects?.length}개)</CardTitle>
                <input
                    type="text"
                    placeholder="프로젝트 또는 리워드 검색"
                    className="border rounded px-3 py-1 text-sm w-48"
                    value={backingSearch}
                    onChange={(e) => {
                        setBackingSearch(e.target.value);
                        setBackingPage(1); // 검색 시 1페이지로 이동
                    }}
                />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {backingProjects
                        ?.filter((b) => b.backingReward.backingProject.title.toLowerCase().includes(backingSearch.toLowerCase()) || b.backingReward.rewardName.toLowerCase().includes(backingSearch.toLowerCase()))
                        .slice((backingPage - 1) * itemsPerPage, backingPage * itemsPerPage)
                        .map((backingList, index) => (
                            <div key={`${backingList.backingReward.backingProject.projectId}-${index}`} className="flex items-center space-x-4 p-4 border rounded-lg">
                                <ImageWithFallback src={backingList.backingReward.backingProject.thumbnail} alt={backingList.backingReward.backingProject.title} className="w-16 h-16 object-cover rounded" />
                                <div className="flex-1">
                                    <h4 className="font-medium mb-1">{backingList.backingReward.backingProject.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{backingList.backingReward.rewardName}</p>
                                    <div className="flex items-center space-x-4 text-sm">
                                        <span>후원금액: {currency(backingList.price)}원</span>
                                        <Badge variant={backingList.backing.backingStatus === 'PENDING' ? 'default' : 'secondary'}>
                                            <span>{statusLabel[backingList.backing.backingStatus] ?? '알 수 없음 '}</span>
                                        </Badge>
                                        <span className="text-gray-500">{backingList.backingReward.deliveryDate ? new Date(backingList.backingReward.deliveryDate).toISOString().split('T')[0] : ''}</span>
                                    </div>
                                </div>
                                <Dialog open={isBackingDetailOpen} onOpenChange={setIsBackingDetailOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                fetchBackingdetail(tempUserId, backingList.backingReward.backingProject.projectId, backingList.backingReward.rewardId);
                                                setIsBackingDetailOpen(true);
                                            }}
                                        >
                                            상세보기
                                        </Button>
                                    </DialogTrigger>
                                </Dialog>
                                {selectedBacking && (
                                    <DialogContent className="w-screen h-screen min-w-350 max-w-none p-6">
                                        <DialogHeader>
                                            <DialogTitle>{selectedBacking.backingReward.backingProject.title}</DialogTitle>
                                            <DialogDescription>후원 상세 내역을 확인하세요</DialogDescription>
                                        </DialogHeader>
                                        <div className="h-full overflow-y-auto space-y-6">
                                            <ImageWithFallback src={selectedBacking.backingReward.backingProject.thumbnail} alt={selectedBacking.backingReward.backingProject.title} className="w-24 h-24 object-cover rounded" />

                                            <div>
                                                <h2 className="font-semibold text-lg">{selectedBacking.backingReward.backingProject.title}</h2>
                                                <p className="text-sm text-gray-500">
                                                    달성금액 {currency(selectedBacking.backingReward.backingProject.currAmount ?? 0)}원 / 목표 {currency(selectedBacking.backingReward.backingProject.goalAmount ?? 0)}원
                                                </p>
                                            </div>
                                        </div>

                                        <section className="mt-4">
                                            <h3 className="font-medium mb-2">후원 정보</h3>
                                            <div className="text-sm space-y-1">
                                                <p>후원 상태 : {statusLabel[selectedBacking.backing.backingStatus.trim()] ?? '알 수 없음'}</p>
                                                <p>후원일 : {new Date(selectedBacking.backing.createdAt).toISOString().split('T')[0]}</p>
                                                <p>프로젝트 종료일 : {new Date(selectedBacking.backingReward.backingProject.endDate).toISOString().split('T')[0]}</p>
                                                <p>총 후원 금액 : {currency(selectedBacking.backing.amount)}원</p>
                                            </div>
                                        </section>

                                        <section className="mt-4">
                                            <h3 className="font-medium mb-2">선물 정보</h3>
                                            <div className="text-sm space-y-1">
                                                <p>리워드명 : {selectedBacking.backingReward.rewardName}</p>
                                                <p>수량 : {selectedBacking.quantity}개</p>
                                                <p>리워드 금액 : {currency(selectedBacking.price)}원</p>
                                                <p>배송 예정일 : {selectedBacking.backingReward.deliveryDate ? new Date(selectedBacking.backingReward.deliveryDate).toISOString().split('T')[0] : '미정'}</p>
                                            </div>
                                        </section>

                                        <section className="mt-4">
                                            <h3 className="font-medium mb-2">결제 정보</h3>
                                            <div className="text-sm space-y-1">
                                                <p>결제 수단 : </p>
                                                <p>결제 금액 : </p>
                                                <p>결제 상태 : </p>
                                                <p></p>
                                            </div>
                                        </section>

                                        <div className="absolute bottom-4 right-4">
                                            <DialogClose asChild>
                                                <Button variant="outline">닫기</Button>
                                            </DialogClose>
                                        </div>
                                    </DialogContent>
                                )}
                            </div>
                        ))}
                </div>
                {/* 페이지네이션 */}
                {backingProjects && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <Button size="sm" variant="outline" disabled={backingPage === 1} onClick={() => setBackingPage(backingPage - 1)}>
                            이전
                        </Button>

                        {Array.from({
                            length: Math.max(1, Math.ceil(backingProjects.length / itemsPerPage)),
                        }).map((_, idx) => (
                            <Button key={idx} size="sm" variant={backingPage === idx + 1 ? 'default' : 'outline'} onClick={() => setBackingPage(idx + 1)}>
                                {idx + 1}
                            </Button>
                        ))}

                        <Button size="sm" variant="outline" disabled={backingPage === Math.max(1, Math.ceil(backingProjects.length / itemsPerPage))} onClick={() => setBackingPage(backingPage + 1)}>
                            다음
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
