import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, take } from 'rxjs';
import { PagedResponse } from '../model/paged-response';
import { ProjectSummaryResponse } from '../model/project-summary-response';
import { TaskStats } from '../model/task-stats';
import { ProjectDashboardStatsResponse } from '../model/project-dashboard-stats-response';
import { CategoryDto } from '../model/category-dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private baseUrl = environment.apiUrl + '/projects';

  constructor(private http: HttpClient) {}

  createProject(payload: any): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  getProjects(params: any): Observable<PagedResponse<ProjectSummaryResponse>> {
    return this.http.get<PagedResponse<ProjectSummaryResponse>>(
      `${this.baseUrl}/cards`, { params }
    ).pipe(
      map(response => ({
        ...response,
        content: response.content.map(project => ({
          ...project,
          status: this.mapStatus(project.status),
          priority: this.mapPriority(project.priority)
        }))
      }))
    );
  }

  getProjectNames(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/names`).pipe(take(1));
  }

  updateProject(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  deleteProject(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getMyProjects(params: any) {
    return this.http.get<PagedResponse<ProjectSummaryResponse>>(
      `${this.baseUrl}/my-projects`, { params }
    );
  }

  getProjectDashboardStats(): Observable<ProjectDashboardStatsResponse> {
    return this.http.get<ProjectDashboardStatsResponse>(`${this.baseUrl}/stats`);
  }

  getStats() {
    return this.http.get<TaskStats>(
      `${this.baseUrl}/my-stats`
    );
  }

  mapStatus(status: string): string {
    const map: any = {
      EM_PROGRESSO: 'Em Progresso',
      COMPLETO: 'Concluído',
      PLANEANDO: 'Planeando',
      EM_PAUSA: 'Em Pausa'
    };
    return map[status] ?? status;
  }

  mapPriority(priority: string): string {
    const map: any = {
      ALTA: 'Alta',
      MÉDIA: 'Média',
      BAIXA: 'Baixa',
      CRÍTICA: 'Crítica'  
    };
    return map[priority] ?? priority;
  }
}
