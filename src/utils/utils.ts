import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { toast } from "sonner";

dayjs.extend(relativeTime);
dayjs.locale("ko");

/**
 * @description 주어진 날짜로부터 경과된 시간을 "몇 분 전", "몇 시간 전" 등의 형식으로 반환
 * @param {Date} createdAt 기준이 되는 날짜
 * @returns {string} 경과된 시간 문자열
 * @example
 * getElapsedTime(new Date(Date.now() - 60000)) // "1분 전"
 * getElapsedTime(new Date(Date.now() - 600000)) // "10분 전"
 * getElapsedTime(new Date(Date.now() - 6000000)) // "1시간 전"
 * getElapsedTime(new Date(Date.now() - 60000000)) // "10시간 전"
 */
export const getElapsedTime = (createdAt: Date): string => dayjs(createdAt).fromNow();

/**
 * @description 숫자를 한국 원화(KRW) 단위로 변환
 * @param {number} amount 변환할 금액
 * @returns {string} 원화 단위로 변환
 * @example
 * toWonPlus(1200) // "1,200 원"
 * toWonPlus(12000) // "1만 원+"
 * toWonPlus(120000000) // "1억 원+"
 * toWonPlus() // "-"
 */
export const toWonPlus = (amount?: number): string => {
    if (amount === undefined || amount === null) return "-";
    if (amount >= 100_000_000) return `${Math.round(amount / 100_000_000)}억 원+`;
    if (amount >= 10_000) return `${Math.round(amount / 10_000)}만 원+`;
    return `${amount.toLocaleString()} 원`;
}

/**
 * @description 숫자를 한국 원화(KRW) 단위로 변환
 * @param {number} amount 변환할 금액
 * @returns {string} 원화 단위로 변환
 * @example
 * toWon(1200) // "1,200 원"
 * toWon(12000) // "1만 원"
 * toWon(120000000) // "1억 원"
 * toWon() // "-"
 */
export const toWon = (amount?: number): string => {
    if (amount === undefined) return "-";
    if (amount >= 100_000_000) return `${Math.round(amount / 100_000_000)}억 원`;
    if (amount >= 10_000) return `${Math.round(amount / 10_000)}만 원`;
    return `${amount.toLocaleString()} 원`;
}

/**
 * @description 특정 날짜까지 남은 일수를 계산하여 문자열로 반환
 * @param {string | Date} date 날짜 문자열 또는 Date 객체
 * @return {string} 남은 일수를 나타내는 문자열 (예: "5"), 이미 지난 날짜인 경우 "0", 잘못된 날짜 포맷인 경우 "-"
 * @example
 * getDaysLeft("2023-10-10") // "5" (오늘이 2023-10-05인 경우)
 */
export function getDaysLeft(date: string | Date): string {
    const end = new Date(date);
    const diffMs = end.getTime() - Date.now();

    if (diffMs <= 0) return "0";

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (isNaN(diffDays)) {
        console.error("잘못된 날짜 포맷");
        return "-";
    }

    return `${diffDays}`;
}

/**
 * @description 특정 날짜까지 남은 시간을 계산하여 사람이 읽을 수 있는 형식으로 반환
 * @param {string | Date} date 날짜 문자열 또는 Date 객체
 * @returns {string} 남은 시간을 나타내는 문자열 (예: "1일", "2주", "1시간", "1분", "방금", "-")
 * @example
 * getDaysBefore("2023-10-05") // "5일" (오늘이 2023-09-30인 경우)
 * getDaysBefore("2023-10-15") // "2주" (오늘이 2023-10-01인 경우)
 * getDaysBefore("2023-10-05T15:00:00") // "1시간" (현재 시간이 2023-10-05T14:00:00인 경우)
 */
export const getDaysBefore = (date: string | Date): string => {
    const end = new Date(date);
    const diffMs = end.getTime() - Date.now();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (isNaN(diffDays)) {
        console.error("잘못된 날짜 포맷");
        return "-";
    }

    if (diffDays > 7 && diffDays <= 30) {
        return `${Math.floor(diffDays / 7)}주`;
    }
    if (diffDays >= 1 && diffDays <= 7) {
        return `${diffDays}일`;
    }
    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours >= 1) {
            return `${diffHours}시간`;
        }
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            if (diffMinutes >= 1) {
                return `${diffMinutes}분`;
            }
            return `방금`;
        }
    }
    if (diffDays > 30 && diffDays < 365) {
        return `${Math.floor(diffDays / 30)}달`;
    }
    if (diffDays >= 365) {
        return `${Math.floor(diffDays / 365)}년`;
    }
    return `0일`;
}

/**
 * @description 날짜를 "YYYY-MM-DD" 형식으로 변환
 * @param {string | Date | null} date 날짜 문자열 또는 Date 객체 또는 null
 * @returns {string} "YYYY-MM-DD" 형식의 날짜 문자열
 */
export const formatDate = (date: string | Date | null): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    if (isNaN(d.getTime())) {
        console.log("잘못된 날짜 포맷");
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/**
 * @description "yyyy-MM-dd" 날짜를 "yyyy-MM-ddTHH:mm:ss" 형식으로 변환
 * @param {string | Date} dateStr 날짜 문자열 또는 Date 객체
 * @returns {Date} "yyyy-MM-ddTHH:mm:ss" 형식의 날짜 객체
 */
export function toIsoDateTime(dateLike: Date | string | null | undefined, endOfDay = false): string {
    if (!dateLike) return "";

    const toYmd = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    let ymd: string;

    if (dateLike instanceof Date) {
        if (isNaN(dateLike.getTime())) return "";
        ymd = toYmd(dateLike);
    } else {
        const s = dateLike.trim();
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) return s;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "";
        ymd = s;
    }

    return endOfDay ? `${ymd}T23:59:59` : `${ymd}T00:00:00`;
}

/**
 * @description 숫자를 한국 원화(KRW) 통화 형식으로 변환 (예: 1200 → "₩1.2K", 1000000 → "₩1M")
 * @param {number} amount 변환할 금액
 * @returns {string} 한국 원화 통화 형식 문자열
 */
export const currency = (amount: number): string =>
    new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", notation: "compact", maximumFractionDigits: 1 }).format(amount ?? 0);

/**
 * @description 숫자를 1,200 → 1.2K, 1,000,000 → 1M 등으로 축약
 * @param {number} n 축약할 숫자
 * @returns {string} 축약된 문자열
 */
export const numberCompact = (n: number): string =>
    new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 }).format(n ?? 0);

/**
 * @description 문자열을 최대 길이로 자르고, 초과 시 "…" 추가
 * @param {string} s 자를 문자열
 * @param {number} max 최대 길이 (기본값: 16)
 * @returns {string} 자른 문자열
 */
export const shortenLabel = (s: string, max: number = 16): string => (s && s.length > max ? s.slice(0, max - 1) + "…" : s);

/**
 * @description 숫자를 로케일에 맞게 포맷팅
 * @param {number} num 포맷팅할 숫자
 * @param {string} locale 로케일 (기본값: 'ko-KR')
 * @returns {string} 포맷팅된 숫자 문자열
 * @example
 * formatNumber(1200) // "1,200"
 * formatNumber(1200000) // "1,200,000"
 * formatNumber(1200, 'en-US') // "1,200"
 */
export const formatNumber = (num: number, locale: string = 'ko-KR'): string => {
    return new Intl.NumberFormat(locale).format(num);
}

// 가격을 ₩1,200 형태로 포맷팅
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
}

// 가격을 1억,1만,1천 (그 외 1000) 형태로 포맷팅
export function toKRWCompact(n: number): string {
    if (n % 100_000_000 === 0) return `${n / 100_000_000}억`;
    if (n >= 10_000 && n % 10_000 === 0) {
        const m = n / 10_000;
        const thousands = Math.floor(m / 1000) % 10;
        const hundreds = Math.floor(m / 100) % 10;
        const tens = Math.floor(m / 10) % 10;
        const ones = m % 10;
        let s = "";
        if (thousands) s += `${thousands}천`;
        if (hundreds) s += `${hundreds}백`;
        if (tens) s += `${tens}십`;
        if (ones) s += `${ones}`;
        return s + "만";
    }
    if (n < 10_000 && n % 1_000 === 0) return `${n / 1_000}천`;
    return `${n.toLocaleString()}`;
}

// 문자길이 byte로
export const getByteLen = (s: string) => new TextEncoder().encode(s).length;

/**
 * @description 파일 경로를 공개 URL로 변환
 * @param p {string | null | undefined} p 파일 경로
 * @returns {string | null} 공개 URL 또는 null
 */
export const toPublicUrl = (p?: string | null): string => {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;

    if (/^[A-Za-z]:[\\/]/.test(p)) {
        const name = p.replace(/^.*[\\/]/, "");
        return `http://localhost:9099/uploads/${name}`;
    }
    if (p.startsWith("/")) return `http://localhost:9099${p}`;
    return `http://localhost:9099/${p}`;
};

export const percent = (curr: number, goal: number) => (goal ? Math.floor((curr / goal) * 100) : 0);

/** 성공(파랑 톤) */
export const toastSuccess = (message: string) =>
    toast.success(message, {
        style: {
            backgroundColor: "#EFF6FF", // blue-50
            color: "#1D4ED8",           // blue-700
        },
    });

/** 경고(노랑 톤) */
export const toastWarning = (message: string) =>
    toast.warning(message, {
        style: {
            backgroundColor: "#FFFBEB", // amber-50
            color: "#92400E",           // amber-800
        },
    });

/** 에러(빨강 톤) */
export const toastError = (message: string) =>
    toast.error(message, {
        style: {
            backgroundColor: "#FEF2F2", // red-50
            color: "#991B1B",           // red-800
        },
    });