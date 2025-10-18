import React from "react";
import { toPublicUrl } from "@/utils/utils";

type EditorBlock =
    | { type: "header"; data?: { text?: string; level?: number } }
    | { type: "paragraph"; data?: { text?: string } }
    | { type: "image"; data?: { file?: { url?: string }; url?: string; caption?: string } }
    | { type: "delimiter"; data?: Record<string, never> }
    | { type: "list"; data?: { style?: "ordered" | "unordered"; items?: string[] } }
    | { type: "quote"; data?: { text?: string; caption?: string } }
    | { type: "table"; data?: { content?: string[][] } }
    | { type: string; data?: any };

type EditorData = { blocks?: EditorBlock[] } | string | null | undefined;

function toBlocks(input: EditorData): EditorBlock[] {
    if (!input) return [];
    try {
        const obj = typeof input === "string" ? JSON.parse(input) : input;
        return Array.isArray((obj as any)?.blocks) ? (obj as any).blocks : [];
    } catch {
        return [];
    }
}

const rich = (html?: string) =>
    React.createElement("span", { dangerouslySetInnerHTML: { __html: html ?? "" } });

export function ProjectDetailViewer({ data }: { data: EditorData }) {
    const blocks = toBlocks(data);
    if (!blocks.length) {
        return React.createElement(
            "p",
            { className: "text-sm text-muted-foreground" },
            "등록된 프로젝트 소개가 없습니다."
        );
    }

    const children = blocks.map((b, i) => renderBlock(b, i));
    return React.createElement("div", { className: "space-y-4" }, ...children);
}

function renderBlock(b: EditorBlock, i: number): React.ReactElement | null {
    const key = `${b.type}-${i}`;

    switch (b.type) {
        case "header": {
            const level = clampInt(Number(b.data?.level) || 3, 1, 6);
            const tag = (`h${level}` as keyof HTMLElementTagNameMap);
            return React.createElement(tag, { key, className: "font-semibold leading-snug mt-6" }, rich(b.data?.text));
        }

        case "paragraph":
            return React.createElement(
                "p",
                { key, className: "leading-relaxed" },
                rich(b.data?.text)
            );

        case "image": {
            const raw = b.data?.file?.url || b.data?.url || "";
            const src = toPublicUrl(raw);
            const img = React.createElement("img", {
                key: `${key}-img`,
                src,
                className: "rounded-lg border max-h-[560px] w-auto object-contain",
                alt: b.data?.caption || "image",
            });
            const caption = b.data?.caption
                ? React.createElement(
                    "figcaption",
                    { key: `${key}-cap`, className: "text-xs text-muted-foreground" },
                    rich(b.data?.caption)
                )
                : null;
            return React.createElement("figure", { key, className: "space-y-2" }, img, caption);
        }

        case "delimiter":
            return React.createElement("hr", { key, className: "my-6" });

        case "list": {
            const ordered = (b.data?.style ?? "unordered") === "ordered";
            const tag = (ordered ? "ol" : "ul") as "ol" | "ul";
            const items: string[] = Array.isArray(b.data?.items) ? (b.data!.items as string[]) : [];
            const liChildren = items.map((it: string, idx: number) =>
                React.createElement("li", { key: `${key}-${idx}` }, rich(it))
            );
            return React.createElement(tag, { key, className: "list-inside ml-4 space-y-1" }, ...liChildren);
        }

        case "quote": {
            const body = React.createElement("div", { key: `${key}-body` }, rich(b.data?.text));
            const cap = b.data?.caption
                ? React.createElement("div", { key: `${key}-cap`, className: "text-xs mt-1" }, rich(b.data?.caption))
                : null;
            return React.createElement(
                "blockquote",
                { key, className: "border-l-4 pl-3 italic text-muted-foreground" },
                body,
                cap
            );
        }

        case "table": {
            const rows: string[][] = Array.isArray(b.data?.content) ? (b.data!.content as string[][]) : [];
            const trEls = rows.map((row: string[], rIdx: number) =>
                React.createElement(
                    "tr",
                    { key: `${key}-r-${rIdx}` },
                    ...row.map((cell: string, cIdx: number) =>
                        React.createElement(
                            "td",
                            { key: `${key}-c-${cIdx}`, className: "border px-2 py-1 align-top" },
                            rich(cell)
                        )
                    )
                )
            );
            const tbody = React.createElement("tbody", null, ...trEls);
            const table = React.createElement("table", { className: "w-full border-collapse" }, tbody);
            return React.createElement("div", { key, className: "overflow-x-auto" }, table);
        }

        default:
            return null;
    }
}

function clampInt(n: number, min: number, max: number) {
    if (Number.isNaN(n)) return min;
    return Math.min(Math.max(n, min), max);
}