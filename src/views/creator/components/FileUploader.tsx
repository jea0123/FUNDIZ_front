import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { FileText, RefreshCw, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAX_SIZE = 4 * 1024 * 1024 * 1024; // 4GB
const IMAGE_ACCEPT = ["image/*"];
const DOC_ACCEPT = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];

interface Props {
    file: File | null; // 부모에서 상태 관리
    label?: string;
    previewUrl?: string;
    onSelect: (file: File | null) => void; // 선택/교체 시 부모에 전달
    onCleared?: () => void; // 제거 시 콜백
    disabled?: boolean;
}

export function useObjectUrl(file: File | null | undefined) {
    const url = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
    useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
    return url;
}

export function ThumbnailUploader({
    file,
    label = "대표 이미지 *",
    previewUrl,
    onSelect,
    onCleared,
    disabled,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const objectUrl = useObjectUrl(file) || undefined;
    const preview = objectUrl ?? previewUrl ?? undefined;

    const openPicker = useCallback(() => { if (!disabled) inputRef.current?.click(); }, [disabled]);
    const reset = useCallback(() => {
        setError(null);
        onSelect(null); // 부모 상태 비움
        if (inputRef.current) inputRef.current.value = "";
        onCleared?.();
    }, [onCleared, onSelect]);

    const validate = async (f: File) => {
        if (!IMAGE_ACCEPT.includes(f.type)) throw new Error("JPG/PNG/WebP/GIF 파일만 업로드할 수 있습니다.");
        if (f.size > MAX_SIZE) throw new Error("파일 용량은 최대 4GB까지 허용됩니다.");
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files?.length) return;
        const f = files[0];
        try {
            await validate(f);
            setError(null);
            onSelect(f);
            setDragOver(false);
        } catch (err: any) {
            setError(err?.message ?? "업로드에 실패했습니다.");
            onSelect(null);
            if (inputRef.current) inputRef.current.value = "";
            setDragOver(false);
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
                onClick={openPicker}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openPicker(); }}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                tabIndex={0}
            >
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="대표 이미지 미리보기"
                            className="mx-auto max-h-80 w-auto rounded-md object-contain"
                            onError={() => setError("이미지를 불러올 수 없습니다.")}
                        />

                        <div className="mt-3 flex items-center justify-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openPicker(); }}>
                                <RefreshCw className="mr-1 h-4 w-4" /> 교체
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); reset(); }}>
                                <Trash2 className="mr-1 h-4 w-4" /> 삭제
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-6">
                        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-600">클릭하거나 드래그하여 파일을 업로드</p>
                        <Button type="button" variant="outline" size="sm" onClick={openPicker}>파일 선택</Button>
                        <p className="mt-2 text-xs text-gray-400">이미지(JPG/PNG/WebP/GIF)</p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={IMAGE_ACCEPT.join(",")}
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export function BusinessDocUploader({
    file,
    label = "사업자등록증 첨부파일",
    previewUrl,
    onSelect,
    onCleared,
    disabled,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isImage = !!file && file.type.startsWith("image/");

    const objectUrl = useObjectUrl(file) || undefined;
    const preview = objectUrl ?? previewUrl ?? undefined;

    const openPicker = useCallback(() => { if (!disabled) inputRef.current?.click(); }, [disabled]);
    const reset = useCallback(() => {
        setError(null);
        onSelect(null);
        if (inputRef.current) inputRef.current.value = "";
        onCleared?.();
    }, [onCleared, onSelect]);

    const validate = async (f: File) => {
        if (!DOC_ACCEPT.includes(f.type)) throw new Error("PDF 또는 이미지(JPG/PNG/WebP/GIF)만 업로드할 수 있습니다.");
        if (f.size > MAX_SIZE) throw new Error("파일 용량은 최대 4GB까지 허용됩니다.");
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files?.length) return;
        const f = files[0];
        try {
            await validate(f);
            setError(null);
            onSelect(f);
            setDragOver(false);
        } catch (err: any) {
            setError(err?.message ?? "업로드에 실패했습니다.");
            onSelect(null);
            if (inputRef.current) inputRef.current.value = "";
            setDragOver(false);
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
                onClick={openPicker}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openPicker(); }}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                tabIndex={0}
            >
                {preview ? (
                    <div className="relative">
                        {isImage || preview?.match(/\.(png|jpe?g|webp|gif)(\?|#|$)/i) ? (
                            <img src={preview} alt="사업자등록증 미리보기" className="mx-auto max-h-80 w-auto rounded-md object-contain" />
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center rounded-md bg-muted/40">
                                <FileText className="h-8 w-8 mb-2 text-gray-500" />
                                <div className="text-sm text-muted-foreground">PDF 문서</div>
                            </div>
                        )}
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openPicker(); }} disabled={disabled}>
                                <RefreshCw className="mr-1 h-4 w-4" /> 교체
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); reset(); }} disabled={disabled}>
                                <Trash2 className="mr-1 h-4 w-4" /> 삭제
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-6">
                        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-600">클릭하거나 드래그하여 파일을 업로드</p>
                        <Button type="button" variant="outline" size="sm" onClick={openPicker} disabled={disabled}>
                            파일 선택
                        </Button>
                        <p className="mt-2 text-xs text-gray-400">PDF 또는 이미지(JPG/PNG/WebP/GIF)</p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={DOC_ACCEPT.join(",")}
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>
            {file && isImage && <div className="mt-2 text-xs text-gray-500 truncate">{file.name}</div>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
