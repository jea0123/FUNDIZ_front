import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { postData, endpoints } from "@/api/apis";

type Props = {
    open: boolean;
    projectId: number;
    projectTitle?: string;
    onClose: () => void;
    onPosted?: () => void;
};

export default function NewsSheet({ open, projectId, projectTitle, onClose, onPosted }: Props) {
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

            onPosted?.();     // 목록/배지 갱신 필요 시
            onClose();        // 시트 닫기
            setContent(""); // 초기화
        } catch (e: any) {
            setError(e?.message ?? "등록에 실패했습니다. 잠시 후 다시 시도하세요.");
        } finally {
            setSubmitting(false);
        }
    }, [open, isValid, submitting, content, projectId, onPosted, onClose]);

    return (
        <div className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground">{projectTitle}</div>

            <div className="space-y-2">
                <Label htmlFor="news-content">본문 *</Label>
                <Textarea
                    id="news-content"
                    rows={10}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="새소식 내용을 입력하세요."
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>닫기</Button>
                <Button onClick={submitNews} disabled={!isValid || submitting}>
                    {submitting ? "등록중" : "등록"}
                </Button>
            </div>
        </div>
    );
}
