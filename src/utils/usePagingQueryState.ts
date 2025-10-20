import { useSearchParams } from "react-router-dom";

type PagingDefaults = {
    page?: number;      // 기본 1
    size?: number;      // 기본 10
    perGroup?: number;  // 기본 5
}

/* 모든 목록 공용 */
export function usePagingQueryState(defaults: PagingDefaults = {}) {
    const {
        page: dPage = 1,
        size: dSize = 10,
        perGroup: dPerGroup = 5,
    } = defaults;

    const [sp, setSP] = useSearchParams();

    const page = Math.max(1, parseInt(sp.get("page") || String(dPage), 10));
    const size = Math.max(1, parseInt(sp.get("size") || String(dSize), 10));
    const perGroup = Math.max(1, parseInt(sp.get("perGroup") || String(dPerGroup), 10));

    const setParam = (k: string, v?: string, { resetPage = false } = {}) => {
        const next = new URLSearchParams(sp);
        if (v && v.length) next.set(k, v);
        else next.delete(k);
        if (resetPage) next.set("page", "1");
        setSP(next, { replace: true });
    };

    const setPage = (p: number) => setParam("page", String(Math.max(1, p)));
    const setSize = (n: number) => setParam("size", String(Math.max(1, n)), { resetPage: true });
    const setPerGroup = (n: number) => setParam("perGroup", String(Math.max(1, n)));

    // Pagination 컴포넌트에 쓸 바인딩 헬퍼
    const bindPagination = (
        total: number,
        opts?: {
            showSizeSelector?: boolean;
            sizeOptions?: number[];
            className?: string;
        }) => ({
            page,
            size,
            total,
            onPage: setPage,
            perGroup,
            onSizeChange: setSize,
            showSizeSelector: opts?.showSizeSelector ?? false,
            sizeOptions: opts?.sizeOptions,
            className: opts?.className,
        }
    );

    return {
        page, size, perGroup, setPage, setSize, setPerGroup,
        searchParams: sp, setSearchParams: setSP,   // raw access (필요시)
        bindPagination, // helper
    };
}

// 브라우징(전체/카테고리/세부카테고리)용 : 키워드 추가
export function useBrowseQueryState() {
    const base = usePagingQueryState();
    const { searchParams: sp, setSearchParams: setSP } = base;

    const keyword = sp.get("keyword") || "";

    const setParam = (k: string, v?: string, resetPage = false) => {
        const next = new URLSearchParams(sp);
        if (v && v.length) next.set(k, v);
        else next.delete(k);
        if (resetPage) next.set("page", "1");
        setSP(next, { replace: true });
    };

    const setKeyword = (k: string) => setParam("keyword", k || undefined, true);

    return { ...base, keyword, setKeyword };
}

// 창작자/관리자 목록용 : 조회기간/상태 추가
export function useListQueryState() {
    const base = usePagingQueryState({ size: 5 });
    const { searchParams: sp, setSearchParams: setSP } = base;

    const rangeType = sp.get("rangeType") || "";
    const projectStatus = sp.getAll("projectStatus").filter(Boolean);

    const setParam = (k: string, v?: string) => {
        const next = new URLSearchParams(sp);
        if (v && v.length && v !== "undefined" && v !== "null") next.set(k, v);
        else next.delete(k);
        next.set("page", "1");
        setSP(next, { replace: true });
    };
    const setRangeType = (v?: string) => setParam("rangeType", v);
    const setProjectStatus = (arr?: string[]) => {
        const next = new URLSearchParams(sp);
        next.delete("projectStatus"); // 기존 값 모두 제거
        if (arr && arr.length) {
            arr.forEach(s => {
                if (s && s !== "undefined" && s !== "null") next.append("projectStatus", s);
            });
        }
        next.set("page", "1");
        setSP(next, { replace: true });
    };

    return {
        ...base,
        rangeType,
        projectStatus,
        setRangeType,
        setProjectStatus,
    };
}