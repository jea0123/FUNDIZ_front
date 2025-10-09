import { formatDate } from "@/utils/utils";
import type { Reward, RewardCreateRequestDto, RewardDraft, RewardForm } from "./reward";

export type Yn = "Y" | "N";

export type RewardInput =
    | RewardDraft
    | RewardForm
    | RewardCreateRequestDto
    | Pick<Reward, "rewardName" | "price" | "rewardContent" | "deliveryDate" | "rewardCnt" | "isPosting">;

export type FieldErrors = Partial<{
    rewardName: string;
    price: string;
    rewardContent: string;
    deliveryDate: string;
    rewardCnt: string;
    isPosting: string;
}>;

export type SingleValidateResult = {
    ok: boolean;
    errors: FieldErrors;
    allErrors: string[];
    normalized?: RewardDraft;
};

export type ListValidateResult = {
    ok: boolean;
    fieldErrorsList: FieldErrors[];
    allErrors: string[];
    duplicates: string[];
};

export const REWARD_RULES = {
    MAX_REWARD_NAME_LEN: 255,
    MAX_REWARD_CONTENT_LEN: 255,
    MIN_REWARD_PRICE: 1_000,
} as const;

const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const toDate = (d: unknown): Date | null => {
  if (d == null) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day); // 로컬 타임존 자정
  }
  const dt = new Date(d as any); // 타임스탬프, ISO문자열 등
  return isNaN(dt.getTime()) ? null : dt;
};

const asYn = (v: any): Yn | null => {
    if (v == null) return null;
    const upper = String(v).trim().toUpperCase();
    return upper === "Y" || upper === "N" ? (upper as Yn) : null;
}

export function validateReward(
    input: RewardInput,
    opts?: {
        fundingEndDate?: Date | string | number | null;
        now?: Date;
    }
): SingleValidateResult {
    const { MAX_REWARD_NAME_LEN, MAX_REWARD_CONTENT_LEN, MIN_REWARD_PRICE } = REWARD_RULES;
    const errors: FieldErrors = {};
    const allErrors: string[] = [];

    // 리워드명
    const name = (input.rewardName ?? "").toString().trim();
    if (!name) {
        errors.rewardName = "리워드명이 필요합니다.";
    } else if (name.length > MAX_REWARD_NAME_LEN) {
        errors.rewardName = `리워드명이 ${MAX_REWARD_NAME_LEN}자를 초과합니다.`;
    }

    // 리워드 금액
    const price = input.price == null ? null : Number(input.price);
    if (price == null || isNaN(price) || price < MIN_REWARD_PRICE) {
        errors.price = `리워드 금액은 최소 ${MIN_REWARD_PRICE.toLocaleString()}원 이상이어야 합니다.`;
    }

    // 리워드 내용
    const content = (input.rewardContent ?? "").toString().trim();
    if (!content) {
        errors.rewardContent = "리워드 내용이 필요합니다.";
    } else if (content.length > MAX_REWARD_CONTENT_LEN) {
        errors.rewardContent = `리워드 내용이 ${MAX_REWARD_CONTENT_LEN}자를 초과합니다.`;
    }

    // 배송 필요 여부
    const isPosting = asYn(input.isPosting);
    if (!isPosting) {
        errors.isPosting = "배송 필요 여부는 Y 또는 N 이어야 합니다.";
    }

    // 배송 예정일
    const label = isPosting === "Y" ? "배송 예정일" : "제공 예정일";
    const del = toDate(input.deliveryDate);
    const end = toDate(opts?.fundingEndDate);
    if (!del) {
        errors.deliveryDate = `${label}을 선택하세요.`;
    } else if (!end){
        errors.deliveryDate = "펀딩 종료일을 먼저 설정하세요.";
    } else {
        const d = stripTime(del);
        const e = stripTime(end);
        if (d <= e) {
            errors.deliveryDate = `${label}은 펀딩 종료일(${formatDate(e)}) 이후여야 합니다.`;
        }
    }

    // 리워드 수량: null=무제한, 0=품절 허용, 음수만 금지
    const cnt = input.rewardCnt;
    if (cnt != null && Number(cnt) < 0) {
        errors.rewardCnt = "리워드 수량은 0 이상이어야 합니다.";
    }

    for (const v of Object.values(errors)) if (v) allErrors.push(v);

    return {
        ok: allErrors.length === 0,
        errors,
        allErrors,
        normalized: allErrors.length === 0 ? {
            rewardName: name,
            price: price!,
            rewardContent: content,
            isPosting: isPosting!,
            deliveryDate: del!,
            rewardCnt: cnt ?? null
        } : undefined,
    };
}

export function validateRewardList(
    rewards: RewardInput[],
    opts?: Parameters<typeof validateReward>[1]
): ListValidateResult {
    const fieldErrorsList: FieldErrors[] = rewards.map(() => ({}));
    const allErrors: string[] = [];

    // 개별 항목 검사
    rewards.forEach((r, idx) => {
        const res = validateReward(r, opts);
        fieldErrorsList[idx] = res.errors;
        if (!res.ok) allErrors.push(...res.allErrors.map((m) => `#${idx + 1}: ${m}`));
    });

    // 리워드명 중복 검사(공백/대소문자 무시)
    const seen = new Map<string, number[]>();
    rewards.forEach((r, idx) => {
        const nm = (r.rewardName ?? "").toString().trim();
        if (!nm) return;
        const key = normalizeName(nm);
        const arr = seen.get(key) ?? [];
        arr.push(idx);
        seen.set(key, arr);
    });
    const duplicates: string[] = [];
    for (const [key, idxs] of seen) {
        if (idxs.length > 1) {
            duplicates.push(key);
            const msg = "중복된 리워드명이 있습니다.";
            allErrors.push(msg);
            idxs.forEach((i) => {
                fieldErrorsList[i] = { ...fieldErrorsList[i], rewardName: msg };
            });
        }
    }

    return {
        ok: allErrors.length === 0,
        allErrors,
        fieldErrorsList,
        duplicates,
    };
}

export function assertValidReward(input: RewardInput, opts?: Parameters<typeof validateReward>[1]) {
    const res = validateReward(input, opts);
    if (!res.ok) throw new Error(res.allErrors.join("\n"));
    return res.normalized!;
}