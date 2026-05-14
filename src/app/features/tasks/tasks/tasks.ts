import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { TaskCard } from '../task-card/task-card';
import { TaskList } from '../task-list/task-list';
import { AuthService } from '../../auth/services/auth-service';
import { Subject, debounceTime, filter } from 'rxjs';
import { TaskSummaryResponse } from '../../../core/model/task-summary-response';
import { Team } from '../../../core/model/team';
import { TaskService } from '../../../core/services/task-service';
import { MatDialog } from '@angular/material/dialog';
import { CreateTaskModal } from '../../modals/create-task-modal/create-task-modal';
import { UpdateTaskModal } from '../../modals/update-task-modal/update-task-modal';
import { DeleteModal } from '../../modals/delete-modal/delete-modal';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddMembers } from '../../modals/add-members/add-members';
import { RemoveMember } from '../../modals/remove-member/remove-member';
import { UpdateProgress } from '../../modals/update-progress/update-progress';
import { UpdateStatus } from '../../modals/update-status/update-status';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskSkeletonComponent } from '../../../shared/loading/task-skeleton.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatMenuModule,
    FormsModule,
    TaskCard,
    TaskList,
    TaskSkeletonComponent,
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit, AfterViewInit {
@ViewChild('scrollAnchor') anchor!: ElementRef;
  view: 'grid' | 'list' = 'grid';
  searchSubject = new Subject<string>();
  searchQuery = '';
  selectedStatus = 'Todos Status';
  selectedPriority = 'Todas as Prioridades';
  isLoading: boolean = false;
  currentPage = 0;
  pageSize = 20;
  hasMore = true;
  isLoadingMore = false;
  showOnlyMine = false;
  isSearching = false;
  
  tasks: TaskSummaryResponse[] =[];
  
  constructor(
    public authService: AuthService,
    private taskService: TaskService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadTasks(true);
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.isSearching = true;
      this.loadTasks(true);
    });
  }
  
  ngAfterViewInit() {
    if (typeof window != 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          this.loadTasks(false);
        }
      });
      if (this.anchor) {
        observer.observe(this.anchor.nativeElement);
      }
    }
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'Em Progresso': 'chip--progress',
      'Concluída': 'chip--done',
      'Pendente': 'chip--pending',
      'Esperando Aprovação': 'chip--pending',
    };
    return map[status] ?? '';
  }
  
  priorityClass(priority: string): string {
    const map: Record<string, string> = {
      'Crítica': 'chip--critical',
      'Alta': 'chip--high',
      'Média': 'chip--medium',
      'Baixa': 'chip--low',
    };
    return map[priority] ?? '';
  }
  
  progressColor(progress: number): string {
    if (progress === 100) return '#22c55e';
    if (progress >= 50) return '#3d5af1';
    if (progress > 0) return '#f59e0b';
    return '#e2e8f0';
  }

  visibleTeam(team: Team[]): Team[] {
    return team.slice(0, 3);
  }
    
  extraTeam(team: Team[]): number {
    return Math.max(0, team.length - 3);
  }

  loadTasks(reset: boolean) {
    if (reset) {
      this.currentPage = 0;
      this.tasks = [];
      this.isLoading = true;
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
      params.myTasksOnly = true;
    } else {
      params.myTasksOnly = this.showOnlyMine;
    }

    if (this.searchQuery) {
      params.search = this.searchQuery
    }

    const reversedStatus = this.reverseStatus(this.selectedStatus);
    const reversedPriority = this.reversePriority(this.selectedPriority);

    if (reversedStatus) {
      params.statuses = [reversedStatus];
    }

    if (reversedPriority) {
      params.priorities = [reversedPriority];
    }

    this.taskService.getTasks(params).subscribe({
      next: (response) => {
        console.log('DATA RECEIVED', response);
        this.isLoading = false;
        this.isSearching = false;
        this.tasks = [...this.tasks, ...response.content];
        this.cd.detectChanges();
        this.hasMore = !response.last;
        this.currentPage++;
        this.isLoadingMore = false;
      },
      error: () => {
        console.error('ERROR FETCHING TASKS');
        this.isLoading = false;
        this.isSearching = false;
        this.isLoadingMore = false;
      }
    });
  }

  reverseStatus(status: string): string {
    const map: any = {
      'Em Progresso': 'EM_PROGRESSO',
      'Concluída': 'COMPLETA',
      'Pendente': 'PENDENTE',
      'Esperando aprovação': 'ESPERANDO_APROVAÇÃO',
      'Bloqueada': 'BLOQUEADA'
    };
    return map[status];
  }

  reversePriority(priority: string): string {
    const map: any = {
      'Alta': 'ALTA',
      'Média': 'MÉDIA',
      'Baixa': 'BAIXA',
      'Crítica': 'CRÍTICA'
    };
    return map[priority];
  }

  onFilterChange() {
    this.loadTasks(true);
  }

  onSearchChange(value: string) {
    this.isSearching = true;
    this.searchSubject.next(value);
  }

  toggleMyProjects() {
    this.showOnlyMine = !this.showOnlyMine;
    this.loadTasks(true);
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        console.log('SUCCESS');
        this.loadTasks(true);
      },
      error: (res) => (console.error('Erro ao apagar tarefa', res))
    });
  }

  openCreateModal(): void {
      const dialogRef = this.dialog.open(CreateTaskModal, {
        width: '560px',
        maxHeight: '90vh',
        disableClose: true,
        autoFocus: true
      });
  
      dialogRef.afterClosed().subscribe(newTask => {
        if (newTask) {
          this.loadTasks(true);
        }
      });
    }
  
    openEditModal(task: any): void {
      const dialogRef = this.dialog.open(UpdateTaskModal, {
        width: '560px',
        data: task
      });
  
      dialogRef.afterClosed().subscribe(updated => {
        if (updated) {
          this.loadTasks(true);
        }
      });
    }
  
    openDeleteModal(task: any): void {
      const dialogRef = this.dialog.open(DeleteModal, {
        width: '320px',
        data: {
          id: task.id,
          name: task.name,
          enetityType: 'Tarefa'
        }
      });
  
      dialogRef.afterClosed().subscribe(id => {
        if (id) {
          this.deleteTask(id);
        }
      });
    }

  openDetail(taskId: string): void {
    this.router.navigate(['/task-details', taskId]);
  }

  onAddMembers(task: TaskSummaryResponse) {
    this.dialog.open(AddMembers, {
      data: {
        taskId:          task.id,
        alreadyAssigned: task.assignees.map(a => a.id),
      }
    })
    .afterClosed()
    .pipe(filter(result => !!result))
    .subscribe(() => this.loadTasks(true));
  }

  onRemoveMember(task: TaskSummaryResponse): void {
    this.dialog.open(RemoveMember, {
      data: {
        taskId:  task.id,
        members: task.assignees,   // AssigneeAvatarDto[] already has id, name, initials, color
      }
    })
    .afterClosed()
    .pipe(filter(result => !!result))
    .subscribe(result => {
      this.tasks = this.tasks.map(t => {
        if (t.id !== task.id) return t;

        return {
          ...t,
          assignees: t.assignees.filter(a => a.id !== result.removedMemberId)
        };
      });
    });
  }

  onUpdateProgress(task: TaskSummaryResponse): void {
    this.dialog.open(UpdateProgress, {
      data: { taskId: task.id, currentProgress: task.progressPercent }
    })
    .afterClosed()
    .pipe(filter(result => !!result))
    .subscribe(() => this.loadTasks(true));   // refresh your task list/detail
  }

  
  onUpdateStatus(task: TaskSummaryResponse): void {
    this.dialog.open(UpdateStatus, {
      data: { taskId: task.id, currentStatus: task.status }
    })
    .afterClosed()
    .pipe(filter(result => !!result))
    .subscribe(() => this.loadTasks(true));
  }

  onComplete(taskId: string) {
    this.taskService.complete(taskId).subscribe(() => this.loadTasks(true));
  }

  onLoadMore() {
    this.loadTasks(false);
  }
}
