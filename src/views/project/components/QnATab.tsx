import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/ui/tabs";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
      DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { endpoints, getData, postData } from "@/api/apis";
import { formatDate } from '@/utils/utils';
import type { Qna, SearchQnaParams, QnaAddRequest } from "@/types/qna";

// ========= 공용 타입 (DB 스키마 기반) =========

const tempProjectId = 71;

export type Reply = {
    replyId: number;
    userId?: number;
    content: string;
    isSecret: 'Y' | 'N';
    createdAt: string;
    updatedAt?: string | null;
    isDeleted: 'Y' | 'N';
    deletedAt?: string | null;
};


function useQueryState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "10", 10));
    const perGroup = Math.max(1, parseInt(searchParams.get("perGroup") || "10", 10));

    const setParam = (patch: Record<string, string | undefined>) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(patch).forEach(([k, v]) => {
            if (v && v.length) next.set(k, v);
            else next.delete(k);
        });
        setSearchParams(next, { replace: true });
    };

    const setPage = (p: number) => setParam({ page: String(p) });
    const setSize = (s: number) => setParam({ size: String(s) });
    const setPerGroup = (g: number) => setParam({ size: String(g) });

    return { page, size, perGroup, setPage, setSize, setPerGroup };
}

function useQna(params: SearchQnaParams) {
    const { page, size, perGroup } = params;
    const [items, setItems] = useState<Qna[]>([]);
    const [total, setTotal] = useState(0);

    const url = useMemo(() => {
        return endpoints.getQnaListOfPJ(tempProjectId, params);
    }, [page, size, perGroup]);

    useEffect(() => {( async () => {
                const {status, data} = await getData(url);
                if (status === 200) {
                    setItems(data.items);
                    setTotal(data.totalElements);
                }
            })();
        }, [url]);

    console.log(items);

    return { items, total };

}

export function Pagination({ page, size, perGroup, total, onPage }: { page: number; size: number; perGroup: number; total: number; onPage: (p: number) => void }) {
    const lastPage = Math.max(1, Math.ceil(total / size));

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>이전</Button>
        <span className="text-sm text-gray-600">{page} / {lastPage}</span>
        <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>다음</Button>
        </div>
    );
}

export function QnATab() {

    const { page, size, perGroup, setPage } = useQueryState();
    const { items, total } = useQna({ page, size, perGroup });

    const [openQna, setOpenQna] = useState<string | undefined>(undefined);

    return (
        <div>
            <div>
                        <Card>
                            <CardContent>
                                <Accordion type="single" collapsible value={openQna} onValueChange={setOpenQna}>
                                    <div className="grid grid-cols-12 gap-2 w-full items-center">
                                        <div className="col-span-8">내용</div>
                                        <div className="col-span-2">작성자</div>
                                        <div className="col-span-2">등록일</div>
                                    </div>
                                    {items.map(qna => (
                                        <AccordionItem key={qna.qnaId} value={String(qna.qnaId)}>
                                            <AccordionTrigger>
                                                <div className="grid grid-cols-12 gap-2 w-full items-center">
                                                    <div className="col-span-8 font-medium truncate">{qna.content}</div>
                                                    <div className="col-span-2 font-medium truncate">{qna.userId}</div>
                                                    <div className="col-span-2 text-xs text-zinc-500">{formatDate(qna.createdAt)}</div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="rounded-xl border border-zinc-200 p-4 bg-white">
                                                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">{qna.content}</p>
                            
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Pagination page={page} size={size} perGroup={perGroup} total={total} onPage={setPage} />
                                        <QnaAddModal/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
            </div>
        </div>
    );
}

export function QnaAddModal(){
  const tempUserId = 24;

  const { projectId: projectIdParam } = useParams<{ projectId: string }>();
      const projectId = useMemo<number | null>(() => {
          const num = Number(projectIdParam);
          return Number.isFinite(num) && num > 0 ? num : null;
      }, [projectIdParam]);

  const [project, setProject] = useState<Qna | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [qnaAdd, setQnaAdd] = useState<QnaAddRequest>({
    projectId : tempProjectId,
    userId : tempUserId,
    content : "",
    createdAt : new Date(Date.now())
  });

  const handleAddQna = async () => {
    const url = endpoints.addQuestion(projectId, tempUserId);
    console.log(url);
    const response = await postData(url, qnaAdd);
    console.log(qnaAdd);
    if (response.status === 200) {
      alert("문의사항이 등록되었습니다.");
      setIsAddDialogOpen(false);
    } else {
      alert("문의사항 등록 실패");
    }
  };


  return (
    <div className="mt-4">
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-20">QnA 등록</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QnA 등록</DialogTitle>
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
