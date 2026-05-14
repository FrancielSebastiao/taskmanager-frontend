import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth-service';
import { NavBar } from '../../../../shared/nav-bar/nav-bar';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.html',
  styleUrls: ['../password-layout/password-layout.css', './forgot-password.css'],
})
export class ForgotPassword {
  email = '';
  isLoading = false;
  emailSent = false;
  errorMessage = '';
  countdown = 0;
  countdownInterval: any;

  constructor(
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    if (!this.email) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.sendPasswordReset(this.email)
      .pipe(finalize(() => this.isLoading = false))  
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.emailSent = true;
          this.startCountdown();
          console.log('SUCCESS');
        }, 
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Por favor, insira um email válido.';
        }
      });
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
  }

  startCountdown(): void {
    this.countdown = 60;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }

      this.cd.detectChanges();
    }, 1000);
  }

}