import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TaskService } from '../../../core/services/task-service';
import { UpdateProjectModal } from '../update-project-modal/update-project-modal';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskForm } from '../../forms/task-form/task-form';

@Component({
  selector: 'app-update-task-modal',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    TaskForm,
  ],
  templateUrl: './update-task-modal.html',
  styleUrl: './update-task-modal.css',
})
export class UpdateTaskModal {
    constructor(
      private taskSvc: TaskService,
      private dialogRef: MatDialogRef<UpdateProjectModal>,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {}
  
    update(formData: any) {
      this.taskSvc.updateTask(this.data.id, formData).subscribe({
        next: (task) => {
          console.log('SUCCESS');
          this.dialogRef.close(task);
        },
        error: () => {
          console.error('Erro ao atualizar tarefa');
        }
      });
    }
  
    cancel(): void {
      this.dialogRef.close(null);
    }
}
