import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaskSummaryResponse } from '../model/task-summary-response';
import { map, Observable } from 'rxjs';
import { PagedResponse } from '../model/paged-response';
import { AssigneeAvatarDto } from '../model/assignee-avatar-dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseUrl = environment.apiUrl + '/tasks';

  constructor(private http: HttpClient) {}

  createTask(payload: any): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  getTaskById(id: string) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getTasks(params: any): Observable<PagedResponse<TaskSummaryResponse>> {
    return this.http.get<PagedResponse<TaskSummaryResponse>>(`${this.baseUrl}/cards`, { params })
      .pipe(
        map(response => ({
          ...response,
          content: response.content.map(task => ({
          ...task,
          status: this.mapStatus(task.status),
          priority: this.mapPriority(task.priority)
        }))
      }))
    );
  }

  updateTask(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  updateTaskProgress(taskId: string, payload: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${taskId}/progress`, payload);
  }

  updateStatus(taskId: string, status: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${taskId}/status?status=${ status }`, {});
  }

  complete(taskId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${taskId}/complete`, {})
  }

  addAssignees(taskId: string, userIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${taskId}/assignees`, userIds)
  }

  removeAssignee(taskId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${taskId}/assignees/${userId}`);
  }

  getAvailableMembers(taskId: string): Observable<AssigneeAvatarDto[]> {
    return this.http.get<AssigneeAvatarDto[]>(`${this.baseUrl}/${taskId}/available-members`);
  }

  mapStatus(status: string): string {
    const map: any = {
      EM_PROGRESSO: 'Em Progresso',
      COMPLETA: 'Concluída',
      BLOQUEADA: 'Bloqueada',
      ESPERANDO_APROVAÇÃO: 'Esperando Aprovação',
      PENDENTE: 'Pendente'
    };
    return map[status] ?? status;
  }

  mapPriority(priority: string): string {
    const map: any = {
      CRÍTICA: 'Crítica',
      ALTA: 'Alta',
      MÉDIA: 'Média',
      BAIXA: 'Baixa',
    };
    return map[priority] ?? priority;
  }
}
