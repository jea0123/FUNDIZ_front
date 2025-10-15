import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";
import Delimiter from "@editorjs/delimiter";
import { toPublicUrl } from "@/utils/utils";

export default function ProjectDetailEditor({
    initialData,
    onChange,
    uploadUrl,
    accessToken,
}: {
    initialData?: any;
    onChange: (data: any) => void;
    uploadUrl: string;
    accessToken?: string;
}) {
    const ref = useRef<EditorJS | null>(null);

    useEffect(() => {
        ref.current = new EditorJS({
            holder: "project-detail-editor",
            autofocus: true,
            tools: {
                header: { class: Header as any, inlineToolbar: true, config: { levels: [2, 3, 4], defaultLevel: 3 } },
                paragraph: { class: Paragraph as any, inlineToolbar: true },
                delimiter: Delimiter as any,
                image: {
                    class: ImageTool as any,
                    config: {
                        captionPlaceholder: "이미지 설명(선택)",
                        uploader: {
                            async uploadByFile(file: File) {
                                const fd = new FormData();
                                fd.append("file", file);
                                const res = await fetch(uploadUrl, {
                                    method: "POST",
                                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
                                    body: fd,
                                });
                                const json = await res.json();               // { url: "https://..." }
                                return { success: 1, file: { url: toPublicUrl(json.data) } };
                            },
                        },
                    },
                },
            },
            data: initialData ?? {
                time: Date.now(),
                blocks: [
                    { type: "header", data: { text: "상세 소개", level: 3 } },
                    { type: "paragraph", data: { text: "홍보용 이미지와 설명을 여기에 구성하세요." } },
                    { type: "delimiter", data: {} },
                ],
            },
            async onChange() {
                const data = await ref.current?.save();
                if (data) onChange(data);
            },
        });
        return () => { ref.current?.destroy(); ref.current = null; };
    }, []);

    return <div id="project-detail-editor" className="border rounded-md p-4 min-h-[320px]" />;
}
