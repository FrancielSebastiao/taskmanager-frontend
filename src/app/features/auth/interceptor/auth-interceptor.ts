import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthService } from '../services/auth-service';

let isRefreshing = false;
let refreshSubject = new BehaviorSubject<string | null>(null);

function handleRefresh(authService: AuthService, req: HttpRequest<any>, next: HttpHandlerFn) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    return authService.refresh().pipe(
      switchMap(res => {
        isRefreshing = false;

        authService.storeAccessToken(res.accessToken);
        refreshSubject.next(res.accessToken);

        const newReq = req.clone({
          setHeaders: {
          Authorization: `Bearer ${res.accessToken}`
        },
        withCredentials: true
        });
        
        return next(newReq);
      }),
      catchError(err => {
        isRefreshing = false;
        authService.forceLogout();
        return throwError(() => err);
      })
    );
  }

  // ⏳ Wait for refresh
  return refreshSubject.pipe(
    filter(token => token !== null),
    take(1),
      switchMap(token => {
      const newReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
        return next(newReq);
      })
    );
  }

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // 🔥 Skip auth endpoints
  if (
  req.url.includes('/login') ||
  req.url.includes('/refresh') ||
  req.url.includes('/logout')
  ) {
    return next(req.clone({ withCredentials: true }));
  }

  // 🔥 PROACTIVE REFRESH
  if (token && authService.isTokenExpired()) {
    return handleRefresh(authService, req, next);
  }

  // ✅ Attach token normally
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
  } else {
    authReq = req.clone({ withCredentials: true });
  }

  return next(authReq).pipe(
    catchError(err => {
      // 🔥 REACTIVE FALLBACK
      if (err.status === 401) {
        return handleRefresh(authService, req, next);
      }
      return throwError(() => err);
    })
  );
};