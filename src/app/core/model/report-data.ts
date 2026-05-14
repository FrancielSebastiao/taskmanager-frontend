import { LaborReportDto } from "./labor-report-dto";
import { MaterialReportDto } from "./material-report-dto";
import { TaskReportDto } from "./task-report-dto";

export interface ReportData {
    workerName: string;
    workerEmail: string;
    roleName: string;
    periodFrom: string;
    periodTo: string;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    completionRate: number;
    avgCompletionDays: number;
    tasks: TaskReportDto[];
    laborEntries: LaborReportDto[];
    totalAgreed: number;
    totalFinal: number;
    totalBonus: number;
    totalDiscount: number;
    materials: MaterialReportDto[];
    totalMaterialCost: number;
    totalProjectCost: number;
}
