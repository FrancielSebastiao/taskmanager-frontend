import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TaskDetailResponse } from '../model/task-detail-response';
import { AssigneeDetailDto } from '../model/assignee-detail-dto';
import { PagedResponse } from '../model/paged-response';
import { TaskImageDto } from '../model/task-image-dto';
import { TaskFileDto } from '../model/task-file-dto';
import { TaskCommentDetailDto } from '../model/task-comment-detail-dto';
import { TaskActivityDto } from '../model/task-activity-dto';
import { TaskProgressResponse } from '../model/task-progress-response';
import { TaskCommentResponse } from '../model/task-comment-response';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskDetailService {
  private baseUrl = environment.apiUrl + '/tasks';

  constructor(private http: HttpClient) {}

  getDetail(id: string): Observable<TaskDetailResponse> {
    return this.http.get<TaskDetailResponse>(`${this.baseUrl}/${id}/detail`)
    .pipe(
      map(response => ({
        ...response,
        status: this.mapStatus(response.status),
        priority: this.mapPriority(response.priority)
      })
    ));
  }

  getAssignees(taskId: string, page: number): Observable<PagedResponse<AssigneeDetailDto>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PagedResponse<AssigneeDetailDto>>(`${this.baseUrl}/${taskId}/detail/assignees`, { params });
  }

  getTaskImages(taskId: string, page: number): Observable<PagedResponse<TaskImageDto>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PagedResponse<TaskImageDto>>(`${this.baseUrl}/${taskId}/detail/images`, { params });
  }

  getTaskFiles(taskId: string, page: number): Observable<PagedResponse<TaskFileDto>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PagedResponse<TaskFileDto>>(`${this.baseUrl}/${taskId}/detail/files`, { params });
  }

  getComments(taskId: string, page: number): Observable<PagedResponse<TaskCommentDetailDto>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PagedResponse<TaskCommentDetailDto>>(`${this.baseUrl}/${taskId}/comments`, { params });
  }

  getActivities(taskId: string, page: number): Observable<PagedResponse<TaskActivityDto>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PagedResponse<TaskActivityDto>>(`${this.baseUrl}/${taskId}/detail/activities`, { params });
  }

  updateProgress(taskId: string, request: any): Observable<TaskProgressResponse> {
    return this.http.patch<TaskProgressResponse>(`${this.baseUrl}/${taskId}/progress`, request);
  }

  addComment(taskId: string, request: any): Observable<TaskCommentResponse> {
    return this.http.post<TaskCommentResponse>(`${this.baseUrl}/${taskId}/comment`, request);
  }

  editComment(id: string, taskId: string, request: any): Observable<TaskCommentResponse> {
    return this.http.put<TaskCommentResponse>(`${this.baseUrl}/${taskId}/${id}`, request);
  }

  deleteComment(taskId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${taskId}/${id}`);
  }

  private mapStatus(status: string): string {
    const map: any = {
      EM_PROGRESSO: 'Em Progresso',
      COMPLETA: 'Concluída',
      BLOQUEADA: 'Bloqueada',
      ESPERANDO_APROVAÇÃO: 'Esperando Aprovação',
      PENDENTE: 'Pendente'
    };
    return map[status] ?? status;
  }

  private mapPriority(priority: string): string {
    const map: any = {
      CRÍTICA: 'Crítica',
      ALTA: 'Alta',
      MÉDIA: 'Média',
      BAIXA: 'Baixa',
    };
    return map[priority] ?? priority;
  }
}
