export interface ProjectFilters {
    statuses: string[];
    priorities: string[];
    category: string;
    managerId: string;
    deadlineFrom: string;
    deadlineTo: string;
    myProjectsOnly: boolean;
    page: number;
    size: number;
    sortBy: string;
    sortDir: string;
    search: string;
}
