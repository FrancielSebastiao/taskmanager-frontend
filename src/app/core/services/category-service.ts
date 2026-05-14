import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { CategoryDto } from '../model/category-dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/project/categories`).pipe(take(1));
  }

  getTaskCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/task/categories`).pipe(take(1));
  }

}
