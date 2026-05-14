import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core'

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './features/auth/interceptor/auth-interceptor';
import { AuthService } from './features/auth/services/auth-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNativeDateAdapter(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.initAuth();
    })
  ]
};
