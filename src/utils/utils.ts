export const toWonPlus = (amount?: number) => {
    if (amount === undefined) return "-";
    if (amount >= 100_000_000) return `${Math.round(amount / 100_000_000)}억 원`;
    if (amount >= 10_000) return `${Math.round(amount / 10_000)}만 원`;
    return `${amount.toLocaleString()} 원`;
}


export const toWon = (amount?: number) => {
    if (amount === undefined) return "-";
    if (amount >= 100_000_000) return `${Math.round(amount / 100_000_000)}억 원`;
    if (amount >= 10_000) return `${Math.round(amount / 10_000)}만 원`;
    return `${amount.toLocaleString()} 원`;
}


export const getDaysLeft = (endDate: string | Date) => {
    const now = new Date("2024-06-27T10:00:00Z");
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))); // 음수면 0
}