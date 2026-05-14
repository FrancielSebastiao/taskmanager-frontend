import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { AuthLayout } from '../auth-layout/auth-layout';
import { AuthService } from '../../services/auth-service';
import { NavBar } from '../../../../shared/nav-bar/nav-bar';

function noSequenceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;

  if (!value) return null;

  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    'qwertyuiopasdfghjklzxcvbnm'
  ];

  const lower = value.toLowerCase();

  for (let seq of sequences) {
    for (let i = 0; i < seq.length - 2; i++) {
      const part = seq.substring(i, i + 3);
      if (lower.includes(part)) {
        return { sequence: true };
      }
    }
  }

  return null;
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm  = control.get('confirmPassword');

  if (!password || !confirm) return null;

  if (confirm.errors && !confirm.errors['passwordMismatch']) {
    return null;
  }

  if (password.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
  } else {
    confirm.setErrors(null);
  }

  return null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    RouterModule,
    AuthLayout,
    NavBar,
  ],
  templateUrl: './register.html',
  styleUrls: ['../auth-layout/auth-forms.css', './register.css'],
})
export class Register {

  form: FormGroup;
  showPassword        = false;
  showConfirmPassword = false;
  isLoading           = false;
  registerError       : string = '';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        fullName:        ['', [Validators.required, Validators.minLength(2)]],
        email:           ['', [Validators.pattern(/^[_A-Za-z0-9-+]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/)]],
        password: ['',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(30),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=\S+$)/),
            noSequenceValidator
          ]
        ],
        confirmPassword: ['', Validators.required],
        terms:           [false, Validators.requiredTrue],
      },
      { validators: passwordMatchValidator }
    );
  }

  get fullName()        { return this.form.get('fullName')!;        }
  get email()           { return this.form.get('email')!;           }
  get password()        { return this.form.get('password')!;        }
  get confirmPassword() { return this.form.get('confirmPassword')!; }
  get terms()           { return this.form.get('terms')!;           }

  passwordStrength(): { label: string; level: 1 | 2 | 3 | 4; colorClass: string } {
    const val = this.password.value ?? '';
    if (val.length === 0) return { label: '', level: 1, colorClass: '' };
    let score = 0;
    if (val.length >= 8)              score++;
    if (/[A-Z]/.test(val))            score++;
    if (/[0-9]/.test(val))            score++;
    if (/[^A-Za-z0-9]/.test(val))     score++;
    const map: Record<number, { label: string; level: 1|2|3|4; colorClass: string }> = {
      1: { label: 'Fraca',   level: 1, colorClass: 'strength--weak'   },
      2: { label: 'Regular', level: 2, colorClass: 'strength--fair'   },
      3: { label: 'Boa',     level: 3, colorClass: 'strength--good'   },
      4: { label: 'Forte',   level: 4, colorClass: 'strength--strong' },
    };
    return map[score] ?? map[1];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const payload = {
      name: this.form.value.fullName,
      email: this.form.value.email,
      password: this.form.value.password,
      matchingPassword: this.form.value.confirmPassword
    };

    this.authService.register(payload, 'ROLE_TRABALHADOR').subscribe({
      next: () => {
        this.isLoading = false;
        sessionStorage.setItem('verifyEmail', payload.email)
        this.router.navigate(['/resend-verification'])
      },
      error: (err) => {
        this.isLoading = false;

        if (err.error?.message) {
          this.registerError = err.error.message;
        } else {
          this.registerError = 'Erro ao registrar';
        }
      }
    });
  }
}
