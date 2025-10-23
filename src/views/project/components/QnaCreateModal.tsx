import { endpoints, postData } from "@/api/apis";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { QnaAddRequest } from "@/types/qna";
import { MessageSquareMore } from "lucide-react";
import { useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";

export function QnaCreateModal() {
    const navigate = useNavigate();

    const [cookie] = useCookies();
    const { projectId: projectIdParam } = useParams<{ projectId: string }>();
    const projectId = useMemo<number | null>(() => {
        const num = Number(projectIdParam);
        return Number.isFinite(num) && num > 0 ? num : null;
    }, [projectIdParam]);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [qnaAdd, setQnaAdd] = useState<QnaAddRequest>({
        projectId: Number(projectId),
        content: "",
        createdAt: new Date(Date.now())
    });

    const handleAddQna = async () => {
        const url = endpoints.addQuestion(Number(projectId));
        const response = await postData(url, qnaAdd, cookie.accessToken);
        if (response.status === 200) {
            alert("문의사항이 등록되었습니다.");
            setIsAddDialogOpen(false);
            navigate('/user/myqna');
        } else {
            alert("문의사항 등록 실패");
        }
    };

    return (
        <div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                        <MessageSquareMore className="w-4 h-4 mr-1" /> 문의하기
                        </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Q&A 질문 등록</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        프로젝트에 관한 문의 사항을 적어주세요.
                    </DialogDescription>
                    <div className="space-y-3">
                        <Textarea
                            className="w-full border p-2 rounded"
                            value={qnaAdd.content}
                            onChange={(e) =>
                                setQnaAdd({ ...qnaAdd, content: e.target.value })
                            }
                            rows={20}
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">취소</Button>
                        </DialogClose>
                        <Button onClick={handleAddQna}>추가</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}