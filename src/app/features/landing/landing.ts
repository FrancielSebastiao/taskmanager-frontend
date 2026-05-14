import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Footer } from '../../layout/footer/footer';
import { NavBar } from '../../shared/nav-bar/nav-bar';

export interface Feature {
  icon: string;
  title: string;
  description: string;
  iconBgClass: string;
  iconColorClass: string;
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
  hasStarIcon?: boolean;
}

export interface MetricCard {
  label: string;
  value: string;
  valueColorClass: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    NavBar,
    Footer,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  heroStats: Stat[] = [
    { value: '10k+', label: 'Usuários Ativos' },
    { value: '50k+', label: 'Projetos Criados' },
    { value: '4.9',  label: 'Avaliação', hasStarIcon: true },
  ];

  dashboardBars = [65, 85, 45, 72];

  features: Feature[] = [
    {
      icon: 'folder_special',
      title: 'Gestão de Projetos',
      description: 'Organize e acompanhe múltiplos projetos com facilidade',
      iconBgClass: 'icon-bg--blue',
      iconColorClass: 'icon--blue',
    },
    {
      icon: 'check_circle',
      title: 'Rastreamento de Tarefas',
      description: 'Gerencie tarefas com status, prioridades e prazos',
      iconBgClass: 'icon-bg--green',
      iconColorClass: 'icon--green',
    },
    {
      icon: 'group',
      title: 'Colaboração em Equipe',
      description: 'Trabalhe junto com sua equipe em tempo real',
      iconBgClass: 'icon-bg--purple',
      iconColorClass: 'icon--purple',
    },
    {
      icon: 'bar_chart',
      title: 'Relatórios Detalhados',
      description: 'Insights e analytics para melhores decisões',
      iconBgClass: 'icon-bg--amber',
      iconColorClass: 'icon--amber',
    },
    {
      icon: 'calendar_today',
      title: 'Calendário Integrado',
      description: 'Visualize prazos e agende atividades facilmente',
      iconBgClass: 'icon-bg--red',
      iconColorClass: 'icon--red',
    },
    {
      icon: 'bolt',
      title: 'Automação',
      description: 'Automatize tarefas repetitivas e ganhe tempo',
      iconBgClass: 'icon-bg--indigo',
      iconColorClass: 'icon--indigo',
    },
  ];

  benefits: Benefit[] = [
    {
      icon: 'schedule',
      title: 'Economize Tempo',
      description: 'Automatize processos e reduza o tempo gasto em tarefas administrativas',
    },
    {
      icon: 'trending_up',
      title: 'Aumente a Produtividade',
      description: 'Veja sua equipe trabalhar de forma mais eficiente com ferramentas intuitivas',
    },
    {
      icon: 'shield',
      title: 'Dados Seguros',
      description: 'Seus dados protegidos com criptografia de ponta e backups automáticos',
    },
  ];

  metricCards: MetricCard[] = [
    { label: 'Taxa de Conclusão',    value: '+45%',    valueColorClass: 'metric--green'  },
    { label: 'Tempo Economizado',    value: '12h/sem', valueColorClass: 'metric--blue'   },
    { label: 'Satisfação da Equipe', value: '4.9/5',   valueColorClass: 'metric--purple' },
  ];
}
