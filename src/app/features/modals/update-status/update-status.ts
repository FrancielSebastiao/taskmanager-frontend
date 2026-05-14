import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { TaskService } from '../../../core/services/task-service';

export type TaskStatus = 'PENDENTE' | 'EM_PROGRESSO' | 'BLOQUEADA' | 'ESPERANDO_APROVAÇÃO' | 'COMPLETA';

interface StatusOption {
  value: TaskStatus;
  label: string;
  chipClass: string;
}

@Component({
  selector: 'app-update-status',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule,
    MatFormFieldModule, 
    MatSelectModule, 
    MatProgressSpinnerModule
  ],
  templateUrl: './update-status.html',
  styleUrl: './update-status.css',
})
export class UpdateStatus {

  readonly data: { taskId: string; currentStatus: TaskStatus } = inject(MAT_DIALOG_DATA);

  loading  = false;
  selected: TaskStatus = this.data.currentStatus;

  readonly statuses: StatusOption[] = [
    { value: 'PENDENTE',             label: 'Pendente',             chipClass: 'status-chip--todo'      },
    { value: 'EM_PROGRESSO',         label: 'Em Progresso',         chipClass: 'status-chip--progress'  },
    { value: 'BLOQUEADA',            label: 'Bloqueada',            chipClass: 'status-chip--blocked'   },
    { value: 'ESPERANDO_APROVAÇÃO',  label: 'Esperando Aprovação',  chipClass: 'status-chip--waiting'   },
    { value: 'COMPLETA',             label: 'Concluída',            chipClass: 'status-chip--complete'  },
  ];

  constructor(
    private dialogRef: MatDialogRef<UpdateStatus>,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  get currentOption(): StatusOption | undefined {
    return this.statuses.find(s => s.value === this.data.currentStatus);
  }

  cancel(): void { this.dialogRef.close(); }

  submit(): void {
    this.loading = true;
    this.taskService.updateStatus(this.data.taskId, this.selected)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: result => {
          this.snackBar.open('Estado atualizado com sucesso', 'Fechar', { duration: 3000 });
          this.dialogRef.close(result);
        },
        error: () => this.snackBar.open('Erro ao atualizar estado', 'Fechar', { duration: 3000 }),
      });
  }
}
