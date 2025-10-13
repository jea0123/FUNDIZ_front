export interface Settlement {
    settlementId: number;
    projectId: number;
    totalAmount: number;
    fee: number;
    settlementAmount: number;
    settlementDate: Date;
    settlementStatus: 'WAITING' | 'PAID';
    refundAmount: number;
}

export interface SettlementSummary {
    waitingAmount: number;
    completedAmount: number;
    settledCount: number;
    bank: string;
    account: string;
}

export interface CreatorSettlementDto {
    settlement: Settlement[];
    settlementSummary: SettlementSummary;
}