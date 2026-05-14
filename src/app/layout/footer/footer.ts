import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  currentYear = new Date().getFullYear();

  footerColumns = [
    {
      title: 'Produto',
      links: ['Recursos', 'Preços', 'Segurança'],
    },
    {
      title: 'Empresa',
      links: ['Sobre', 'Blog', 'Carreiras'],
    },
    {
      title: 'Suporte',
      links: ['Ajuda', 'Contato', 'Status'],
    },
  ];
}
