import { Team } from "./team";

export interface TaskSummaryResponse {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    progressPercent: number;
    assignees: Team[];
    dueDate: string;
}
