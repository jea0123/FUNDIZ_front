export type ProjectStatus =
    | "DRAFT"
    | "VERIFYING"
    | "UPCOMING"
    | "OPEN"
    | "SUCCESS"
    | "FAILED"
    | "REJECTED"
    | "CANCELED"
    | "SETTLED";

const STATUS_LABELS: Record<ProjectStatus, string> = {
    DRAFT: "작성중",
    VERIFYING: "심사중",
    REJECTED: "반려",
    UPCOMING: "오픈예정",
    OPEN: "진행중",
    SUCCESS: "성공",
    FAILED: "실패",
    CANCELED: "취소",
    SETTLED: "정산",
};

const STATUS_STYLES: Record<ProjectStatus, { wrap: string; dot: string }> = {
    DRAFT: { wrap: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-400" },
    VERIFYING: { wrap: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    REJECTED: { wrap: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
    UPCOMING: { wrap: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
    OPEN: { wrap: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    SUCCESS: { wrap: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
    FAILED: { wrap: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
    CANCELED: { wrap: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-400" },
    SETTLED: { wrap: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
};

export function ProjectStatusChip({ status }: { status: ProjectStatus }) {
    const label = STATUS_LABELS[status];
    const style = STATUS_STYLES[status];

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.wrap}`}>
            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {label}
        </span>
    );
}