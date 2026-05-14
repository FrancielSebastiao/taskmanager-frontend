import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AnalyticsDashboardResponse } from '../../core/model/analytics-dashboard-response';
import { LaborReportDto } from '../../core/model/labor-report-dto';
import { ReportPeriod } from '../../core/model/report-period';
import { ReportsService } from '../../core/services/reports-service';

export interface Metric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  colorClass: string;
  iconColorClass: string;
  comparison: string;
}

export interface ChartPoint {
  month: string;
  value: number;
  completed: number;
}

export interface PieSlice {
  label: string;
  value: number;
  percent: number;
  color: string;
  bgClass: string;
}

export interface TeamMember {
  name: string;
  completed: number;
  total: number;
  avatar: string;
  trend: 'up' | 'down';
}

export interface Category {
  category: string;
  count: number;
  colorClass: string;
  bgClass: string;
  change: string;
  positive: boolean;
}

export interface ActivityLog {
  activity: string;
  type: string;
  user: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  date: string;
  duration: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatFormFieldModule,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  activeRange = 'Últimos 30 Dias';
  currentPeriod = ReportPeriod.LAST_30_DAYS;
  pieTotal = 0;

  dateRanges = [
    { label: 'Hoje', value: ReportPeriod.TODAY },
    { label: 'Últimos 7 Dias', value: ReportPeriod.LAST_7_DAYS },
    { label: 'Últimos 30 Dias', value: ReportPeriod.LAST_30_DAYS },
    { label: 'Último Trimestre', value: ReportPeriod.LAST_QUARTER },
    { label: 'Último Ano', value: ReportPeriod.LAST_YEAR },
    { label: 'Personalizado', value: ReportPeriod.CUSTOM }
  ];

  metrics: Metric[] = [];
  chartPoints: ChartPoint[] = [];
  pieSlices: PieSlice[] = [];
  teamMembers: TeamMember[] = [];
  categories: Category[] = [];
  activityLog: ActivityLog[] = [];
  laborEntries: LaborReportDto[] = [];

  logColumns = ['activity', 'type', 'user', 'status', 'date', 'duration'];
  laborColumns = ['taskTitle', 'startDate', 'expectedEndDate', 'actualEndDate', 
                  'allocatedDays', 'actualDays', 'agreedAmount', 'finalAmount', 
                  'adjustment', 'outcome'];

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.reportsService.getAnalytics(this.currentPeriod).subscribe({
      next: (response) => {
        this.mapAnalyticsToView(response);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
      }
    });
  }

  onRangeChange(range: { label: string; value: ReportPeriod }): void {
    this.activeRange = range.label;
    this.currentPeriod = range.value;
    this.loadAnalytics();
  }

  private mapAnalyticsToView(data: AnalyticsDashboardResponse): void {
    // Map metrics
    this.metrics = [
      {
        label: 'Total de Atividades',
        value: data.metrics.totalActivities.toString(),
        change: this.formatChange(data.metrics.changes.totalActivities),
        trend: data.metrics.changes.totalActivities >= 0 ? 'up' : 'down',
        icon: 'bar_chart',
        colorClass: 'metric-icon--blue',
        iconColorClass: 'icon--blue',
        comparison: 'vs mês passado',
      },
      {
        label: 'Taxa de Conclusão',
        value: `${data.metrics.completionRate.toFixed(1)}%`,
        change: this.formatChange(data.metrics.changes.completionRate),
        trend: data.metrics.changes.completionRate >= 0 ? 'up' : 'down',
        icon: 'check_circle',
        colorClass: 'metric-icon--green',
        iconColorClass: 'icon--green',
        comparison: 'vs mês passado',
      },
      {
        label: 'Usuários Ativos',
        value: data.metrics.activeUsers.toString(),
        change: this.formatChange(data.metrics.changes.activeUsers),
        trend: data.metrics.changes.activeUsers >= 0 ? 'up' : 'down',
        icon: 'group',
        colorClass: 'metric-icon--purple',
        iconColorClass: 'icon--purple',
        comparison: 'vs mês passado',
      },
      {
        label: 'Tempo Médio de Conclusão',
        value: `${data.metrics.avgCompletionDays.toFixed(1)} dias`,
        change: this.formatChange(data.metrics.changes.avgCompletionDays, true),
        trend: data.metrics.changes.avgCompletionDays <= 0 ? 'up' : 'down',
        icon: 'schedule',
        colorClass: 'metric-icon--amber',
        iconColorClass: 'icon--amber',
        comparison: 'vs mês passado',
      },
    ];

    // Map chart points
    this.chartPoints = data.activityTrend.map(item => ({
      month: item.month,
      value: item.created,
      completed: item.completed
    }));

    // Map pie slices
    const total = data.statusDistribution.completed + 
                  data.statusDistribution.inProgress + 
                  data.statusDistribution.pending;

    this.pieTotal = total;
    
    this.pieSlices = [
      {
        label: 'Concluída',
        value: data.statusDistribution.completed,
        percent: Math.round((data.statusDistribution.completed / total) * 100),
        color: '#22c55e',
        bgClass: 'dot--green'
      },
      {
        label: 'Em Progresso',
        value: data.statusDistribution.inProgress,
        percent: Math.round((data.statusDistribution.inProgress / total) * 100),
        color: '#f97316',
        bgClass: 'dot--amber'
      },
      {
        label: 'Pendente',
        value: data.statusDistribution.pending,
        percent: Math.round((data.statusDistribution.pending / total) * 100),
        color: '#3b82f6',
        bgClass: 'dot--blue'
      },
    ];

    // Map team members
    this.teamMembers = data.teamPerformance.map(member => ({
      name: member.userName,
      completed: member.completed,
      total: member.total,
      avatar: this.initials(member.userName),
      trend: 'up' as 'up' | 'down' // You can calculate this based on historical data
    }));

    // Map categories
    const categoryColors = [
      { colorClass: 'bar--purple', bgClass: 'dot-bg--purple' },
      { colorClass: 'bar--blue', bgClass: 'dot-bg--blue' },
      { colorClass: 'bar--green', bgClass: 'dot-bg--green' },
      { colorClass: 'bar--amber', bgClass: 'dot-bg--amber' },
      { colorClass: 'bar--red', bgClass: 'dot-bg--red' },
      { colorClass: 'bar--gray', bgClass: 'dot-bg--gray' },
    ];

    this.categories = data.categoryBreakdown.map((cat, index) => ({
      category: cat.category,
      count: cat.count,
      colorClass: categoryColors[index % categoryColors.length].colorClass,
      bgClass: categoryColors[index % categoryColors.length].bgClass,
      change: cat.change >= 0 ? `+${cat.change}` : `${cat.change}`,
      positive: cat.change >= 0
    }));

    // Map activity log
    this.activityLog = data.recentActivities.map(activity => ({
      activity: activity.activity,
      type: activity.type,
      user: activity.user,
      status: activity.status as 'Completed' | 'In Progress' | 'Pending',
      date: activity.date,
      duration: activity.duration
    }));
  }

  private formatChange(value: number, inverse: boolean = false): string {
    const formatted = Math.abs(value).toFixed(1);
    if (inverse) {
      return value <= 0 ? `+${formatted}` : `-${formatted}`;
    }
    return value >= 0 ? `+${formatted}%` : `${formatted}%`;
  }

  memberPercent(m: TeamMember): number {
    return Math.round((m.completed / m.total) * 100);
  }

  memberBarClass(m: TeamMember): string {
    const p = this.memberPercent(m);
    if (p >= 80) return 'bar--green';
    if (p >= 60) return 'bar--blue';
    return 'bar--amber';
  }

  categoryPercent(count: number): number {
    const max = Math.max(...this.categories.map(c => c.count));
    return Math.round((count / max) * 100);
  }

  statusChipClass(status: string): string {
    const map: Record<string, string> = {
      'Completed': 'chip--done',
      'In Progress': 'chip--progress',
      'Pending': 'chip--pending',
      'COMPLETA': 'chip--done',
      'EM_PROGRESSO': 'chip--progress',
      'PENDENTE': 'chip--pending',
    };
    return map[status] ?? '';
  }

  outcomeChipClass(outcome: string): string {
    const map: Record<string, string> = {
      'BONUS': 'chip--bonus',
      'ON_TIME': 'chip--done',
      'DISCOUNT': 'chip--discount',
      'PENDING': 'chip--pending',
    };
    return map[outcome] ?? '';
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  formatCurrency(value: number | null): string {
    if (value === null) return '—';
    return `${value.toFixed(2)} AOA`;
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-AO');
  }

  // SVG line chart helpers
  chartWidth = 560;
  chartHeight = 200;
  chartPadLeft = 40;
  chartPadBottom = 28;

  private toX(i: number): number {
    const usable = this.chartWidth - this.chartPadLeft;
    return this.chartPadLeft + (i / (this.chartPoints.length - 1)) * usable;
  }

  private toY(v: number): number {
    const max = Math.max(...this.chartPoints.map(p => Math.max(p.value, p.completed)));
    return this.chartHeight - this.chartPadBottom - (v / max) * (this.chartHeight - this.chartPadBottom);
  }

  get createdPath(): string {
    if (this.chartPoints.length === 0) return '';
    return this.chartPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${this.toX(i)},${this.toY(p.value)}`)
      .join(' ');
  }

  get completedPath(): string {
    if (this.chartPoints.length === 0) return '';
    return this.chartPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${this.toX(i)},${this.toY(p.completed)}`)
      .join(' ');
  }

  chartDotX(i: number): number { return this.toX(i); }
  chartDotY(v: number): number { return this.toY(v); }

  // Pie chart
  readonly circumference = 2 * Math.PI * 40;

  pieOffset(index: number): number {
    const prior = this.pieSlices.slice(0, index).reduce((s, sl) => s + sl.percent, 0);
    return -(prior / 100) * this.circumference;
  }

  pieDash(percent: number): string {
    const arc = (percent / 100) * this.circumference;
    return `${arc} ${this.circumference}`;
  }

  get totalActivities(): number {
    return this.pieSlices.reduce((sum, slice) => sum + slice.value, 0);
  }
}
