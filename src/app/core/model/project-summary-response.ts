import { Team } from "./team";

export interface ProjectSummaryResponse {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  progress: number;
  deadline: string;
  budget: number | null;
  spent: number | null;
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  team: Team[];
  iconBgClass: string;
  iconColorClass: string;
}