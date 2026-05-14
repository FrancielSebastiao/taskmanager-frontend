import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    RouterModule
  ],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  @Input() panelTitle = '';
  @Input() panelSubtitle = '';

  features = [
    { icon: 'folder_special', text: 'Gestão de projetos em tempo real' },
    { icon: 'group',          text: 'Colaboração com toda a equipe'    },
    { icon: 'bar_chart',      text: 'Relatórios e analytics avançados' },
    { icon: 'bolt',           text: 'Automação de tarefas repetitivas' },
  ];
}
