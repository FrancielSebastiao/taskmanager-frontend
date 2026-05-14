import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../core/services/user-service';
import { CategoryService } from '../../../core/services/category-service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
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

@Component({
  selector: 'app-project-form',
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
  ],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css',
})
export class ProjectForm implements OnInit {
  @Input() initialData: any = null;
  @Output() formSubmit = new EventEmitter<any>();

  form!: FormGroup;

  managers: { id: string, name: string }[] = [];
  categories: { id: string, name: string }[] = [];

  loading = false;
  loadingData = true;
  errorMessage = '';

  today = new Date();

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
    private fb: FormBuilder,
    private userSvc: UserService,
    private categorySvc: CategoryService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadFormData();
  }

  private buildForm() { 
    this.form = this.fb.group({
      name:        [this.initialData?.name, [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
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
        : 'PLANEANDO',
        Validators.required
        ],
      startDate:   [
        this.initialData?.startDate
        ? new Date(this.initialData.startDate)
        : new Date(),
        Validators.required
      ],
      deadline:    [
        this.initialData?.deadline
        ? new Date(this.initialData.dealine)
        : null,
        Validators.required
      ],
      managerId:   [this.initialData?.managerId, Validators.required],
      categoryId:  [this.initialData?.categoryId, Validators.required],
      budget:      [this.initialData?.budget, Validators.min(0)],
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
  
      this,this.formSubmit.emit(payload)
    }
  
    cancel(): void {
      
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
