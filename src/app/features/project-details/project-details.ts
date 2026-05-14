import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectDetailResponse } from '../../core/model/project-detail-response';
import { ActivityDto } from '../../core/model/activity-dto';
import { ProjectFileDto } from '../../core/model/project-file-dto';
import { TaskSummaryDto } from '../../core/model/task-summary-dto';
import { TeamMemberDetailDto } from '../../core/model/team-member-detail-dto';
import { ProjectDetailService } from '../../core/services/project-detail-service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PagedResponse } from '../../core/model/paged-response';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
  ],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css',
})
export class ProjectDetails implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // -----------------------------------------------------------------------
  // Estado Principal
  // -----------------------------------------------------------------------
  project: ProjectDetailResponse | null = null;
  loadingMain = true;
  errorMain = '';

  // -----------------------------------------------------------------------
  // Tasks
  // -----------------------------------------------------------------------
  tasks: TaskSummaryDto[] = [];
  tasksPage = 0;
  tasksTotal = 0;
  tasksTotalPages = 0;
  loadingTasks = false;

  // -----------------------------------------------------------------------
  // Activities
  // -----------------------------------------------------------------------
  activities: ActivityDto[] = [];
  activitiesPage = 0;
  activitiesTotal = 0;
  activitiesTotalPages = 0;
  loadingActivities = false;

  // -----------------------------------------------------------------------
  // Team
  // -----------------------------------------------------------------------
  team: TeamMemberDetailDto[] = [];
  teamPage = 0;
  teamTotal = 0;
  teamTotalPages = 0;
  loadingTeam = false;

  // -----------------------------------------------------------------------
  // Files
  // -----------------------------------------------------------------------
  files: ProjectFileDto[] = [];
  filesPage = 0;
  filesTotal = 0;
  filesTotalPages = 0;
  loadingFiles = false;

  private projectId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectDetailService: ProjectDetailService,
    private cd: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.projectId) {
      this.router.navigate(['/projects']);
      return;
    }

    this.loadDetail();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  get remaining(): string {
    const budget = this.project?.budget ?? 0;
    const spent = this.project?.spent ?? 0;
    const remaining = budget - spent;
    return this.formatCurrency(remaining);
  }

  get budgetPercentage(): number {
    const budget = this.project?.budget ?? 0;
    const spent = this.project?.spent ?? 0;

    if (budget === 0) return 0;
    return Math.round((spent / budget) * 100);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  statusChipClass(status: string): string {
    const map: Record<string, string> = {
      'Concluído': 'chip--done',
      'Em Progresso': 'chip--progress',
      'Pendente': 'chip--pending',
    };
    return map[status] ?? '';
  }

  priorityChipClass(priority: string): string {
    const map: Record<string, string> = {
      'Crítica': 'chip--critical',
      'Alta': 'chip--high',
      'Média': 'chip--medium',
      'Baixa': 'chip--low',
    };
    return map[priority] ?? '';
  }

  progressBarColor(progress: number): string {
    if (progress === 100) return 'bar--green';
    if (progress >= 70) return 'bar--blue';
    if (progress >= 40) return 'bar--amber';
    return 'bar--red';
  }

  avatarColor(initials: string): string {
    const colors = ['#3d5af1', '#0ea5a0', '#a855f7', '#f59e0b', '#ef4444', '#22c55e'];
    const index = (initials.charCodeAt(0) + initials.charCodeAt(1)) % colors.length;
    return colors[index];
  }

  editProject() {}

  loadDetail(): void {
    this.loadingMain = true;
    this.errorMain = '';

    this.projectDetailService.getDetail(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('DATA RECEIVED: ', data);
          this.project = data;
          this.loadingMain = false;
          this.cd.detectChanges();

          this.appendPage(data.recentTasks, 'tasks');
          this.appendPage(data.recentActivities, 'activities');
          this.appendPage(data.teamMembers, 'team');
          this.appendPage(data.files, 'files');
        },
        error: (err) => {
          console.error('ERROR FETCHING PROJECT DETAILS');
          this.loadingMain = false;
          this.errorMain = err?.error?.message ?? 'Erro ao carregar projecto.';
        }
    });
  }

  loadMoreTasks(): void {
    if (this.loadingTasks || this.tasksPage + 1 >= this.tasksTotalPages) return;
    this.loadingTasks = true;

    this.projectDetailService.getTasks(this.projectId, this.tasksPage + 1)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingTasks = false))
      .subscribe({
        next: (page) => {
          console.log('SUCCESS');
          this.tasksPage++;
          this.appendPage(page, 'tasks');
          this.cd.detectChanges();
        },
    });
  }

  loadMoreActivities(): void {
    if (this.loadingActivities || this.activitiesPage + 1 >= this.activitiesTotalPages) return;
    this.loadingActivities = true;

    this.projectDetailService.getActivities(this.projectId, this.activitiesPage + 1)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingActivities = false))
      .subscribe({
        next: (page) => {
          this.activitiesPage++;
          this.appendPage(page, 'activities');
          this.cd.detectChanges();
        },
      });
  }

  loadMoreTeam(): void {
    if (this.loadingTeam || this.teamPage + 1 >= this.teamTotalPages) return;
    this.loadingTeam = true;

    this.projectDetailService.getTeam(this.projectId, this.teamPage + 1)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingTeam = false))
      .subscribe({
        next: (page) => {
          this.teamPage++;
          this.appendPage(page, 'team');
          this.cd.detectChanges();
        },
      });
  }

  loadMoreFiles(): void {
    if (this.loadingFiles || this.filesPage + 1 >= this.filesTotalPages) return;
    this.loadingFiles = true;

    this.projectDetailService.getFiles(this.projectId, this.filesPage + 1)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingFiles = false))
      .subscribe({
        next: (page) => {
          this.filesPage++;
          this.appendPage(page, 'files');
          this.cd.detectChanges();
        }
      });
  }

  private appendPage(page: PagedResponse<any>, section: 'tasks' | 'activities' | 'team' | 'files'): void {
    switch (section) {
      case 'tasks':
        this.tasks = [...this.tasks, ...page.content];
        this.tasksTotal = page.totalElements;
        this.tasksTotalPages = page.totalPages;
        break;
      case 'activities':
        this.activities = [...this.activities, ...page.content];
        this.activitiesTotal = page.totalElements;
        this.activitiesTotalPages = page.totalPages;
        break;
      case 'team':
        this.team = [...this.team, ...page.content];
        this.teamTotal = page.totalElements;
        this.teamTotalPages = page.totalPages;
        break;
      case 'files':
        this.files = [...this.files, ...page.content];
        this.filesTotal = page.totalElements;
        this.filesTotalPages = page.totalPages;
        break;
    }
  }

  get hasMoreTasks(): boolean { return this.tasksPage + 1 < this.tasksTotalPages; }
  get hasMoreActivities(): boolean { return this.activitiesPage + 1 < this.activitiesTotalPages; }
  get hasMoreTeam(): boolean { return this.teamPage + 1 < this.teamTotalPages; }
  get hasMoreFiles(): boolean { return this.filesPage + 1 < this.filesTotalPages; }
  
  get budgetPercent(): number {
    if (!this.project?.budget || !this.project?.spent) return 0;
    return Math.min(
      Math.round((Number(this.project.spent) / Number(this.project.budget)) * 100),
      100
    );
  }
}