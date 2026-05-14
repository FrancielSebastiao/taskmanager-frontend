import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { AuthLayout } from '../auth-layout/auth-layout';
import { AuthService } from '../../services/auth-service';
import { NavBar } from '../../../../shared/nav-bar/nav-bar';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrls: ['../auth-layout/auth-forms.css', './login.css'],
})
export class Login {

  form: FormGroup;
  showPassword = false;
  isLoading = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    const { email, password } = this.form.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {

        this.isLoading = false;

        // ✅ Navigate after success
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;

        // ✅ Better error handling
        if (err.status === 401) {
          this.loginError = 'Email ou senha inválidos';
        } else {
          this.loginError = 'Erro ao fazer login. Tente novamente.';
        }

        console.error('Login failed', err);
      }
    });
  }
}