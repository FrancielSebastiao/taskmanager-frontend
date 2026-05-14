import { ChangeDetectorRef, Component, inject, Inject } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user-service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { TaskService } from '../../../core/services/task-service';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface UserOption {
  id:       string;
  name:     string;
  initials: string;
  color:    string;
}

@Component({
  selector: 'app-add-members',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatButtonModule,
    MatFormFieldModule, 
    MatSelectModule, 
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './add-members.html',
  styleUrl: './add-members.css',
})
export class AddMembers {
  readonly data: { taskId: string; alreadyAssigned: string[] } = inject(MAT_DIALOG_DATA);

  loading        = false;
  availableUsers: UserOption[] = [];
  userIdsControl = new FormControl<string[]>([]);

  constructor(
    private dialogRef: MatDialogRef<AddMembers>,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Replace with your actual members/users service call
    this.taskService.getAvailableMembers(this.data.taskId).subscribe(users => {
      // Filter out already-assigned members
      this.availableUsers = users.filter(u => !this.data.alreadyAssigned.includes(u.id));
    });
  }

  getUser(id: string): UserOption | undefined {
    return this.availableUsers.find(u => u.id === id);
  }

  cancel(): void { this.dialogRef.close(); }

  submit(): void {
    const ids = this.userIdsControl.value ?? [];
    if (!ids.length) return;

    this.loading = true;
    this.taskService.addAssignees(this.data.taskId, ids)
      .pipe(finalize(() => {
        this.loading = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: result => {
          this.snackBar.open(`${ids.length} membro(s) adicionado(s)`, 'Fechar', { duration: 3000 });
          this.dialogRef.close(result);
        },
        error: () => this.snackBar.open('Erro ao adicionar membros', 'Fechar', { duration: 3000 }),
      });
  }
}
