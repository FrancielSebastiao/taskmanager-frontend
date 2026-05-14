import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth-service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink, 
    RouterLinkActive,
  ],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {
  @Input()
  collapsed = false;

  @Output()
  menuItemClick = new EventEmitter<void>();

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  logout(): void {
   this.authService.logout().subscribe({
      next: (res) => {
        console.log("Response", res)
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Logout failed', err);
      }
    });
  }
}
