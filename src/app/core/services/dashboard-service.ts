import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DashboardResponse } from '../model/dashboard-response';
import { PagedResponse } from '../model/paged-response';
import { TimelinePointDto } from '../model/timeline-point-dto';
import { UpcomingTaskDto } from '../model/upcoming-task-dto';
import { DashboardRecentActivityDto } from '../model/dashboard-recent-activity-dto';
import { environment } from '../../../environments/environment';

export type DashboardPeriod = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS';

export interface DashboardParams {
  period: DashboardPeriod;
}

export interface TimelineParams {
  period: DashboardPeriod;
}

export interface UpcomingTasksParams {
  page?: number;
  size?: number;
  sortBy?:  string;
  sortDir?: 'asc' | 'desc';
}

export interface RecentActivitiesParams {
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl + '/dashboard';

  // ── Full dashboard load ───────────────────────────────────────────────────

  getDashboard(params: DashboardParams): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.BASE, {
      params: this.toHttpParams(params),
    });
  }

  getTimeline(params: TimelineParams): Observable<TimelinePointDto[]> {
    return this.http.get<TimelinePointDto[]>(`${this.BASE}/timeline`, {
      params: this.toHttpParams(params),
    });
  }

  getUpcomingTasks(params: UpcomingTasksParams): Observable<PagedResponse<UpcomingTaskDto>> {
    const defaults = { page: 0, size: 10, sortBy: 'dueDate', sortDir: 'asc' };
    return this.http.get<PagedResponse<UpcomingTaskDto>>(`${this.BASE}/upcoming-tasks`, {
      params: this.toHttpParams({ ...defaults, ...params }),
    }).pipe(
            map(response => ({
              ...response,
              content: response.content.map(task => ({
              ...task,
              status: this.mapStatus(task.status),
              priority: this.mapPriority(task.priority)
            }))
          }))
        );
  }

  getRecentActivities(params: RecentActivitiesParams): Observable<PagedResponse<DashboardRecentActivityDto>> {
    return this.http.get<PagedResponse<DashboardRecentActivityDto>>(`${this.BASE}/recent-activities`, {
      params: this.toHttpParams({ page: 0, ...params }),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Builds the from/to date range for the current month.
   * Use this to populate DashboardParams on component init.
   */
  currentMonthRange(): { from: string; to: string } {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth();

    const from = new Date(year, month, 1);
    const to   = new Date(year, month + 1, 0);   // last day of month

    return {
      from: this.formatDate(from),
      to:   this.formatDate(to),
    };
  }

  /**
   * Builds a from/to range for the last N days (used by the timeline dropdown).
   */
  lastNDaysRange(days: number): { from: string; to: string } {
    const to   = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));

    return {
      from: this.formatDate(from),
      to:   this.formatDate(to),
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];    // "2026-04-14"
  }

  private toHttpParams<T extends Object>(obj: T): HttpParams {
    return Object.entries(obj).reduce(
      (p, [k, v]) => v != null ? p.set(k, String(v)) : p,
      new HttpParams()
    );
  }

  private mapStatus(status: string): string {
    const map: any = {
      EM_PROGRESSO: 'Em Progresso',
      COMPLETA: 'Concluída',
      BLOQUEADA: 'Bloqueada',
      ESPERANDO_APROVAÇÃO: 'Esperando Aprovação',
      PENDENTE: 'Pendente'
    };
    return map[status] ?? status;
  }

  private mapPriority(priority: string): string {
    const map: any = {
      CRÍTICA: 'Crítica',
      ALTA: 'Alta',
      MÉDIA: 'Média',
      BAIXA: 'Baixa',
    };
    return map[priority] ?? priority;
  }
}
