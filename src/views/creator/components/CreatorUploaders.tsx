import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { FileText, RefreshCw, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAX_SIZE = 4 * 1024 * 1024 * 1024; // 4GB
const IMAGE_ACCEPT = ["image/jpeg", "image/png"];
const DOC_ACCEPT = ["application/pdf", "image/jpeg", "image/png"];

interface Props {
    file: File | null; // 부모에서 상태 관리
    label?: string;
    previewUrl?: string;
    onSelect: (file: File | null) => void; // 선택/교체 시 부모에 전달
    onCleared?: () => void; // 제거 시 콜백
    disabled?: boolean;
    id?: string;
    required?: boolean;
}

function useObjectUrl(file: File | null | undefined) {
    const url = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
    useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
    return url;
}

async function sniffMime(file: File): Promise<"jpeg" | "png" | "webp" | "pdf" | "unknown"> {
    const buf = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buf);

    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return "jpeg";
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return "png";
    // PDF: 25 50 44 46 2D ("%PDF-")
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2D) return "pdf";

    return "unknown";
}

export function ThumbnailUploader({
    file,
    label = "대표 이미지 *",
    previewUrl,
    onSelect,
    onCleared,
    disabled,
    id = "thumbnail",
    required = false,
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

    const validateThumbnail = async (f: File) => {
        if (!IMAGE_ACCEPT.includes(f.type)) {
            throw new Error("JPEG 또는 PNG 이미지만 업로드할 수 있습니다.");
        }
        const kind = await sniffMime(f);
        if (kind !== "jpeg" && kind !== "png") {
            throw new Error("파일 형식이 손상되었거나 지원되지 않습니다.");
        }
        if (f.size <= 0 || f.size > MAX_SIZE) {
            throw new Error("파일 용량은 최대 4GB까지 허용됩니다.");
        }
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files?.length) return;
        const f = files[0];
        try {
            await validateThumbnail(f);
            setError(null);
            onSelect(f);
            setDragOver(false);
            if (inputRef.current) inputRef.current.value = ""; // 같은 파일 재선택 허용
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
            <div
                className={clsx(
                    "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                    dragOver ? "border-blue-400 bg-blue-50/40" : "border-gray-300",
                    disabled && "opacity-60"
                )}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
            >
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="선택한 대표 이미지 미리보기"
                            className="mx-auto max-h-80 w-auto rounded-md object-contain"
                            onError={() => setError("이미지를 불러올 수 없습니다.")}
                        />

                        <div className="mt-3 flex items-center justify-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => openPicker()} disabled={disabled}>
                                <RefreshCw className="mr-1 h-4 w-4" /> 교체
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => reset()} disabled={disabled}>
                                <Trash2 className="mr-1 h-4 w-4" /> 삭제
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-6">
                        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-600">클릭하거나 드래그하여 파일을 업로드</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => openPicker()} disabled={disabled}>
                            파일 선택
                        </Button>
                        <p className="mt-2 text-xs text-gray-400">JPEG / PNG</p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    id={id}
                    type="file"
                    accept={IMAGE_ACCEPT.join(",")}
                    className="sr-only"
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={disabled}
                    required={required}
                />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export function BusinessDocUploader({
    file,
    label = "사업자등록증 (사업자라면 필수 첨부)",
    previewUrl,
    onSelect,
    onCleared,
    disabled,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imgFailed, setImgFailed] = useState(false); // 이미지 로딩 실패 여부

    const isImage = !!file && file.type.startsWith("image/");
    const objectUrl = useObjectUrl(file) || undefined;
    const preview = objectUrl ?? previewUrl ?? undefined;

    const openPicker = useCallback(() => { if (!disabled) inputRef.current?.click(); }, [disabled]);
    const reset = useCallback(() => {
        setError(null);
        setImgFailed(false);
        onSelect(null);
        if (inputRef.current) inputRef.current.value = "";
        onCleared?.();
    }, [onCleared, onSelect]);

    const validateBizDoc = async (f: File) => {
        const isPdf = f.type === "application/pdf";
        const isImg = IMAGE_ACCEPT.includes(f.type);
        if (!isPdf && !isImg) {
            throw new Error("PDF 또는 JPEG/PNG 형식만 업로드할 수 있습니다.");
        }

        const kind = await sniffMime(f);
        if (isPdf && kind !== "pdf") {
            throw new Error("파일 형식이 손상되었거나 지원되지 않습니다.");
        }
        if (isImg && kind !== "jpeg" && kind !== "png") {
            throw new Error("파일 형식이 손상되었거나 지원되지 않습니다.");
        }
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files?.length) return;
        const f = files[0];
        try {
            await validateBizDoc(f);
            setError(null);
            setImgFailed(false);
            onSelect(f);
            setDragOver(false);
            if (inputRef.current) inputRef.current.value = ""; // 같은 파일 재선택 허용
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

    const showImg = !!preview && (isImage || !imgFailed);

    return (
        <div>
            <Label className="mb-2 block">{label}</Label>

            <div
                className={clsx(
                    "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                    dragOver ? "border-blue-400 bg-blue-50/40" : "border-gray-300",
                    disabled && "opacity-60"
                )}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
            >
                {preview ? (
                    <div className="relative">
                        {showImg ? (
                            <img
                                src={preview}
                                alt="사업자등록증 미리보기"
                                className="mx-auto max-h-80 w-auto rounded-md object-contain"
                                onError={() => setImgFailed(true)} // 이미지 실패 시 PDF 뷰로 폴백
                            />
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center rounded-md bg-muted/40">
                                <FileText className="h-8 w-8 mb-2 text-gray-500" />
                                <div className="text-sm text-muted-foreground">PDF 문서</div>
                            </div>
                        )}
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => openPicker()} disabled={disabled}>
                                <RefreshCw className="mr-1 h-4 w-4" /> 교체
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => reset()} disabled={disabled}>
                                <Trash2 className="mr-1 h-4 w-4" /> 삭제
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-6">
                        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-600">클릭하거나 드래그하여 파일을 업로드</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => openPicker()} disabled={disabled}>
                            파일 선택
                        </Button>
                        <p className="mt-2 text-xs text-gray-400">PDF 또는 이미지</p>
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
