import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth-service';
import { ResetPasswordRequest } from '../../../../core/model/reset-password-request';
import { NavBar } from '../../../../shared/nav-bar/nav-bar';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    NavBar,
  ],
  templateUrl: './reset-password.html',
  styleUrls: ['../password-layout/password-layout.css', './reset-password.css'],
})
export class ResetPassword implements OnInit {
  token: string | null = null;
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  passwordReset = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  get hasMinLength(): boolean {
    return this.newPassword.length >= 8;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.newPassword);
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.newPassword);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.newPassword);
  }

  get passwordStrength(): number {
    let strength = 0;
    if (this.hasMinLength) strength++;
    if (this.hasUpperCase) strength++;
    if (this.hasLowerCase) strength++;
    if (this.hasNumber) strength++;
    return strength;
  }

  get strengthText(): string {
    const strength = this.passwordStrength;
    if (strength === 0) return 'Muito Fraca';
    if (strength === 1) return 'Fraca';
    if (strength === 2) return 'Razoável';
    if (strength === 3) return 'Boa';
    return 'Forte';
  }

  get strengthClass(): string {
    const strength = this.passwordStrength;
    if (strength <= 1) return 'strength--weak';
    if (strength === 2) return 'strength--fair';
    if (strength === 3) return 'strength--good';
    return 'strength--strong';
  }

  isFormValid(): boolean {
    return (
      this.hasMinLength &&
      this.hasUpperCase &&
      this.hasLowerCase &&
      this.hasNumber &&
      this.newPassword === this.confirmPassword
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'As senhas não coincidem.';
      } else {
        this.errorMessage = 'Por favor, atenda a todos os requisitos de senha.';
      }
      return;
    }

    if (!this.token) {
      this.errorMessage = 'Token inválido';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: ResetPasswordRequest = {
      password: this.newPassword,
      matchingPassword: this.confirmPassword
    }

    this.authService.resetPassword(this.token, request).subscribe({
      next: () => {
        this.isLoading = false;
        this.passwordReset = true;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao redefinir senha';
      }
    });
  }
}