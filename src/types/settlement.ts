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
    bank: string | null;
    account: string | null;
}

export interface CreatorSettlementDto {
    settlement: Settlement[];
    settlementSummary: SettlementSummary;
}

export interface SettlementItem {
    settlementId: number;
    projectId: number;
    projectTitle: string;
    creatorId: number;
    creatorName: string;
    totalAmount: number;
    fee: number;
    settlementAmount: number;
    refundAmount: number;
    settlementDate: Date;
    settlementStatus: 'WAITING' | 'PAID';
}

export interface SearchSettlementParams {
    q?: string;
    status?: 'ALL' | 'WAITING' | 'PAID';
    from?: string;
    to?: string;
    page?: number;
    size?: number;
    perGroup?: number;
}