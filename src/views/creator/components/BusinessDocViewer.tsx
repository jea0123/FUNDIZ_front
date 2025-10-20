import { ExternalLink, Paperclip } from "lucide-react";

export function BusinessDocViewer({ src, fileName }: { src?: string | null; fileName?: string }) {
    if (!src) {
        return <p className="text-sm text-muted-foreground">등록된 파일이 없습니다.</p>;
    }

    const ext = getExt(src);
    const isPdf = ext === "pdf";
    const isImg = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    {isPdf ? <Paperclip className="h-4 w-4" /> : isImg ? <Paperclip className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
                    <a href={src} target="_blank" rel="noreferrer" className="underline underline-offset-2 break-all">
                        {fileName || getFileName(src)}
                    </a>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs"
                        title="새 탭에서 열기"
                    >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> 열기
                    </a>
                </div>
            </div>

            {isPdf ? (
                <object data={src} type="application/pdf" className="w-full h-[520px] rounded-md border">
                    <p className="text-sm p-4">
                        PDF 미리보기를 지원하지 않는 브라우저입니다.{" "}
                    </p>
                </object>
            ) : isImg ? (
                <div className="rounded-md border overflow-hidden">
                    <img src={src} alt="사업자등록증" className="w-full max-h-[560px] object-contain bg-muted" />
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">미리보기를 지원하지 않는 형식입니다.</p>
            )}
        </div>
    );
}

function getExt(url: string): string {
    try {
        const q = url.split("?")[0];
        const m = q.match(/\.([a-zA-Z0-9]+)$/);
        return (m?.[1] || "").toLowerCase();
    } catch {
        return "";
    }
}

function getFileName(url: string): string {
    try {
        const q = url.split("?")[0];
        return decodeURIComponent(q.substring(q.lastIndexOf("/") + 1)) || "document";
    } catch {
        return "document";
    }
}