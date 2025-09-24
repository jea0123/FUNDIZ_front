export const toWonPlus = (amount?: number) => {
    if (amount === undefined) return "-";
    if (amount >= 100_000_000) return `${Math.round(amount / 100_000_000)}억 원+`;
    if (amount >= 10_000) return `${Math.round(amount / 10_000)}만 원+`;
    return `${amount.toLocaleString()} 원`;
}


export const toWon = (amount?: number) => {
    if (amount === undefined) return "-";
    if (amount >= 100_000_000) return `${Math.round(amount / 100_000_000)}억 원`;
    if (amount >= 10_000) return `${Math.round(amount / 10_000)}만 원`;
    return `${amount.toLocaleString()} 원`;
}

export const getDaysLeft = (date: string | Date) => {
    const now = new Date("2020-06-27T10:00:00Z");
    const end = new Date(date);
    const diffMs = end.getTime() - now.getTime();
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

// export const formatDate = (date: string | Date) => {
//     const d = new Date(date);

//     if (isNaN(d.getTime())) {
//         console.log("잘못된 날짜 포맷");
//     }

//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
// }