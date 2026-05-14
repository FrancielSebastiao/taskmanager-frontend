import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable, shareReplay, map } from 'rxjs';
import { PagedResponse } from '../../core/model/paged-response';
import { StatCardDto } from '../../core/model/stat-card-dto';
import { TimelinePointDto } from '../../core/model/timeline-point-dto';
import { UpcomingTaskDto } from '../../core/model/upcoming-task-dto';
import { DashboardPeriod, DashboardService } from '../../core/services/dashboard-service';
import { DashboardRecentActivityDto } from '../../core/model/dashboard-recent-activity-dto';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssigneeAvatarDto } from '../../core/model/assignee-avatar-dto';
import { TaskList } from '../tasks/task-list/task-list';
import { TaskCard } from '../tasks/task-card/task-card';
import { TaskSummaryResponse } from '../../core/model/task-summary-response';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    TaskList,
    TaskCard,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats$:            Observable<StatCardDto[]>                           | null = null;
  timeline$:         Observable<TimelinePointDto[]>                      | null = null;
  recentActivities$: Observable<PagedResponse<DashboardRecentActivityDto>> | null = null;
  upcomingTasks$:    Observable<PagedResponse<UpcomingTaskDto>>          | null = null;

  upcomingView: 'grid' | 'list' = 'list';
  recentPage   = 0;
  upcomingPage = 0;

  selectedPeriod: DashboardPeriod = 'LAST_7_DAYS';   // drives both dashboard and timeline

  readonly todayIso     = new Date().toISOString().split('T')[0];
  readonly skeletonBars = Array(7);

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  // ── Single entry point — call this when period changes ───────────────────

  loadAll(): void {
    this.loadDashboard();
    this.loadTimeline();
    this.loadUpcomingTasks();   // independent — no need to be inside dashboard$
  }

  loadDashboard(): void {
    const dashboard$ = this.dashboardService.getDashboard({
      period: this.selectedPeriod,
    }).pipe(shareReplay(1));    // one HTTP call, two subscribers (stats + recent)

    this.stats$            = dashboard$.pipe(map(r =>  r.stats ));
    this.recentActivities$ = dashboard$.pipe(map(r => r.recentActivities));

    console.log('Stats:', this.stats$);
  }

  // ── Period change (dropdown) ──────────────────────────────────────────────

  onTimelinePeriodChange(period: DashboardPeriod): void {
    this.selectedPeriod = period;
    this.loadTimeline();             // refresh everything when period changes
  }

  // ── Timeline ─────────────────────────────────────────────────────────────

  loadTimeline(): void {
    this.timeline$ = this.dashboardService.getTimeline({
      period: this.selectedPeriod,
    });
  }

  // ── Upcoming tasks pagination ─────────────────────────────────────────────

  loadUpcomingTasks(): void {
    this.upcomingTasks$ = this.dashboardService.getUpcomingTasks({
      page: this.upcomingPage,
    });
  }

  onUpcomingPageChange(page: number): void {
    this.upcomingPage = page;
    this.loadUpcomingTasks();
  }

  // ── Recent activities pagination ──────────────────────────────────────────

  // Recent activities come from the main dashboard$ response on first load.
  // This is only called when the user explicitly pages through them.
  loadRecentActivities(): void {
    this.recentActivities$ = this.dashboardService.getRecentActivities({
      page: this.recentPage,
    });
  }

  onRecentPageChange(page: number): void {
    this.recentPage = page;
    this.loadRecentActivities();  // independent call for page 2+
  }

  // ── Display helpers ───────────────────────────────────────────────────────

  statusLabel(status: string): string {
    const map: any = {
      EM_PROGRESSO: 'Em Progresso',
      COMPLETA: 'Concluída',
      BLOQUEADA: 'Bloqueada',
      ESPERANDO_APROVAÇÃO: 'Esperando Aprovação',
      PENDENTE: 'Pendente'
    };
    return map[status] ?? status;
  }

  priorityChipClass(priority: string): string {
    const map: Record<string, string> = {
      'Crítica': 'chip--critical',
      'Alta':  'chip--high',
      'Média': 'chip--medium',
      'Baixa': 'chip--low',
    };
    return map[priority] ?? '';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      TODO:         'status-chip--todo',
      EM_PROGRESSO: 'status-chip--progress',
      COMPLETA:     'status-chip--complete',
      CANCELADA:    'status-chip--cancelled',
    };
    return map[status] ?? '';
  }

  priorityLabel(priority: string): string {
      const map: any = {
        CRÍTICA: 'Crítica',
        ALTA: 'Alta',
        MÉDIA: 'Média',
        BAIXA: 'Baixa',
      };
      return map[priority] ?? priority;
    }

  priorityClass(priority: string): string {
    const map: Record<string, string> = {
      BAIXA:   'priority-chip--low',
      MEDIA:   'priority-chip--medium',
      ALTA:    'priority-chip--high',
      CRITICA: 'priority-chip--critical',
    };
    return map[priority] ?? '';
  }

  progressColor(percent: number): 'primary' | 'accent' | 'warn' {
    if (percent >= 75) return 'primary';
    if (percent >= 40) return 'accent';
    return 'warn';
  }

  // ── Timeline helpers ──────────────────────────────────────────────────────

  barHeight(point: TimelinePointDto, all: TimelinePointDto[]): number {
    const max = Math.max(...all.map(p => p.created), 1);   // avoid division by zero
    return Math.round((point.created / max) * 100);
  }

  barTooltip(point: TimelinePointDto): string {
    return [
      `Data: ${point.date}`,
      `Criadas: ${point.created}`,
      `Concluídas: ${point.completed}`,
      `Em progresso: ${point.inProgress}`,
      `Atrasadas: ${point.overdue}`,
    ].join('\n');
  }

  sliceAssignees(assignees: AssigneeAvatarDto[], max: number): AssigneeAvatarDto[] {
    return assignees.slice(0, max);
  }

  // Add to dashboard.ts
  upcomingTasksForDisplay(tasks: UpcomingTaskDto[]): TaskSummaryResponse[] {
    return tasks.map(t => ({
      id:              t.id,
      title:           t.title,
      description:     null,         // not available in dashboard context
      status:          t.status,
      priority:        t.priority,
      progressPercent: t.progressPercent,
      dueDate:         t.dueDate,
      assignees:       t.assignees,
    }));
  }
}
