// import { useEffect, useRef } from "react";
// import EditorJS from "@editorjs/editorjs";
// import Header from "@editorjs/header";
// import Paragraph from "@editorjs/paragraph";
// import ImageTool from "@editorjs/image";
// import Delimiter from "@editorjs/delimiter";
// import { toPublicUrl } from "@/utils/utils";

// export default function ProjectDetailEditor({
//     initialData,
//     onChange,
//     uploadUrl,
//     accessToken,
// }: {
//     initialData?: any;
//     onChange: (data: any) => void;
//     uploadUrl: string;
//     accessToken?: string;
// }) {
//     const ref = useRef<EditorJS | null>(null);

//     useEffect(() => {
//         ref.current = new EditorJS({
//             holder: "project-detail-editor",
//             autofocus: true,
//             tools: {
//                 header: { class: Header as any, inlineToolbar: true, config: { levels: [2, 3, 4], defaultLevel: 3 } },
//                 paragraph: { class: Paragraph as any, inlineToolbar: true },
//                 delimiter: Delimiter as any,
//                 image: {
//                     class: ImageTool as any,
//                     config: {
//                         captionPlaceholder: "이미지 설명(선택)",
//                         uploader: {
//                             async uploadByFile(file: File) {
//                                 const fd = new FormData();
//                                 fd.append("file", file);
//                                 const res = await fetch(uploadUrl, {
//                                     method: "POST",
//                                     headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
//                                     body: fd,
//                                 });
//                                 const json = await res.json();               // { url: "https://..." }
//                                 return { success: 1, file: { url: toPublicUrl(json.data) } };
//                             },
//                         },
//                     },
//                 },
//             },
//             data: initialData ?? {
//                 time: Date.now(),
//                 blocks: [
//                     { type: "header", data: { text: "상세 소개", level: 3 } },
//                     { type: "paragraph", data: { text: "홍보용 이미지와 설명을 여기에 구성하세요." } },
//                     { type: "delimiter", data: {} },
//                 ],
//             },
//             async onChange() {
//                 const data = await ref.current?.save();
//                 if (data) onChange(data);
//             },
//         });
//         return () => { ref.current?.destroy(); ref.current = null; };
//     }, []);

//     return <div id="project-detail-editor" className="border rounded-md p-4 min-h-[320px]" />;
// }
import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";
import SimpleImage from "@editorjs/simple-image";
import Delimiter from "@editorjs/delimiter";
import NestedList from "@editorjs/nested-list";
import Checklist from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";
import InlineCode from "@editorjs/inline-code";
import Marker from "@editorjs/marker";
import Table from "@editorjs/table";
import Embed from "@editorjs/embed";
import Warning from "@editorjs/warning";
import LinkTool from "@editorjs/link";
import AttachesTool from "@editorjs/attaches";
import RawTool from "@editorjs/raw";
import Underline from "@editorjs/underline";
import DragDrop from "editorjs-drag-drop";
import Undo from "editorjs-undo";
import Columns from "@calumk/editorjs-columns";
import ColumnsAlt from "@aaaalrashd/editorjs-columns";
import ToggleBlock from "editorjs-toggle-block";
import { Accordion as AccordionTool } from "editorjs-accordion";
import ButtonTool from "editorjs-button";
import * as Layout from "editorjs-layout";
import ColorPicker from "editorjs-color-picker";
import Katex from "editorjs-katex";
import HeaderWithAnchor from "editorjs-header-with-anchor";
import { toPublicUrl } from "@/utils/utils";

type EJBlock = { type: string; data: any };
const ALLOWED = new Set([
    "header", "paragraph", "delimiter", "list", "checklist", "quote", "code", "inlineCode", "marker", "underline",
    "table", "embed", "warning", "raw", "attaches", "image", "simpleImage",
    "columns", "columnsPro", "layout", "toggle", "accordion", "button", "katex", "headerAnchor", "color", "linkTool"
]);

function sanitize(initial?: { blocks?: EJBlock[] }) {
    const inBlocks = initial?.blocks ?? [];
    const out: EJBlock[] = [];
    for (const b of inBlocks) {
        if (!ALLOWED.has(b.type)) continue;
        const d = b.data ?? {};
        switch (b.type) {
            case "paragraph": {
                let t = d.text ?? d.content ?? "";
                if (Array.isArray(t)) t = t.join("");
                if (t == null) t = "";
                if (typeof t !== "string") t = String(t);
                d.text = t;
                break;
            }
            case "header":
                if (typeof d.text !== "string") d.text = "";
                if (![1, 2, 3, 4, 5, 6].includes(d.level)) d.level = 3;
                break;
            case "katex":
                d.text = d.text ?? d.latex ?? d.formula ?? "";
                break;
            case "list":
                d.style = d.style ?? "unordered";
                d.items = Array.isArray(d.items) ? d.items : [];
                break;
            case "table":
                d.withHeadings = !!d.withHeadings;
                d.content = Array.isArray(d.content) ? d.content : [];
                break;
            case "embed":
                if (typeof d.service !== "string" || typeof d.source !== "string" || typeof d.embed !== "string") {
                    continue;
                }
                break;
            case "image":
            case "simpleImage":
                if (typeof d.caption !== "string") d.caption = "";
                if (typeof d.file !== "object" || typeof d.file.url !== "string") {
                    continue;
                }
                break;
            case "attaches":
                if (typeof d.caption !== "string") d.caption = "";
                if (typeof d.file !== "object" || typeof d.file.url !== "string") {
                    continue;
                }
                break;
            default:
        }
        if (b.type === "paragraph" && typeof d.text !== "string") continue;
        if (b.type === "katex" && !d.text) continue;
        out.push({ type: b.type, data: d });
    }
    return { time: Date.now(), blocks: out };
}


type Props = { initialData?: any; onChange: (data: any) => void; uploadUrl: string; accessToken?: string; linkEndpoint?: string; };

export default function ProjectDetailEditor({ initialData, onChange, uploadUrl, accessToken, linkEndpoint, }: Props) {
    const ref = useRef<EditorJS | null>(null);

    useEffect(() => {
        const auth = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

        const mod = (m: any, named?: string) => (named && m?.[named]) || m?.default || m;
        const add = (acc: any, key: string, m: any, opt?: any, named?: string) => {
            const Klass = mod(m, named);
            if (typeof Klass === "function" || typeof Klass === "object") {
                acc[key] = opt ? { class: Klass, ...opt } : Klass;
            } else {
                console.warn(`[EditorJS] skip tool "${key}" due to invalid export`);
            }
        };

        const tools: any = {};
        add(tools, "header", Header, { inlineToolbar: true, config: { levels: [2, 3, 4], defaultLevel: 3 } });
        add(tools, "paragraph", Paragraph, { inlineToolbar: true });
        add(tools, "delimiter", Delimiter);
        add(tools, "list", NestedList, { inlineToolbar: true });
        add(tools, "checklist", Checklist, { inlineToolbar: true });
        add(tools, "quote", Quote, { inlineToolbar: true, config: { quotePlaceholder: "인용문", captionPlaceholder: "출처" } });
        add(tools, "code", CodeTool);
        add(tools, "inlineCode", InlineCode);
        add(tools, "marker", Marker);
        add(tools, "underline", Underline);
        add(tools, "table", Table, { inlineToolbar: true, config: { rows: 2, cols: 3 } });
        add(tools, "embed", Embed, { config: { services: { youtube: true, vimeo: true, twitter: true, codepen: true } } });
        add(tools, "warning", Warning, { inlineToolbar: true, config: { titlePlaceholder: "주의", messagePlaceholder: "내용" } });
        add(tools, "raw", RawTool);

        add(tools, "attaches", AttachesTool, {
            config: {
                uploader: {
                    async uploadByFile(file: File) {
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch(uploadUrl, { method: "POST", headers: auth, body: fd });
                        const json = await res.json();
                        return { success: 1, file: { url: toPublicUrl(json.data), name: file.name, size: file.size } };
                    },
                },
            },
        });

        add(tools, "image", ImageTool, {
            config: {
                captionPlaceholder: "이미지 설명(선택)",
                uploader: {
                    async uploadByFile(file: File) {
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch(uploadUrl, { method: "POST", headers: auth, body: fd });
                        const json = await res.json();
                        return { success: 1, file: { url: toPublicUrl(json.data) } };
                    },
                },
            },
        });
        add(tools, "simpleImage", SimpleImage);

        if (linkEndpoint) add(tools, "linkTool", LinkTool, { config: { endpoint: linkEndpoint } });

        add(tools, "columns", Columns);
        add(tools, "columnsPro", ColumnsAlt);
        add(tools, "layout", Layout);
        add(tools, "toggle", ToggleBlock, { toolbox: { title: "토글" } });
        add(tools, "accordion", AccordionTool, { toolbox: { title: "아코디언" } });
        add(tools, "button", ButtonTool, { inlineToolbar: true });
        add(tools, "katex", Katex, { inlineToolbar: true, config: { katexOptions: {} } });
        add(tools, "headerAnchor", HeaderWithAnchor);
        add(tools, "color", ColorPicker, { config: { colorCollections: ["#000", "#f00", "#0a0", "#00f", "#ff9500", "#6b7280"] } });

        ref.current = new EditorJS({
            holder: "project-detail-editor",
            autofocus: true,
            tools,
            i18n: {
                messages: {
                    ui: {
                        toolbar: { toolbox: { Add: "블록 추가", Filter: "필터" } },
                        inlineToolbar: { converter: { "Convert to": "형식 변경" } },
                        blockTunes: { toggler: { "Click to tune": "설정 열기", "or drag": "또는 드래그" } },
                    },
                    toolNames: {
                        "Text": "텍스트",
                        "Paragraph": "텍스트",
                        "Heading": "제목",
                        "List": "목록",
                        "Checklist": "체크리스트",
                        "Quote": "인용구",
                        "Code": "코드",
                        "Inline code": "인라인 코드",
                        "Marker": "형광펜",
                        "Underline": "밑줄",
                        "Delimiter": "구분선",
                        "Table": "표",
                        "Embed": "임베드",
                        "Warning": "경고",
                        "Raw HTML": "원시 HTML",
                        "Link": "링크 미리보기",
                        "Attaches": "첨부파일",
                        "Attachment": "첨부파일",
                        "Image": "이미지",
                        "Simple Image": "간단 이미지",
                        "Columns": "컬럼",
                        "Columns Pro": "컬럼 Pro",
                        "Layout": "레이아웃",
                        "Toggle": "토글",
                        "Accordion": "아코디언",
                        "Button": "버튼",
                        "KaTeX": "수식",
                        "Header with anchor": "앵커 헤더",
                        "Color": "색상",
                    },
                },
            },
            onReady: () => {
                if (ref.current) {
                    try { new DragDrop(ref.current); } catch { }
                    try { new Undo({ editor: ref.current }); } catch { }
                }
            },
            data:
                sanitize(initialData ?? {
                    time: Date.now(),
                    blocks: [
                        { type: "header", data: { text: "상세 소개", level: 3 } },
                        { type: "paragraph", data: { text: "이미지, 동영상, 표, 코드, 수식, 컬럼, 토글, 아코디언 등을 사용하세요." } },
                        { type: "delimiter", data: {} },
                    ],
                }),
            async onChange() {
                const data = await ref.current?.save();
                if (data) {
                    data.blocks = data.blocks.map((b) => {
                        if (b.type === "paragraph") {
                            let t = b.data?.text ?? b.data?.content ?? "";
                            if (Array.isArray(t)) t = t.join("");
                            if (t == null) t = "";
                            if (typeof t !== "string") t = String(t);
                            return { ...b, data: { ...b.data, text: t } };
                        }
                        return b;
                    });
                    onChange(data);
                }
            }
        });
        return () => {
            ref.current?.destroy();
            ref.current = null;
        };
    }, []);

    return <div id="project-detail-editor" className="border rounded-md p-4 min-h-[320px]" />;
}
