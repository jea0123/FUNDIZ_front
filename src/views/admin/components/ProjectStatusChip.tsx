export type ProjectStatus =
    | "DRAFT" | "VERIFYING" | "UPCOMING" | "OPEN"
    | "SUCCESS" | "FAILED" | "REJECTED" | "CANCELED" | "SETTLED";

const STATUS_META = {
    DRAFT: { label: "작성중", wrap: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-400" },
    VERIFYING: { label: "심사중", wrap: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    REJECTED: { label: "반려", wrap: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
    UPCOMING: { label: "오픈예정", wrap: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
    OPEN: { label: "진행중", wrap: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    SUCCESS: { label: "성공", wrap: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
    FAILED: { label: "실패", wrap: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
    CANCELED: { label: "취소", wrap: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-400" },
    SETTLED: { label: "정산", wrap: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
} satisfies Record<ProjectStatus, { label: string; wrap: string; dot: string }>;

const FALLBACK = { label: "알수없음", wrap: "bg-zinc-50 text-zinc-700 border-zinc-200", dot: "bg-zinc-400" };

// 소문자/공백/별칭 정규화
const ALIASES: Record<string, ProjectStatus> = {
    "upcoming": "UPCOMING",
    "open": "OPEN",
    "success": "SUCCESS",
    "failed": "FAILED",
    "canceled": "CANCELED",
    "rejected": "REJECTED",
    "verifying": "VERIFYING",
    "draft": "DRAFT",
    "settled": "SETTLED",
};

function normalizeStatus(input: unknown): ProjectStatus | null {
    if (input == null) return null;

    if (Array.isArray(input)) {
        console.warn("[ProjectStatusChip] status is array, using first:", input);
        return normalizeStatus(input[0]);
    }

    if (typeof input !== "string") return null;

    const key = input.trim().toUpperCase();
    if ((STATUS_META as any)[key]) return key as ProjectStatus;

    const alias = ALIASES[input.trim().toLowerCase()];
    return alias ?? null;
}

export function ProjectStatusChip({ status }: { status: ProjectStatus | string | string[] | null | undefined }) {
    const norm = normalizeStatus(status);
    const meta = norm ? STATUS_META[norm] : FALLBACK;

    if (!norm) {
        console.warn("[ProjectStatusChip] Unknown status:", status);
    }

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.wrap}`}>
            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
}
