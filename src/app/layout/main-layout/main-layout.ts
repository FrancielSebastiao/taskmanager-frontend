import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { NavBar } from '../../shared/nav-bar/nav-bar';
import { SideBar } from '../../shared/side-bar/side-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    MatSidenavModule,
    NavBar,
    RouterOutlet,
    SideBar
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  @ViewChild('sidenav')
  sidenav!: MatSidenav;

  collapsed = false;
  isMobile = false;

  constructor(private breakpointObserver: BreakpointObserver) {

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe(result => {

        this.isMobile = result.matches;

        if (this.isMobile) {
          // 📱 Mobile → always start closed
          this.sidenav?.close();
          this.collapsed = false;
        } else {
          // 💻 Desktop → always open and expanded
          this.sidenav?.open();
          this.collapsed = false;
        }

      });

  }

  toggleSidebar() {

    if (this.isMobile) {
      this.sidenav.toggle(); // overlay behavior
    } else {
      this.collapsed = !this.collapsed; // mini sidebar
    }

  }

}
