import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../../core/services/project-service';
import { ProjectForm } from '../../forms/project-form/project-form';

@Component({
  selector: 'app-update-project-modal',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ProjectForm,
  ],
  templateUrl: './update-project-modal.html',
  styleUrls: ['../../forms/project-form/project-form.css', './update-project-modal.css'],
})
export class UpdateProjectModal {
  constructor(
    private projectSvc: ProjectService,
    private dialogRef: MatDialogRef<UpdateProjectModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  update(formData: any) {
    this.projectSvc.updateProject(this.data.id, formData).subscribe({
      next: (project) => {
        console.log('SUCCESS');
        this.dialogRef.close(project);
      },
      error: () => {
        console.error('Erro ao atualizar projecto');
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
