import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { postData, endpoints } from "@/api/apis";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

type Props = {
    open: boolean;
    projectId: number;
    projectTitle?: string;
    onClose: () => void;
    onPosted?: () => void;
};

export default function NewsModal({ open, projectId, projectTitle, onClose, onPosted }: Props) {
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = useMemo(() => !!content.trim(), [content]);

    const submitNews = useCallback(async () => {
        if (!open || !isValid || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            const payload = { content: content.trim() };
            await postData(endpoints.postCreatorNews(projectId), payload);

            onPosted?.(); // 목록/배지 갱신 필요 시
            onClose();
            setContent("");
        } catch (e: any) {
            setError(e?.message ?? "등록에 실패했습니다. 잠시 후 다시 시도하세요.");
        } finally {
            setSubmitting(false);
        }
    }, [open, isValid, submitting, content, projectId, onPosted, onClose]);

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (submitting) return;
                if (!next) onClose();
            }}
        >
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>새소식 등록</DialogTitle>
                    <DialogDescription className="truncate">
                        {projectTitle}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="news-content">본문 *</Label>
                        <Textarea
                            id="news-content"
                            rows={10}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="새소식 내용을 입력하세요."
                            disabled={submitting}
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={onClose} disabled={submitting}>닫기</Button>
                    <Button onClick={submitNews} disabled={!isValid || submitting}>
                        {submitting ? "등록중" : "등록"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
