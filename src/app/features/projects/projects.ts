import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectSummaryResponse } from '../../core/model/project-summary-response';
import { ProjectService } from '../../core/services/project-service';
import { Team } from '../../core/model/team';
import { ProjectDashboardStatsResponse } from '../../core/model/project-dashboard-stats-response';
import { debounceTime, Subject } from 'rxjs';
import { AuthService } from '../auth/services/auth-service';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectModal } from '../modals/create-project-modal/create-project-modal';
import { UpdateProjectModal } from '../modals/update-project-modal/update-project-modal';
import { DeleteModal } from '../modals/delete-modal/delete-modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit, AfterViewInit {
  @ViewChild('scrollAnchor') anchor!: ElementRef;
  searchQuery = '';
  searchSubject = new Subject<string>();
  selectedStatus = 'Todos os Status';
  selectedPriority = 'Todas as Prioridades';
  isLoading: boolean = false;
  currentPage = 0;
  pageSize = 20;
  hasMore = true;
  isLoadingMore = false;
  showOnlyMine = false;

  projects: ProjectSummaryResponse[] = [];
  statCards: ProjectDashboardStatsResponse = { stats: [] };

  constructor(
    private projectService: ProjectService,
    public authService: AuthService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.loadProjectStats();
    this.loadProjects(true);
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => this.loadProjects(true));
  }

  ngAfterViewInit() {
    if (typeof window != 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          this.loadProjects(false);
        }
      });
      if (this.anchor) {
        observer.observe(this.anchor.nativeElement);
      }
    }
  }

  statusChipClass(status: string): string {
    const map: Record<string, string> = {
      'Concluído':   'chip--done',
      'Em Progresso': 'chip--progress',
      'Planeando':    'chip--pending',
    };
    return map[status] ?? '';
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

  progressBarClass(progress: number): string {
    if (progress === 100) return 'bar--green';
    if (progress >= 70)  return 'bar--blue';
    if (progress >= 40)  return 'bar--amber';
    return 'bar--red';
  }

  visibleTeam(team: Team[]): Team[] {
    return team.slice(0, 3);
  }

  extraTeam(team: Team[]): number {
    return Math.max(0, team.length - 3);
  }

  onFilterChange() {
    this.loadProjects(true);
  }

  toggleMyProjects() {
    this.showOnlyMine = !this.showOnlyMine;
    this.loadProjects(true);
  }


  loadProjectStats() {
    this.projectService.getProjectDashboardStats().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.statCards = res;

        this.cd.detectChanges();
      }, 
      error: () => {
        this.isLoading = false;
        console.log('Erro carregando os stats dos projectos');
      }
    });
  }

  loadProjects(reset: boolean) {
    if (reset) {
      this.currentPage = 0;
      this.projects = [];
      this.hasMore = true;
    }

    if (!this.hasMore || this.isLoadingMore) return;

    this.isLoadingMore = true;

    const params: any = {
      page: this.currentPage,
      size: this.pageSize,
    };

    const isPrivileged = this.authService.isPrivileged();

    if (!isPrivileged) {
      params.myProjectsOnly = true;
    } else {
      params.myProjectsOnly = this.showOnlyMine;
    }

    if (this.searchQuery) {
      params.search = this.searchQuery
    }

    if (this.selectedStatus !== 'Todos os Status') {
      params.statuses = [this.reverseStatus(this.selectedStatus)];
    }

    if (this.selectedPriority !== 'Todas as Prioridades') {
      params.priorities = [this.reversePriority(this.selectedPriority)];
    }

    this.projectService.getProjects(params).subscribe({
      next: (response) => {
        console.log('DATA RECEIVED', response);
        this.isLoading = false;

        this.projects = [...this.projects, ...response.content];
        this.cd.detectChanges();
        this.hasMore = !response.last;
        this.currentPage++;
        this.isLoadingMore = false;
      },
      error: () => {
        console.error('ERROR FETCHING PROJECTS');
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  reverseStatus(status: string): string {
    const map: any = {
      'Em Progresso': 'EM_PROGRESSO',
      'Concluído': 'COMPLETO',
      'Pendente': 'PENDENTE'
    };
    return map[status];
  }

  reversePriority(priority: string): string {
    const map: any = {
      'Alta': 'ALTA',
      'Média': 'MÉDIA',
      'Baixa': 'BAIXA'
    };
    return map[priority]
  }

  deleteProject(id: string) {
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        console.log('SUCCESS');
        this.loadProjects(true);
        this.loadProjectStats();
      },
      error: (res) => (console.error('Erro ao apagar projecto', res))
    });
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(CreateProjectModal, {
      width: '560px',
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(newProject => {
      if (newProject) {
        this.loadProjects(true);
        this.loadProjectStats();
      }
    });
  }

  openEditModal(project: any): void {
    const dialogRef = this.dialog.open(UpdateProjectModal, {
      width: '560px',
      data: project
    });

    dialogRef.afterClosed().subscribe(updated => {
      if (updated) {
        this.loadProjects(true);
        this.loadProjectStats();
      }
    });
  }

  openDeleteModal(project: any): void {
    const dialogRef = this.dialog.open(DeleteModal, {
      width: '320px',
      data: {
        id: project.id,
        name: project.name,
        enetityType: 'Projecto'
      }
    });

    dialogRef.afterClosed().subscribe(id => {
      if (id) {
        this.deleteProject(id);
      }
    });
  }

  openDetail(projectId: string): void {
    this.router.navigate(['/project-details', projectId]);
  }
}