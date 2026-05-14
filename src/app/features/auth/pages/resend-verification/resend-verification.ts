import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth-service';
import { NavBar } from '../../../../shared/nav-bar/nav-bar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-resend-verification',
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
  templateUrl: './resend-verification.html',
  styleUrls: ['../verification-layout/verification-layout.css', './resend-verification.css'],
})
export class ResendVerification implements OnInit, OnDestroy {
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

  ngOnInit(): void {
    const savedEmail = sessionStorage.getItem('verifyEmail');
    if (savedEmail) {
      this.email = savedEmail
    }
  }

  onSubmit(): void {
    if (!this.email) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resendVerification(this.email)
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
    if (this.countdown > 0) return;
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

  openEmailApp(): void {
    window.location.href = 'mailto:';
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
