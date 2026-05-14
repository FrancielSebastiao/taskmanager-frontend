import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { TaskSummaryResponse } from '../../../core/model/task-summary-response';
import { Team } from '../../../core/model/team';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskListSkeletonComponent } from '../../../shared/loading/task-list-skeleton.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatMenuModule,
    MatTooltipModule,
    TaskListSkeletonComponent,
  ],
  templateUrl: './task-list.html',
  styleUrls: ['../tasks/tasks.css', './task-list.css'],
})
export class TaskList implements AfterViewInit {
  @ViewChild('scrollAnchor') anchor!: ElementRef;
  @Input() tasks: TaskSummaryResponse[] = [];
  @Input() isLoading = false;
  @Input() isLoadingMore = false;
  @Output() edit = new EventEmitter<TaskSummaryResponse>();
  @Output() delete = new EventEmitter<TaskSummaryResponse>();
  @Output() view = new EventEmitter<string>();
  @Output() addMembers = new EventEmitter<TaskSummaryResponse>();
  @Output() removeMember = new EventEmitter<TaskSummaryResponse>();
  @Output() updateProgress = new EventEmitter<TaskSummaryResponse>();
  @Output() updateStatus = new EventEmitter<TaskSummaryResponse>();
  @Output() complete = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>();

  displayedColumns = ['drag', 'title', 'assignees', 'status', 'priority', 'progress', 'dueDate', 'actions'];

   ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          this.loadMore.emit();
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
}
