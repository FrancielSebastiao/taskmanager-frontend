import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, firstValueFrom, map, Observable, of, tap } from 'rxjs';
import { LoginRequest } from '../model/login-request';
import { LoginResponse } from '../model/login-response';
import { ResetPasswordRequest } from '../../../core/model/reset-password-request';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl + '/auth';

  private authenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.authenticated.asObservable();

  // ✅ store token in memory
  private accessToken: string | null = null;
  private expiryToken: number | null = null;
  private roles: string[] = [];

  private rolesSubject = new BehaviorSubject<string[]>([]);
  roles$ = this.rolesSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(data: any, role: string) {
    return this.http.post(
      `${this.baseUrl}/register?role_name=${role}`,
      data
    );
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login`,
      data,
      { withCredentials: true }
    ).pipe(
      tap(res => {
        this.storeAccessToken(res.accessToken);
        this.roles = this.getRolesFromToken(res.accessToken);
        this.authenticated.next(true);
        this.rolesSubject.next(this.roles);
      })
    );
  }

  refresh(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(res => {
        this.storeAccessToken(res.accessToken);
        this.roles = this.getRolesFromToken(res.accessToken);
        this.authenticated.next(true);
        this.rolesSubject.next(this.roles);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.accessToken = null;
        this.authenticated.next(false);
        this.roles = [];
        this.rolesSubject.next([]);
      })
    );
  }

  forceLogout() {
    this.accessToken = null;
    this.authenticated.next(false);
    this.roles = [];
    this.rolesSubject.next([]);
  }

  storeAccessToken(token: string): void {
    this.accessToken = token;

    const payload = JSON.parse(atob(token.split('.')[1]));
    this.expiryToken = payload.exp * 1000;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  initAuth(): Promise<boolean> {
    return firstValueFrom(
      this.refresh().pipe(
        tap(res => this.storeAccessToken(res.accessToken)),
        map(() => true),
        catchError(() => {
          this.authenticated.next(false);
          return of(false);
        })
      )
    );
  }

  private getRolesFromToken(token: string | null): string[] {
    if (!token) return [];

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles || payload.authorities || [];
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  isPrivileged(): boolean {
    return this.roles.some(r =>
      ['ROLE_SYSADMIN', 'ROLE_ADMIN', 'ROLE_GESTOR', 'ROLE_SUPERVISOR'].includes(r)
    );
  }

  isTokenExpired(): boolean {
    if (!this.expiryToken) return true;
    return Date.now() > (this.expiryToken - 5000);
  }

  getRoles(): string[] {
    return this.roles;
  }

  // Verification Token
  resendVerification(email: string): Observable<string> {
    return this.http.get(
      `${this.baseUrl}/resend-verification-token`,
      { 
        params:  { email },
        responseType: 'text'
      }
    );
  }

  verifyAccount(token: string): Observable<string> {
    return this.http.get(
      `${this.baseUrl}/verify`,
      { 
        params: { token },
        responseType: 'text'
      }
    );
  }

  // Password Reset Token
  sendPasswordReset(email: string): Observable<string> {
    return this.http.get(
      `${this.baseUrl}/send-password-reset-token`,
      {
        params: { email },
        responseType: 'text'
      }
    );
  }

  resetPassword(token: string, request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/reset-password`, 
      request,
      {
        params: { token }
      }
    );
  }
}