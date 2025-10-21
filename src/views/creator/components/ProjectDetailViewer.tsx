// import React from "react";
// import { toPublicUrl } from "@/utils/utils";

// type EditorBlock =
//     | { type: "header"; data?: { text?: string; level?: number } }
//     | { type: "paragraph"; data?: { text?: string } }
//     | { type: "image"; data?: { file?: { url?: string }; url?: string; caption?: string } }
//     | { type: "delimiter"; data?: Record<string, never> }
//     | { type: "list"; data?: { style?: "ordered" | "unordered"; items?: string[] } }
//     | { type: "quote"; data?: { text?: string; caption?: string } }
//     | { type: "table"; data?: { content?: string[][] } }
//     | { type: string; data?: any };

// type EditorData = { blocks?: EditorBlock[] } | string | null | undefined;

// function toBlocks(input: EditorData): EditorBlock[] {
//     if (!input) return [];
//     try {
//         const obj = typeof input === "string" ? JSON.parse(input) : input;
//         if (Array.isArray(obj)) return obj as EditorBlock[];
//         return Array.isArray((obj as any)?.blocks) ? (obj as any).blocks : [];
//     } catch {
//         return [];
//     }
// }

// const rich = (html?: string) =>
//     React.createElement("span", { dangerouslySetInnerHTML: { __html: html ?? "" } });

// export function ProjectDetailViewer({ data }: { data: EditorData }) {
//     console.debug("contentBlocks shape:", data);
//     const blocks = toBlocks(data);
//     if (!blocks.length) {
//         return React.createElement(
//             "p",
//             { className: "text-sm text-muted-foreground" },
//             "등록된 프로젝트 소개가 없습니다."
//         );
//     }

//     const children = blocks.map((b, i) => renderBlock(b, i));
//     return React.createElement("div", { className: "space-y-4" }, ...children);
// }

// function renderBlock(b: EditorBlock, i: number): React.ReactElement | null {
//     const key = `${b.type}-${i}`;

//     switch (b.type) {
//         case "header": {
//             const level = clampInt(Number(b.data?.level) || 3, 1, 6);
//             const tag = (`h${level}` as keyof HTMLElementTagNameMap);
//             return React.createElement(tag, { key, className: "font-semibold leading-snug mt-6" }, rich(b.data?.text));
//         }

//         case "paragraph":
//             return React.createElement(
//                 "p",
//                 { key, className: "leading-relaxed" },
//                 rich(b.data?.text)
//             );

//         case "image": {
//             const raw = b.data?.file?.url || b.data?.url || "";
//             const src = toPublicUrl(raw);
//             const img = React.createElement("img", {
//                 key: `${key}-img`,
//                 src,
//                 className: "rounded-lg border max-h-[560px] w-auto object-contain",
//                 alt: b.data?.caption || "image",
//             });
//             const caption = b.data?.caption
//                 ? React.createElement(
//                     "figcaption",
//                     { key: `${key}-cap`, className: "text-xs text-muted-foreground" },
//                     rich(b.data?.caption)
//                 )
//                 : null;
//             return React.createElement("figure", { key, className: "space-y-2" }, img, caption);
//         }

//         case "delimiter":
//             return React.createElement("hr", { key, className: "my-6" });

//         case "list": {
//             const ordered = (b.data?.style ?? "unordered") === "ordered";
//             const tag = (ordered ? "ol" : "ul") as "ol" | "ul";
//             const items: string[] = Array.isArray(b.data?.items) ? (b.data!.items as string[]) : [];
//             const liChildren = items.map((it: string, idx: number) =>
//                 React.createElement("li", { key: `${key}-${idx}` }, rich(it))
//             );
//             return React.createElement(tag, { key, className: "list-inside ml-4 space-y-1" }, ...liChildren);
//         }

//         case "quote": {
//             const body = React.createElement("div", { key: `${key}-body` }, rich(b.data?.text));
//             const cap = b.data?.caption
//                 ? React.createElement("div", { key: `${key}-cap`, className: "text-xs mt-1" }, rich(b.data?.caption))
//                 : null;
//             return React.createElement(
//                 "blockquote",
//                 { key, className: "border-l-4 pl-3 italic text-muted-foreground" },
//                 body,
//                 cap
//             );
//         }

//         case "table": {
//             const rows: string[][] = Array.isArray(b.data?.content) ? (b.data!.content as string[][]) : [];
//             const trEls = rows.map((row: string[], rIdx: number) =>
//                 React.createElement(
//                     "tr",
//                     { key: `${key}-r-${rIdx}` },
//                     ...row.map((cell: string, cIdx: number) =>
//                         React.createElement(
//                             "td",
//                             { key: `${key}-c-${cIdx}`, className: "border px-2 py-1 align-top" },
//                             rich(cell)
//                         )
//                     )
//                 )
//             );
//             const tbody = React.createElement("tbody", null, ...trEls);
//             const table = React.createElement("table", { className: "w-full border-collapse" }, tbody);
//             return React.createElement("div", { key, className: "overflow-x-auto" }, table);
//         }

//         default:
//             return null;
//     }
// }

// function clampInt(n: number, min: number, max: number) {
//     if (Number.isNaN(n)) return min;
//     return Math.min(Math.max(n, min), max);
// }
import React from "react";
import { toPublicUrl, formatBytes } from "@/utils/utils";

type HeaderBlock = { type: "header"; data?: { text?: string; level?: number } };
type ParagraphBlock = { type: "paragraph"; data?: { text?: string } };
type ImageBlock = { type: "image"; data?: { file?: { url?: string }; url?: string; caption?: string } };
type DelimiterBlock = { type: "delimiter"; data?: Record<string, never> };
type ListBlock = { type: "list"; data?: { style?: "ordered" | "unordered"; items?: string[] } };
type QuoteBlock = { type: "quote"; data?: { text?: string; caption?: string } };
type TableBlock = { type: "table"; data?: { [x: string]: any; content?: string[][] } };
type ChecklistBlock = { type: "checklist"; data?: { items?: { text?: string; checked?: boolean }[] } };
type CodeBlock = { type: "code"; data?: { code?: string } };
type RawBlock = { type: "raw"; data?: { html?: string } };
type LinkToolBlock = { type: "linkTool"; data?: { link?: string; meta?: { title?: string; description?: string; image?: { url?: string } } } };
type AttachesBlock = { type: "attaches"; data?: { file?: { url?: string; name?: string; size?: number } } };
type EmbedBlock = { type: "embed"; data?: { service?: string; source?: string; embed?: string; width?: number; height?: number; caption?: string } };
type ToggleBlock = { type: "toggle"; data?: { title?: string; content?: any } };
type AccordionItem = { title?: string; content?: any };
type AccordionBlock = { type: "accordion"; data?: { items?: AccordionItem[] } };
type ColumnsBlock = { type: "columns" | "columnsPro" | "layout"; data?: any };
type ButtonBlock = { type: "button"; data?: { text?: string; link?: string } };
type KatexBlock = { type: "katex"; data?: { html?: string; raw?: string; formula?: string; displayMode?: boolean } };
type HeaderAnchorBlock = { type: "headerAnchor"; data?: { text?: string; level?: number; anchor?: string } };
type WarningBlock = { type: "warning"; data?: { title?: string; message?: string } };
type UnknownBlock = { type: string; data?: any };
type EditorBlock =
    | HeaderBlock | ParagraphBlock | ImageBlock | DelimiterBlock | ListBlock | QuoteBlock | TableBlock
    | ChecklistBlock | CodeBlock | RawBlock | LinkToolBlock | AttachesBlock | EmbedBlock
    | ToggleBlock | AccordionBlock | ColumnsBlock | ButtonBlock | KatexBlock | HeaderAnchorBlock
    | WarningBlock | UnknownBlock;
type EditorData = { blocks?: EditorBlock[] } | string | null | undefined;
type NestedListItem = string | { content?: string; items?: NestedListItem[] };

const rich = (html?: string) =>
    React.createElement("span", { dangerouslySetInnerHTML: { __html: html ?? "" } });

const clampInt = (n: number, min: number, max: number) => {
    if (Number.isNaN(n)) return min;
    return Math.min(Math.max(n, min), max);
};

function toBlocks(input: EditorData): EditorBlock[] {
    if (!input) return [];
    try {
        const obj = typeof input === "string" ? JSON.parse(input) : input;
        if (Array.isArray(obj)) return obj as EditorBlock[];
        return Array.isArray((obj as any)?.blocks) ? (obj as any).blocks : [];
    } catch {
        return [];
    }
}

function extractColumnGroups(data: any): any[][] {
    if (!data) return [];
    if (Array.isArray(data.columns)) {
        return data.columns.map((c: any) => Array.isArray(c?.blocks) ? c.blocks : []);
    }
    if (Array.isArray(data.cols) && Array.isArray(data.cols[0])) {
        return data.cols as any[][];
    }
    if (Array.isArray(data.content)) {
        if (Array.isArray(data.content[0])) return data.content as any[][];
        return data.content.map((c: any) => Array.isArray(c?.blocks) ? c.blocks : []);
    }
    return [];
}

function renderMaybeBlocks(input: any, keyPrefix: string): React.ReactNode {
    if (!input) return null;
    if (typeof input === "string") return rich(input);
    if (typeof input === "object") {
        const blocks = Array.isArray(input) ? input : Array.isArray(input.blocks) ? input.blocks : null;
        if (blocks) return renderBlocks(blocks as EditorBlock[], keyPrefix);
        if (input.html) return rich(String(input.html));
    }
    return null;
}

function renderBlocks(blocks: EditorBlock[], keyPrefix = "blk"): React.ReactElement[] {
    return blocks.map((b, i) => renderBlock(b, `${keyPrefix}-${i}`)).filter(Boolean) as React.ReactElement[];
}

function renderList(items: NestedListItem[], ordered: boolean, key: string): React.ReactElement {
    const tag = (ordered ? "ol" : "ul") as "ol" | "ul";
    const children = items.map((it, idx) => {
        if (typeof it === "string") {
            return React.createElement("li", { key: `${key}-${idx}` }, rich(it));
        }
        const inner = [
            React.createElement("div", { key: `${key}-${idx}-c` }, rich(it?.content || "")),
            it?.items?.length ? renderList(it.items, ordered, `${key}-${idx}-n`) : null,
        ].filter(Boolean);
        return React.createElement("li", { key: `${key}-${idx}` }, ...inner);
    });
    return React.createElement(tag, { className: "list-inside ml-4 space-y-1" }, ...children);
}

function renderBlock(b: EditorBlock, key: string): React.ReactElement | null {
    switch (b.type) {
        case "header": {
            const level = clampInt(Number((b as HeaderBlock).data?.level) || 3, 1, 6);
            const tag = `h${level}` as keyof HTMLElementTagNameMap;
            return React.createElement(tag, { key, className: "font-semibold leading-snug mt-6" }, rich((b as HeaderBlock).data?.text));
        }

        case "headerAnchor": {
            const d = (b as HeaderAnchorBlock).data ?? {};
            const level = clampInt(Number(d.level) || 3, 1, 6);
            const tag = `h${level}` as keyof HTMLElementTagNameMap;
            const id = d.anchor || String(d.text || "").replace(/\s+/g, "-").toLowerCase();
            return React.createElement(tag, { key, id, className: "font-semibold leading-snug mt-6 scroll-mt-20" }, rich(d.text));
        }

        case "paragraph":
            return React.createElement("p", { key, className: "leading-relaxed" }, rich((b as ParagraphBlock).data?.text));

        case "image": {
            const d = (b as ImageBlock).data ?? {};
            const raw = d.file?.url || d.url || "";
            const src = toPublicUrl(raw);
            const img = React.createElement("img", {
                key: `${key}-img`,
                src,
                className: "rounded-lg border max-h-[560px] w-auto object-contain",
                alt: d.caption || "image",
            });
            const caption = d.caption
                ? React.createElement("figcaption", { key: `${key}-cap`, className: "text-xs text-muted-foreground" }, rich(d.caption))
                : null;
            return React.createElement("figure", { key, className: "space-y-2" }, img, caption);
        }

        case "delimiter":
            return React.createElement("hr", { key, className: "my-6" });

        case "list": {
            const d = (b as ListBlock).data ?? {};
            const ordered = (d.style ?? "unordered") === "ordered";
            const items: NestedListItem[] =
                Array.isArray(d.items) ? d.items : [];
            return React.createElement(
                "div",
                { key, className: "space-y-1" },
                renderList(items, ordered, key)
            );
        }

        case "checklist": {
            const items = ((b as ChecklistBlock).data?.items ?? []) as { text?: string; checked?: boolean }[];
            return React.createElement(
                "ul",
                { key, className: "ml-1 space-y-1" },
                ...items.map((it, idx) =>
                    React.createElement(
                        "li",
                        { key: `${key}-${idx}`, className: "flex items-start gap-2" },
                        React.createElement("input", {
                            type: "checkbox",
                            checked: !!it.checked,
                            readOnly: true,
                            className: "mt-1 h-4 w-4 accent-foreground",
                        }),
                        React.createElement("span", null, rich(it.text || ""))
                    )
                )
            );
        }

        case "quote": {
            const d = (b as QuoteBlock).data ?? {};
            const body = React.createElement("div", { key: `${key}-body` }, rich(d.text));
            const cap = d.caption ? React.createElement("div", { key: `${key}-cap`, className: "text-xs mt-1" }, rich(d.caption)) : null;
            return React.createElement("blockquote", { key, className: "border-l-4 pl-3 italic text-muted-foreground" }, body, cap);
        }

        case "table": {
            const d = (b as TableBlock).data ?? {};
            const rows: string[][] = Array.isArray(d.content) ? d.content : [];
            const head = d.withHeadings && rows.length ? rows[0] : null;
            const body = d.withHeadings ? rows.slice(1) : rows;

            const thead = head
                ? React.createElement("thead", null,
                    React.createElement("tr", null, ...head.map((h, i) =>
                        React.createElement("th", { key: `${key}-h-${i}`, className: "border px-2 py-1 text-left bg-muted/30" }, rich(h))
                    ))
                )
                : null;

            const tbody = React.createElement("tbody", null, ...body.map((row, r) =>
                React.createElement("tr", { key: `${key}-r-${r}` },
                    ...row.map((cell, c) =>
                        React.createElement("td", { key: `${key}-c-${c}`, className: "border px-2 py-1 align-top" }, rich(cell))
                    )
                )
            ));

            return React.createElement("div", { key, className: "overflow-x-auto" },
                React.createElement("table", { className: "w-full border-collapse" }, thead, tbody)
            );
        }

        case "code": {
            const code = (b as CodeBlock).data?.code ?? "";
            return React.createElement(
                "pre",
                { key, className: "rounded-md border bg-muted/40 p-3 text-sm overflow-x-auto" },
                React.createElement("code", null, code)
            );
        }

        case "raw": {
            const html = (b as RawBlock).data?.html ?? "";
            return React.createElement("div", { key, className: "prose max-w-none", dangerouslySetInnerHTML: { __html: html } });
        }

        case "embed": {
            const d = (b as EmbedBlock).data ?? {};
            const src = d.embed || d.source;
            if (!src) return null;
            return React.createElement(
                "figure",
                { key, className: "space-y-2" },
                React.createElement("iframe", {
                    src,
                    className: "w-full aspect-video rounded-md border",
                    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                    allowFullScreen: true,
                    loading: "lazy",
                    referrerPolicy: "no-referrer-when-downgrade",
                }),
                d.caption ? React.createElement("figcaption", { className: "text-xs text-muted-foreground" }, rich(d.caption)) : null
            );
        }

        case "attaches": {
            const f = (b as AttachesBlock).data?.file ?? {};
            const href = toPublicUrl(f.url || "");
            const name = f.name || "attachment";
            const size = typeof f.size === "number" ? ` • ${formatBytes ? formatBytes(f.size) : `${f.size}B`}` : "";
            return React.createElement(
                "a",
                { key, href, className: "inline-flex items-center gap-2 text-primary underline break-all", target: "_blank", rel: "noopener noreferrer" },
                React.createElement("span", { className: "i-lucide-paperclip h-4 w-4" }),
                `${name}${size}`
            );
        }

        case "linkTool": {
            const d = (b as LinkToolBlock).data ?? {};
            const url = d.link || "#";
            const img = d.meta?.image?.url ? React.createElement("img", { src: d.meta!.image!.url!, className: "h-16 w-16 object-cover rounded border" }) : null;
            return React.createElement(
                "a",
                { key, href: url, target: "_blank", rel: "noopener noreferrer", className: "block rounded-md border hover:bg-accent/30" },
                React.createElement(
                    "div",
                    { className: "flex gap-3 p-3" },
                    img,
                    React.createElement(
                        "div",
                        { className: "min-w-0" },
                        React.createElement("div", { className: "text-sm font-medium truncate" }, d.meta?.title || url),
                        d.meta?.description ? React.createElement("div", { className: "text-xs text-muted-foreground line-clamp-2" }, d.meta.description) : null,
                        React.createElement("div", { className: "text-[11px] text-muted-foreground truncate" }, url)
                    )
                )
            );
        }

        case "toggle": {
            const d = (b as ToggleBlock).data ?? {};
            return React.createElement(
                "details",
                { key, className: "rounded-md border p-3" },
                React.createElement("summary", { className: "cursor-pointer font-medium" }, rich(d.title || "토글")),
                React.createElement("div", { className: "mt-2 space-y-2" }, renderMaybeBlocks(d.content, `${key}-t`))
            );
        }

        case "accordion": {
            const items = (b as AccordionBlock).data?.items ?? [];
            return React.createElement(
                "div",
                { key, className: "space-y-2" },
                ...items.map((it, idx) =>
                    React.createElement(
                        "details",
                        { key: `${key}-${idx}`, className: "rounded-md border p-3" },
                        React.createElement("summary", { className: "cursor-pointer font-medium" }, rich(it.title || `섹션 ${idx + 1}`)),
                        React.createElement("div", { className: "mt-2 space-y-2" }, renderMaybeBlocks(it.content, `${key}-${idx}`))
                    )
                )
            );
        }

        case "columns":
        case "columnsPro":
        case "layout": {
            const groups = extractColumnGroups((b as ColumnsBlock).data);
            if (!groups.length) return null;
            const cols = Math.max(1, groups.length);
            return React.createElement(
                "div",
                { key, className: `grid gap-4 md:grid-cols-${Math.min(4, cols)}`.replace(/md:grid-cols-5|6/g, "md:grid-cols-4") },
                ...groups.map((blocks, cIdx) =>
                    React.createElement(
                        "div",
                        { key: `${key}-col-${cIdx}`, className: "space-y-4" },
                        ...renderBlocks(blocks as EditorBlock[], `${key}-col-${cIdx}`)
                    )
                )
            );
        }

        case "button": {
            const d = (b as ButtonBlock).data ?? {};
            const href = d.link || "#";
            const label = d.text || "Button";
            return React.createElement(
                "a",
                { key, href, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent/40" },
                label
            );
        }

        case "katex": {
            const d = (b as KatexBlock).data ?? {};
            if (d.html) return React.createElement("div", { key, className: "overflow-x-auto", dangerouslySetInnerHTML: { __html: d.html } });
            const latex = d.formula || d.raw || "";
            return React.createElement(
                "pre",
                { key, className: "rounded-md border bg-muted/40 p-3 text-sm overflow-x-auto" },
                React.createElement("code", null, latex)
            );
        }

        case "warning": {
            const d = (b as WarningBlock).data ?? {};
            return React.createElement(
                "div",
                { key, className: "rounded-md border border-yellow-300/60 bg-yellow-50 p-3 text-yellow-900" },
                d.title ? React.createElement("div", { className: "font-semibold mb-1" }, rich(d.title)) : null,
                d.message ? React.createElement("div", null, rich(d.message)) : null
            );
        }

        default:
            // 미지원 블록은 무시
            return null;
    }
}

export function ProjectDetailViewer({ data }: { data: EditorData }) {
    const blocks = toBlocks(data);
    if (!blocks.length) {
        return React.createElement("p", { className: "text-sm text-muted-foreground" }, "등록된 프로젝트 소개가 없습니다.");
    }
    return React.createElement("div", { className: "space-y-4" }, ...renderBlocks(blocks));
}
