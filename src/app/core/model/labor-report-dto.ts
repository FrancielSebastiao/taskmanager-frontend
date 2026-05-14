export interface LaborReportDto {
    taskTitle: string;
    startDate: string;
    expectedEndDate: string;
    actualEndDate: string | null;
    allocatedDays: number;
    actualDays: number | null;
    agreedAmount: number;
    finalAmount: number | null;
    adjustment: number | null;
    outcome: 'BONUS' | 'DISCOUNT' | 'ON_TIME' | 'PENDING';
}
