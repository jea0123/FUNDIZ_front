export interface Analytics {
    kpi: {
        totalBackingAmount: number;
        fee: number;
        successRate: number;
        backingAmountAvg: number;
    };
    revenueTrends: revenueTrends[];
    rewardSalesTops: rewardSalesTop[];
    paymentMethods: paymentMethod[];
    categorySuccesses: SubcategorySuccess[];
};

export interface revenueTrends {
    month: string;
    projectCnt: number;
    revenue: number;
}

export interface rewardSalesTop {
    rewardName: string;
    qty: number;
    revenue: number;
}

export interface paymentMethod {
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