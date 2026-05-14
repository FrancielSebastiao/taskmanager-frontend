import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CategoryService } from '../../../core/services/category-service';
import { UserService } from '../../../core/services/user-service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ProjectService } from '../../../core/services/project-service';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-task-form',
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
    MatChipsModule,
  ],
  templateUrl: './task-form.html',
  styleUrls: ['../project-form/project-form.css', './task-form.css'],
})
export class TaskForm {
  @Input() initialData: any = null;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancelClick = new EventEmitter<void>();

  form!: FormGroup;

  members:      { id: string, name: string }[] = [];
  categories:   { id: string, name: string }[] = [];
  projects:     { id: string, name: string }[] = [];

  loadingData   = true; 
  loading = false;
  errorMessage = ''; 

  today = new Date();

  readonly priorities = [
    { value: 'BAIXA',     label: 'Baixa'    },
    { value: 'MÉDIA',     label: 'Média'    },
    { value: 'ALTA',      label: 'Alta'     },
    { value: 'CRÍTICA',   label: 'Crítica'  },
  ];

  readonly statuses = [
    { value: 'PENDENTE',                label: 'Pendente'             },
    { value: 'EM_PROGRESSO',            label: 'Em Progresso'         },
    { value: 'ESPERANDO_APROVAÇÃO',     label: 'Esperando Aprovação'  },
    { value: 'BLOQUEADA',               label: 'Bloqueada'            },
    { value: 'COMPLETA',                label: 'Concluída'            },
  ];

  constructor(
    private fb: FormBuilder,
    private userSvc: UserService,
    private categorySvc: CategoryService,
    private projectSvc: ProjectService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadFormData();
  }

  private buildForm() { 
    this.form = this.fb.group({
      title:        [this.initialData?.title, [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      description: [this.initialData?.description, Validators.maxLength(500)],
      priority:    [
        this.initialData?.priority 
        ? this.initialData.priority
        : 'MÉDIA',
        Validators.required
      ],
      status:      [
        this.initialData?.status
        ? this.initialData.status
        : 'PENDENTE',
        Validators.required
        ],
      deadline:    [
        this.initialData?.deadline
        ? new Date(this.initialData.deadline)
        : null,
        Validators.required
      ],
      projectId:   [this.initialData?.managerId],
      categoryId:  [this.initialData?.categoryId, Validators.required],
      teamMembers: [this.initialData?.teamMembers],
    }, { validators: this.deadlineAfterStartDate(this.form) });
  }

  // Validator — deadline deve ser depois de startDate
  private deadlineAfterStartDate(group: FormGroup) {
    return (group: FormGroup) => {
      const deadline = group.get('deadline')?.value;

      const today = new Date();

      if (deadline && new Date(deadline) <= today) {
        return { deadlineBeforeStart: true };
      }

      return null;
    };
  }

    // -------------------------------------------------------------------------
    // Data loading
    // -------------------------------------------------------------------------
  
    private loadFormData(): void {
      this.loadingData = true;
  
      // Carrega managers e categorias em paralelo
      forkJoin({
        members: this.userSvc.getUsers(),
        categories: this.categorySvc.getTaskCategories(),
        projects: this.projectSvc.getProjectNames()
      }).subscribe({
        next: ({members, categories, projects}) => {
          this.members   = members ?? [];
          this.categories = categories ?? [];
          this.projects = projects ?? [];
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
        title: this.form.value.title,
        description: this.form.value.description || null,
        dueDate: this.formatDate(this.form.value.deadline),
        projectId: this.form.value.projectId || null,
        categoryId: this.form.value.categoryId,
        assigneeIds: this.form.value.teamMembers || [],
        priority: this.form.value.priority,
        status: this.form.value.status,
        estimatedHours: null
      };
  
      this.formSubmit.emit(payload)
    }
  
    cancel(): void {
      this.cancelClick.emit();
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
  
      return '';
    }
  
    hasFormError(error: string): boolean {
      return this.form.hasError(error) &&
             !!this.form.get('startDate')?.touched &&
             !!this.form.get('deadline')?.touched;
    }

  getMemberName(id: string): string {
    return this.members.find(m => m.id === id)?.name ?? '';
  }
}
