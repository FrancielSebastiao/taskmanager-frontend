import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TaskService } from '../../../core/services/task-service';
import { CreateProjectModal } from '../create-project-modal/create-project-modal';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskForm } from '../../forms/task-form/task-form';

@Component({
  selector: 'app-create-task-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TaskForm,
  ],
  templateUrl: './create-task-modal.html',
  styleUrls: ['../../forms/project-form/project-form.css', './create-task-modal.css'],
})
export class CreateTaskModal {
  @Input() loading       = false;
  @Input() errorMessage  = '';
  loadingData   = true;
  
  constructor(
    private dialogRef:   MatDialogRef<CreateProjectModal>,
    private taskSvc:     TaskService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
  cancel(): void {
    this.dialogRef.close(null);
  }
  
  create(data: any) {
    this.taskSvc.createTask(data).subscribe({
      next: (task) => {
        this.loading = false;
        this.dialogRef.close(task); // devolve a tarefa criado ao componente pai
      },
      error: (err) => {
        this.loading      = false;
        this.errorMessage = err?.error?.message ?? 'Erro ao criar Tarefa. Tente novamente.';
      },
    });
  }

}
