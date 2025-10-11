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

/**
 * @description 로딩 스피너 컴포넌트
 * @param ariaLabel 접근성 라벨 (기본값: "Loading")
 * @returns 로딩 스피너 JSX 요소
 */
function Spinner({ ariaLabel = "Loading" }: { ariaLabel?: string }) {
    return (
        <div
            role="status"
            aria-label={ariaLabel}
            className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
        />
    );
}
