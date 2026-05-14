import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CategoryService } from '../../../core/services/category-service';
import { ProjectService } from '../../../core/services/project-service';
import { UserService } from '../../../core/services/user-service';
import { ProjectForm } from '../../forms/project-form/project-form';

@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ProjectForm,
  ],
  templateUrl: './create-project-modal.html',
  styleUrls: ['../../forms/project-form/project-form.css', './create-project-modal.css'],
})
export class CreateProjectModal implements OnInit {

  form!: FormGroup;
  loading       = false;
  loadingData   = true;
  errorMessage  = '';
  managers:     { id: string; name: string }[] = [];
  categories:   { id: string; name: string }[] = [];
  today         = new Date();

  readonly priorities = [
    { value: 'BAIXA',      label: 'Baixa'    },
    { value: 'MÉDIA',   label: 'Média'    },
    { value: 'ALTA',     label: 'Alta'     },
    { value: 'CRÍTICA', label: 'Crítica'  },
  ];

  readonly statuses = [
    { value: 'PLANEANDO',    label: 'Planeamento' },
    { value: 'EM_PROGRESSO', label: 'Em Progresso' },
    { value: 'EM_PAUSA',     label: 'Em Pausa' },
    { value: 'CANCELADO',    label: 'Cancelado' },
    { value: 'COMPLETO',     label: 'Completo' },
  ];

  constructor(
    private fb:          FormBuilder,
    private dialogRef:   MatDialogRef<CreateProjectModal>,
    private projectSvc:  ProjectService,
    private categorySvc: CategoryService,
    private userSvc:     UserService,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadFormData();
  }

  // -------------------------------------------------------------------------
  // Form
  // -------------------------------------------------------------------------

  private buildForm(): void {
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      description: ['', Validators.maxLength(500)],
      priority:    ['MÉDIA', Validators.required],
      status:      ['PLANEANDO', Validators.required],
      startDate:   [this.today, Validators.required],
      deadline:    [null, Validators.required],
      managerId:   ['', Validators.required],
      categoryId:  [''],
      budget:      [null, Validators.min(0)],
    }, { validators: this.deadlineAfterStartDate });
  }

  // Validator — deadline deve ser depois de startDate
  private deadlineAfterStartDate(group: FormGroup) {
    const start    = group.get('startDate')?.value;
    const deadline = group.get('deadline')?.value;
    if (start && deadline && new Date(deadline) <= new Date(start)) {
      return { deadlineBeforeStart: true };
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------------

  private loadFormData(): void {
    this.loadingData = true;

    // Carrega managers e categorias em paralelo
    forkJoin({
      managers: this.userSvc.getUsers(),
      categories: this.categorySvc.getCategories()
    }).subscribe({
      next: ({managers, categories}) => {
        this.managers   = managers ?? [];
        this.categories = categories ?? [];
        this.loadingData = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading modal data', err);
        this.errorMessage = 'Erro ao carregar dados. Tente novamente.';
        this.loadingData = false;
      }
    });
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading      = true;
    this.errorMessage = '';

    const payload = {
      ...this.form.value,
      startDate: this.formatDate(this.form.value.startDate),
      deadline:  this.formatDate(this.form.value.deadline),
      budget:    Number(this.form.value.budget),
    };

    this.projectSvc.createProject(payload).subscribe({
      next: (project) => {
        this.loading = false;
        this.dialogRef.close(project); // devolve o projecto criado ao componente pai
      },
      error: (err) => {
        this.loading      = false;
        this.errorMessage = err?.error?.message ?? 'Erro ao criar projecto. Tente novamente.';
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  create(data: any) {
     this.projectSvc.createProject(data).subscribe({
      next: (project) => {
        this.loading = false;
        this.dialogRef.close(project); // devolve o projecto criado ao componente pai
      },
      error: (err) => {
        this.loading      = false;
        this.errorMessage = err?.error?.message ?? 'Erro ao criar projecto. Tente novamente.';
      },
    });
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private formatDate(date: Date): string {
    return date ? new Date(date).toISOString().split('T')[0] : '';
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched || !control?.errors) return '';

    if (control.errors['required'])   return 'Campo obrigatório';
    if (control.errors['minlength'])  return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength'])  return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['min'])        return 'Valor deve ser maior que 0';

    return '';
  }

  hasFormError(error: string): boolean {
    return this.form.hasError(error) &&
           !!this.form.get('startDate')?.touched &&
           !!this.form.get('deadline')?.touched;
  }
}
