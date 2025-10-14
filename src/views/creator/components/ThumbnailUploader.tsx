import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { RefreshCw, Trash2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const MAX_SIZE = 4 * 1024 * 1024 * 1024; //4GB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface Props {
    label?: string;
    onCleared?: () => void; // 삭제/초기화 시 콜백
    disabled?: boolean;
}

export function ThumbnailUploader({ label = "대표 이미지 *", onCleared, disabled, }: Props) {

    const inputRef = useRef<HTMLInputElement | null>(null);

    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

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

    const fileToDataUrl = (f: File) =>
        new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result));
            fr.onerror = reject;
            fr.readAsDataURL(f);
        });

    const handleFiles = async (files: FileList | null) => {
        if (!files?.length) return;
        const file = files[0];
        try {
            validate(file);
            setPreview(await fileToDataUrl(file)); // 낙관적 미리보기
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
                            <Button type="button" variant="outline" size="sm" onClick={openPicker}>
                                <RefreshCw className="mr-1 h-4 w-4" /> 교체
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={reset}>
                                <Trash2 className="mr-1 h-4 w-4" /> 삭제
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-6">
                        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-600">클릭하거나 드래그하여 파일을 업로드</p>
                        <Button type="button" variant="outline" size="sm" onClick={openPicker}>
                            파일 선택
                        </Button>
                        <p className="mt-2 text-xs text-gray-400">이미지(JPG/PNG)</p>
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