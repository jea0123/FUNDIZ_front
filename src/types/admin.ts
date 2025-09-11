export interface Analytics {
    kpi: {
        totalBackingAmount: number;
        fee: number;
        successRate: number;
        backingAmountAvg: number;
    };
    revenueTrends: RevenueTrends[];
    rewardSalesTops: RewardSalesTop[];
    paymentMethods: PaymentMethod[];
    categorySuccesses: SubcategorySuccess[];
};

export interface RevenueTrends {
    month: string;
    projectCnt: number;
    revenue: number;
}

export interface RewardSalesTop {
    rewardName: string;
    qty: number;
    revenue: number;
}

export interface PaymentMethod {
    paymentMethod: "CARD" | "BANK_TRANSFER" | "EASY_PAY" | "ETC";
    cnt: number;
}

export interface SubcategorySuccess {
    categoryName: string;
    successCnt: number;
    failCnt: number;
}

export interface Category {
    ctgrId: number;
    ctgrName: string;
}