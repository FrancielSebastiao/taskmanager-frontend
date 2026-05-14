import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Team } from '../../../core/model/team';
import { TaskSummaryResponse } from '../../../core/model/task-summary-response';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskCardSkeletonComponent } from '../../../shared/loading/task-card-skeleton.component';


@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatMenuModule,
    MatTooltipModule,
    TaskCardSkeletonComponent,
  ],
  templateUrl: './task-card.html',
  styleUrls: ['../tasks/tasks.css', './task-card.css'],
})
export class TaskCard implements AfterViewInit {
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
  @Output() complete = new EventEmitter<string>()
  @Output() loadMore = new EventEmitter<void>();

  private isObserving = false;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          this.isObserving = true;
          this.loadMore.emit();

          setTimeout(() => this.isObserving = false, 500);
        }
      });

      observer.observe(this.anchor.nativeElement); 
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
