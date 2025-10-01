import React from "react";
/**
 * FundingLoader — 스피너 전용(극심플)
 * - 풀스크린 중앙 정렬, 스피너만 표시
 * - Tailwind `animate-spin` 사용 (회전 보장)
 */

export default function FundingLoader() {
    return (
        <div
            className="flex min-h-screen w-full items-center justify-center"
            aria-busy
            aria-live="polite"
        >
            <Spinner ariaLabel="로딩 중" />
        </div>
    );
}

function Spinner({ ariaLabel = "Loading" }: { ariaLabel?: string }) {
    return (
        <div
            role="status"
            aria-label={ariaLabel}
            className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
        />
    );
}
