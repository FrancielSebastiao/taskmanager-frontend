import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { CalendarService } from '../../core/services/calendar-service';
import { TodayEventDto } from '../../core/model/today-event-dto';
import { UpcomingDayDto } from '../../core/model/upcoming-day-dto';
import { CalendarMonthResponse } from '../../core/model/calendar-month-response';
import { CalendarEventDto } from '../../core/model/calendar-event-dto';

export interface CalendarEvent {
  id: string;
  title: string;
  color: 'pink' | 'blue' | 'purple';
  time?: string;
  participants?: number;
  location?: string;
}

export interface CalendarDay {
  date: number;
  month: 'current' | 'other';
  isToday: boolean;
  events: CalendarEvent[];
  fullDate?: Date; // Added for day view navigation
}

export interface TodayEvent {
  title: string;
  color: 'purple' | 'blue' | 'pink';
  time: string;
  participants: number;
  location: string;
}

export interface WeekDay {
  label: string;
  count: number;
}

export interface HourSlot {
  hour: string;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements OnInit {
  // ✅ VIEW STATE - Updated hierarchy
  currentView: 'Dia' | 'Semana' | 'Mês' | 'Ano' | 'Anos' = 'Mês';

  // ✅ DATE STATE (0-based month)
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  currentDay = new Date().getDate();
  selectedDate = new Date(); // For day view
  todayYear = new Date().getFullYear();

  // ✅ LABEL
  currentMonthLabel = '';
  todayDateLabel = '';

  // ✅ DATA
  calendarDays: CalendarDay[] = [];
  weekDays: CalendarDay[] = [];
  yearMonths: number[] = Array.from({ length: 12 }, (_, i) => i);
  yearGrid: number[] = []; // For year selection grid
  hourSlots: HourSlot[] = []; // For day view

  // ✅ STATIC
  monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  monthNamesShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  weekDayHeaders = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado', 'Domingo'];

  // ✅ API
  todayEvents: TodayEvent[] = [];
  upcomingDays: WeekDay[] = [];

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.updateLabel();
    this.loadCalendarData();
    this.loadTodayData();
  }

  // =========================================================
  // ✅ DATA LOADING
  // =========================================================
  loadCalendarData(): void {
    this.calendarService.getMonth(this.currentYear, this.currentMonth + 1)
    .subscribe({
      next: (response) => {
      this.buildCalendar(response);
      },
      error: (error) => {
        console.error('Error loading calendar data:', error);
      }
    });
  }

  loadTodayData(): void {
    this.calendarService.getToday()
      .subscribe({
        next: (response) => {
          this.todayEvents = this.mapTodayEvents(response.todayEvents);
          this.upcomingDays = this.mapUpcomingDays(response.upcomingDays);
        },
        error: (error) => {
          console.error('Error loading today data:', error);
        }
      });
  }

  // =========================================================
  // ✅ MONTH VIEW - FIXED previous month days
  // =========================================================
  buildCalendar(response: CalendarMonthResponse): void {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const firstDayOffset = firstDay === 0 ? 6 : firstDay - 1;

    const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
    const prevMonthYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    // ✅ FIXED: Previous month filler with actual dates
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
        days.push({
        date: dayNum,
        month: 'other',
        isToday: false,
        events: [],
        fullDate: new Date(prevMonthYear, prevMonth, dayNum)
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const eventsForDay = response.eventsByDay[dateKey] || [];
      days.push({
        date: d,
        month: 'current',
        isToday:
        today.getFullYear() === this.currentYear &&
        today.getMonth() === this.currentMonth &&
        today.getDate() === d,
        events: this.mapCalendarEvents(eventsForDay),
        fullDate: new Date(this.currentYear, this.currentMonth, d)
      });
    }

    // Next month filler
    const remaining = 42 - days.length; // 6 rows x 7 days
    const nextMonth = this.currentMonth === 11 ? 0 : this.currentMonth + 1;
    const nextMonthYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;

    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: d,
        month: 'other',
        isToday: false,
        events: [],
        fullDate: new Date(nextMonthYear, nextMonth, d)
      });
    }

    this.calendarDays = days;
  }

  // =========================================================
  // ✅ WEEK VIEW
  // =========================================================
  buildWeek(date: Date = new Date()): void {
    const dayOfWeek = (date.getDay() + 6) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - dayOfWeek);
    const days: CalendarDay[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        date: d.getDate(),
        month: d.getMonth() === this.currentMonth ? 'current' : 'other',
        isToday: d.toDateString() === new Date().toDateString(),
        events: [],
        fullDate: d
      });
    }
    this.weekDays = days;
  }

  // =========================================================
  // ✅ DAY VIEW - NEW
  // =========================================================
  buildDayView(date: Date = new Date()): void {
    this.selectedDate = date;
    const hours: HourSlot[] = [];

    // Create 24 hour slots (0:00 to 23:00)
    for (let h = 0; h < 24; h++) {
      const hourStr = `${String(h).padStart(2, '0')}:00`;
      hours.push({
        hour: hourStr,
        events: [] // In real app, filter events by hour from API
      });
    }

    this.hourSlots = hours;
  }

  // =========================================================
  // ✅ YEAR GRID - NEW (for selecting years)
  // =========================================================
  buildYearGrid(): void {
    const currentDecade = Math.floor(this.currentYear / 10) * 10;
    this.yearGrid = Array.from({ length: 12 }, (_, i) => currentDecade - 1 + i);
  }

  // =========================================================
  // ✅ VIEW SWITCHING - UPDATED
  // =========================================================
  setView(view: 'Dia' | 'Semana' | 'Mês' | 'Ano' | 'Anos'): void {
    this.currentView = view;

    if (view === 'Dia') {
      this.buildDayView(new Date(this.currentYear, this.currentMonth, this.currentDay));
    }

    if (view === 'Semana') {
      this.buildWeek(new Date(this.currentYear, this.currentMonth, this.currentDay));
    }

    if (view === 'Mês') {
      this.loadCalendarData();
    }

    if (view === 'Anos') {
      this.buildYearGrid();
    }

    this.updateLabel();
  }

  // ✅ Click handlers for drill-down
  selectYear(year: number): void {
    this.currentYear = year;
    this.currentView = 'Ano'; // Show months
    this.updateLabel();
  }

  selectMonth(month: number): void {
    this.currentMonth = month;
    this.currentView = 'Mês'; // Show days
    this.loadCalendarData();
    this.updateLabel();
  }

  selectDay(day: CalendarDay): void {
    if (day.fullDate) {
      this.currentYear = day.fullDate.getFullYear();
      this.currentMonth = day.fullDate.getMonth();
      this.currentDay = day.fullDate.getDate();
      this.currentView = 'Dia';
      this.buildDayView(day.fullDate);
      this.updateLabel();
    }
  }

  // =========================================================
  // ✅ NAVIGATION - UPDATED
  // =========================================================
  navigate(direction: 'prev' | 'next'): void {
    const delta = direction === 'next' ? 1 : -1;

    if (this.currentView === 'Dia') {
      const newDate = new Date(this.selectedDate);
      newDate.setDate(newDate.getDate() + delta);
      this.currentYear = newDate.getFullYear();
      this.currentMonth = newDate.getMonth();
      this.currentDay = newDate.getDate();
      this.buildDayView(newDate);
    }

    if (this.currentView === 'Semana') {
      const ref = new Date(this.currentYear, this.currentMonth, this.weekDays[0]?.date || 1);
      ref.setDate(ref.getDate() + (delta * 7));
      this.currentMonth = ref.getMonth();
      this.currentYear = ref.getFullYear();
      this.buildWeek(ref);
    }

    if (this.currentView === 'Mês') {
      this.currentMonth += delta;

      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }

      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }

      this.loadCalendarData();
    }

    if (this.currentView === 'Ano') {
      this.currentYear += delta;
    }

    if (this.currentView === 'Anos') {
      this.buildYearGrid();
    }

    this.updateLabel();
  }

  // =========================================================
  // ✅ LABEL - UPDATED
  // =========================================================
  updateLabel(): void {
    const today = new Date();
    this.todayDateLabel = `${today.getDate()} de ${this.monthNames[today.getMonth()]}`;

    if (this.currentView === 'Dia') {
      this.currentMonthLabel = `${this.selectedDate.getDate()} de ${this.monthNames[this.selectedDate.getMonth()]} ${this.selectedDate.getFullYear()}`;
      return;
    }

    if (this.currentView === 'Semana' && this.weekDays.length) {
      const start = this.weekDays[0];
      const end = this.weekDays[6];
      this.currentMonthLabel = `${start.date} - {this.monthNamesShort[this.currentMonth]} ${this.currentYear}`;
      return;
    }

    if (this.currentView === 'Mês') {
      this.currentMonthLabel = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
      return;
    }

    if (this.currentView === 'Ano') {
      this.currentMonthLabel = `${this.currentYear}`;
      return;
    }

    if (this.currentView === 'Anos') {
      const decade = Math.floor(this.currentYear / 10) * 10;
      this.currentMonthLabel = `${decade - 1} - ${decade + 10}`;
    }
  }

  // Map backend DTOs to frontend interfaces
  private mapCalendarEvents(dtos: CalendarEventDto[]): CalendarEvent[] {
    return dtos.map(dto => ({
      id: dto.id,
      title: dto.title,
      color: dto.color as 'pink' | 'blue' | 'purple',
      // time: dto.time,
      // participants: dto.participantCount,
      // location: dto.location
    }));
  }

  private mapTodayEvents(dtos?: TodayEventDto[]): TodayEvent[] {
    return (dtos ?? []).map(dto => ({
      title: dto.title,
      color: dto.color as 'purple' | 'blue' | 'pink',
      time: dto.time,
      participants: dto.participantCount,
      location: dto.location
    }));
  }

  private mapUpcomingDays(dtos?: UpcomingDayDto[]): WeekDay[] {
    return (dtos ?? []).map(dto => ({
      label: dto.label,
      count: dto.eventCount
    }));
  }

  getVisibleEvents(events: CalendarEvent[]): CalendarEvent[] {
    return events.slice(0, 2);
  }

  getExtraCount(events: CalendarEvent[]): number {
    return Math.max(0, events.length - 2);
  }
}