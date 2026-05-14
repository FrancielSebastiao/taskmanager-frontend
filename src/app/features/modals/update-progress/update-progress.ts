import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { TaskService } from '../../../core/services/task-service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-update-progress',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule,
    MatButtonModule, 
    MatSliderModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './update-progress.html',
  styleUrl: './update-progress.css',
})
export class UpdateProgress {
  private readonly data: { taskId: string; currentProgress: number } = inject(MAT_DIALOG_DATA);

  progress = this.data.currentProgress ?? 0;
  loading  = false;

  constructor(
    private dialogRef: MatDialogRef<UpdateProgress>,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  get barColor(): 'primary' | 'accent' | 'warn' {
    if (this.progress >= 75) return 'primary';
    if (this.progress >= 40) return 'accent';
    return 'warn';
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.loading = true;
    this.taskService.updateTaskProgress(this.data.taskId, { progressPercent: this.progress })
      .pipe(finalize(() => {
        this.loading = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: result => {
          this.snackBar.open('Progresso atualizado com sucesso', 'Fechar', { duration: 3000 });
          this.dialogRef.close(result);
        },
        error: () => this.snackBar.open('Erro ao atualizar progresso', 'Fechar', { duration: 3000 }),
      });
  }
}
