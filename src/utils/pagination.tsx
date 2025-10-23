import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PaginationProps = {
    page: number;   // 현재 페이지
    size: number;    // 페이지당 아이템 수
    total: number;  // 총 아이템 수
    onPage: (p: number) => void;
    perGroup?: number;    // 한 번에 보여줄 페이지 번호 개수
    onSizeChange?: (n: number) => void;  // 선택 시 부모에서 size 상태 업데이트
    sizeOptions?: number[];  // 드롭다운 옵션
    className?: string;
    variant?: "admin" | "user";  // 프리셋
    showSizeSelector?: boolean;  // 필요할 때만 표시 (admin true, user false 기본)
    showRange?: boolean;         // 좌측 범위 "x-y / total" 표시 (admin true, user false 기본)
};

export function Pagination({
    page,
    size,
    total,
    onPage,
    perGroup = 5,
    onSizeChange,
    sizeOptions = [10, 20, 30, 50],
    className,
    variant = "admin",
    showSizeSelector,
    showRange,
}: PaginationProps) {
    const isUser = variant === "user";
    const _showSizeSelector = typeof showSizeSelector === "boolean" ? showSizeSelector : !isUser;
    const _showRange = typeof showRange === "boolean" ? showRange : !isUser;

    const lastPage = Math.max(1, Math.ceil(total / size));
    const clampedPage = Math.min(Math.max(page, 1), lastPage);
    const blockIndex = Math.floor((clampedPage - 1) / perGroup);
    const startPage = blockIndex * perGroup + 1;
    const endPage = Math.min(startPage + perGroup - 1, lastPage);

    const canPrevBlock = startPage > 1;
    const canNextBlock = endPage < lastPage;

    // variant에 따른 정렬
    const layoutClass = isUser
        ? "justify-center"
        : "sm:items-center sm:justify-between";

    return (
        <div className={`flex flex-col sm:flex-row ${layoutClass} gap-3 mt-6 ${className ?? ""}`}>
            {/* 좌측: perPage 선택 및 범위 */}
            {(!_showSizeSelector && !_showRange) ? null : (
                <div className="flex items-center gap-2">
                    {_showSizeSelector && (
                        <>
                            <span className="text-sm text-muted-foreground">Rows</span>
                            <Select
                                value={String(size)}
                                onValueChange={(v) => onSizeChange?.(Number(v))}
                                disabled={!onSizeChange}
                            >
                                <SelectTrigger className="h-8 w-[84px] text-xs">
                                    <SelectValue placeholder={`${size}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sizeOptions.map((n) => (
                                        <SelectItem key={n} value={String(n)} className="text-sm">
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    )}

                    {_showRange && (
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {total === 0
                                ? "0 / 0"
                                : `${(clampedPage - 1) * size + 1}–${Math.min(clampedPage * size, total)} / ${total}`}
                        </span>
                    )}
                </div>
            )}

            {/* 우측: 페이지 이동 */}
            <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!canPrevBlock}
                    onClick={() => onPage(Math.max(1, startPage - perGroup))}
                >
                    이전
                </Button>

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((p) => (
                    <Button
                        key={p}
                        variant={p === clampedPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPage(p)}
                    >
                        {p}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!canNextBlock}
                    onClick={() => onPage(Math.min(lastPage, endPage + 1))}
                >
                    다음
                </Button>
            </div>
        </div>
    );
}