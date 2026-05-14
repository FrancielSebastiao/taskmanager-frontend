import { ChangeDetectorRef, Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TaskService } from '../../../core/services/task-service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

export interface MemberOption {
  id:       string;
  name:     string;
  initials: string;
  color:    string;
  role?:    string;
}


@Component({
  selector: 'app-remove-member',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatProgressSpinnerModule
  ],
  templateUrl: './remove-member.html',
  styleUrl: './remove-member.css',
})
export class RemoveMember {
  readonly data: { taskId: string; members: MemberOption[] } = inject(MAT_DIALOG_DATA);

  members:    MemberOption[] = [...this.data.members];  // local copy — remove rows as they're deleted
  removingId: string | null  = null;

  constructor(
    private dialogRef: MatDialogRef<RemoveMember>,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  remove(member: MemberOption): void {
    this.removingId = member.id;
    this.taskService.removeAssignee(this.data.taskId, member.id)
      .pipe(finalize(() => {
        this.removingId = null;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.members = this.members.filter(m => m.id !== member.id);

          this.snackBar.open(`${member.name} removido(a)`, 'Fechar', { duration: 3000 });

          this.dialogRef.close({
            removedMemberId: member.id
          });
        },
        error: () => this.snackBar.open('Erro ao remover membro', 'Fechar', { duration: 3000 }),
      });
  }

  cancel(): void { this.dialogRef.close(); }
}
