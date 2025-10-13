import { endpoints, postData } from "@/api/apis";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png"]; // JPG, PNG

interface Props {
    label?: string;
    initialUrl?: string;
    onUploaded?: (url: string) => void; // 업로드 성공 시 콜백
    onCleared?: () => void; // 삭제/초기화 시 콜백
    disabled?: boolean;
}

export function ThumbnailUploader({ label = "대표 이미지 *", initialUrl, onUploaded, onCleared, disabled, }: Props) {

    const inputRef = useRef<HTMLInputElement | null>(null);

    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState<string | undefined>(initialUrl);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setPreview(initialUrl || undefined);
    }, [initialUrl]);

    const openPicker = useCallback(() => {
        if (!disabled) inputRef.current?.click();
    }, [disabled]);

    const reset = useCallback(() => {
        setPreview(undefined);
        setError(null);
        onCleared?.();
    }, [onCleared]);

    const validate = async (file: File) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            throw new Error("JPG 또는 PNG 파일만 업로드할 수 있습니다.");
        }
        if (file.size > MAX_SIZE) {
            throw new Error("파일 용량은 최대 4MB까지 허용됩니다.");
        }
    };

    const upload = async (file: File) => {
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await postData<{ url: string }>(endpoints.uploadThumbnail, formData);
            const data = (res as any).data ?? res;
            if (!data?.url) throw new Error("업로드 응답이 올바르지 않습니다.");

            setPreview(data.url);
            onUploaded?.(data.url);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "업로드 중 오류가 발생했습니다.");
            setPreview(undefined);
        } finally {
            setUploading(false);
        }
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files?.length) return;
        const file = files[0];
        try {
            validate(file);
            const temp = URL.createObjectURL(file);
            setPreview(temp); // 낙관적 미리보기
            await upload(file);
            URL.revokeObjectURL(temp); // 메모리 정리
        } catch (err: any) {
            setError(err.message);
            setPreview(undefined);
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
    }, [disabled]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setDragOver(true);
    }, [disabled]);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    }, []);

    return (
        <div>
            <Label className="mb-2 block">{label}</Label>

            <div
                className={clsx(
                    "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                    dragOver ? "border-blue-400 bg-blue-50/40" : "border-gray-300",
                    disabled && "opacity-60"
                )}
                role="button"
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
            >
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="대표 이미지 미리보기"
                            className="mx-auto max-h-80 w-auto rounded-md object-contain"
                            onError={() => {
                                setError("이미지를 불러올 수 없습니다. 경로를 확인해 주세요.");
                            }}
                        />

                        <div className="mt-3 flex items-center justify-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={openPicker} disabled={uploading || disabled}>
                                <RefreshCw className="mr-1 h-4 w-4" /> 교체
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={reset} disabled={uploading || disabled}>
                                <Trash2 className="mr-1 h-4 w-4" /> 삭제
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-6">
                        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-600">이미지를 드래그하거나 클릭하여 업로드</p>
                        <Button type="button" variant="outline" size="sm" onClick={openPicker} disabled={uploading || disabled}>
                            파일 선택
                        </Button>
                        <p className="mt-2 text-xs text-gray-400">최대 4MB, JPG/PNG</p>
                    </div>
                )}

                {uploading && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/70">
                        <Loader2 className="mb-3 h-6 w-6 animate-spin" />
                        <p className="text-sm">업로드 중...</p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {/* 에러 메시지 */}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}