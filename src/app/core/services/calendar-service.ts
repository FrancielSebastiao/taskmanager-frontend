import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CalendarMonthResponse } from '../model/calendar-month-response';
import { CalendarTodayResponse } from '../model/calendar-today-response';
import { environment } from '../../../environments/environment';
import { CalendarEventDto } from '../model/calendar-event-dto';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private baseUrl = environment.apiUrl + '/calendar'; // Add /calendar path

  constructor(private http: HttpClient) {}

  createEvent(data: any): Observable<CalendarEventDto> {
    return this.http.post<CalendarEventDto>(`${this.baseUrl}`, data);
  }

  editEvent(id: string, data: any): Observable<CalendarEventDto> {
    return this.http.put<CalendarEventDto>(`${this.baseUrl}/${id}`, data);
  }

  getMonth(year: number, month: number): Observable<CalendarMonthResponse> {
    return this.http.get<CalendarMonthResponse>(`${this.baseUrl}/month`, {
      params: { year: year.toString(), month: month.toString() }
    });
  }

  getToday(): Observable<CalendarTodayResponse> {
    return this.http.get<CalendarTodayResponse>(`${this.baseUrl}/today`);
  }
}

