import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnalyticsDashboardResponse } from '../model/analytics-dashboard-response';
import { ReportData } from '../model/report-data';
import { ReportPeriod } from '../model/report-period';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
private baseUrl = environment.apiUrl + '/reports';

  constructor(private http: HttpClient) {}

  getReportData(
    requesterId: string,
    targetUserId: string,
    from: string,
    to: string
  ): Observable<ReportData> {
    const params = new HttpParams()
      .set('requesterId', requesterId)
      .set('targetUserId', targetUserId)
      .set('from', from)
      .set('to', to);
    
    return this.http.get<ReportData>(`${this.baseUrl}`, { params });
  }

  getAnalytics(
    period: ReportPeriod,
    from?: string,
    to?: string
  ): Observable<AnalyticsDashboardResponse> {
    let params = new HttpParams().set('period', period);
    
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    
    return this.http.get<AnalyticsDashboardResponse>(`${this.baseUrl}/analytics`, { params });
  }
}
