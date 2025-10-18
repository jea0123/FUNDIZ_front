import { Button } from "@/components/ui/button";

export type SortKey = "liked" | "recent" | "amount" | "deadline" | "percent" | "view";

const SORT_OPTIONS: { id: SortKey; name: string }[] = [
    { id: "recent", name: "최신순" },
    { id: "liked", name: "좋아요순" },
    { id: "amount", name: "모집금액순" },
    { id: "deadline", name: "마감임박순" },
    { id: "percent", name: "달성률순" },
    { id: "view", name: "조회순" },
];

type Props = {
    value: SortKey;
    onChange: (s: SortKey) => void;
    total: number;
};

export default function ProjectsSortBar({ value, onChange, total }: Props) {
    return (
        <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">총 {total}개의 프로젝트</p>
            <div className="flex gap-2">
                {SORT_OPTIONS.map((opt) => (
                    <Button key={opt.id} variant={value === opt.id ? "default" : "ghost"} size="sm" onClick={() => onChange(opt.id)}>
                        {opt.name}
                    </Button>
                ))}
            </div>
        </div>
    );
}