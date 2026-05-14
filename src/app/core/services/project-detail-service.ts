import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProjectDetailResponse } from '../model/project-detail-response';
import { PagedResponse } from '../model/paged-response';
import { TaskSummaryDto } from '../model/task-summary-dto';
import { ActivityDto } from '../model/activity-dto';
import { TeamMemberDetailDto } from '../model/team-member-detail-dto';
import { ProjectFileDto } from '../model/project-file-dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectDetailService {
  private baseUrl = environment.apiUrl + '/projects';

  constructor(private http: HttpClient) {}

  getDetail(id: string): Observable<ProjectDetailResponse> {
    return this.http.get<ProjectDetailResponse>(`${this.baseUrl}/${id}/detail`)
      .pipe(
        map(response => ({
          ...response,
          status: this.mapStatus(response.status),            
          priority: this.mapPriority(response.priority)
        }))
      );
  }

  getTasks(id: string, page: number): Observable<PagedResponse<TaskSummaryDto>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PagedResponse<TaskSummaryDto>>(`${this.baseUrl}/${id}/detail/tasks`, { params });
  }

  getActivities(id: string, page: number): Observable<PagedResponse<ActivityDto>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PagedResponse<ActivityDto>>(`${this.baseUrl}/${id}/detail/activities`, { params });
  }

  getTeam(id: string, page: number): Observable<PagedResponse<TeamMemberDetailDto>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PagedResponse<TeamMemberDetailDto>>(`${this.baseUrl}/${id}/detail/team`, { params })
      .pipe(
      map(response => ({
        ...response,
        content: response.content.map(data => ({
          ...data,
          roles: this.mapRole(data.role),
        }))
      }))
    );;
  }

  getFiles(id: string, page: number): Observable<PagedResponse<ProjectFileDto>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PagedResponse<ProjectFileDto>>(`${this.baseUrl}/${id}/detail/files, { params }`);
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

  mapRole(role: string): string {
    const map: any = {
      TRABALHADOR: 'Trabalhador',
      GESTOR: 'Gestor',
      SUPERVISOR: 'Supervisor',
      ENGENHEIRO: 'Engenheiro',
      ARQUITECTO: 'Arquitecto'
    };
    return map[role] ?? role;
  }
}
