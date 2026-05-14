import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth-service';
import { NavBar } from '../../../../shared/nav-bar/nav-bar';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    NavBar,
  ],
  templateUrl: './verify.html',
  styleUrls: ['../verification-layout/verification-layout.css', './verify.css'],
})
export class Verify implements OnInit {
  isVerifying = true;
  verificationSuccess = false;
  errorMessage = '';
  userEmail = '';
  verificationDate = new Date().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.errorMessage = 'Token invalido';
      return;
    }

    this.verifyAccount(token);

    const savedEmail = sessionStorage.getItem('verifyEmail');
    if (savedEmail) {
      this.userEmail = savedEmail
    }
  }

  verifyAccount(token: string): void {
    this.isVerifying = true;

    this.authService.verifyAccount(token).subscribe({
      next:() => {
        this.isVerifying = false;
        this.verificationSuccess = true;
      },
      error: () => {
        this.verificationSuccess = false;
        this.errorMessage = 'O link de verificação é inválido ou expirou.';
      }
   });
  }
}