import type { NavigateOptions, To } from "react-router-dom";

let _navigate: ((to: To, options?: NavigateOptions) => void) | null = null;

export function setNavigator(navigateFn: (to: To, options?: NavigateOptions) => void) {
    _navigate = navigateFn;
}

export function appNavigate(to: To, options?: NavigateOptions) {
    if (_navigate) _navigate(to, options);
    else {
        // 초기화 전이라면 풀리로드로 폴백 (옵션)
        const url = typeof to === "string" ? to : to.pathname || "/error";
        window.location.href = url;
    }
}
