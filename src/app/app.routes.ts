import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { guestGuard } from './features/auth/guard/guest-guard-guard';
import { authGuard } from './features/auth/guard/auth-guard-guard';
import { ProjectDetails } from './features/project-details/project-details';
import { TaskDetails } from './features/task-details/task-details';

export const routes: Routes = [
    { 
        path: 'home',
        canActivate: [guestGuard],
        loadComponent: () =>
        import('./features/landing/landing').then(m => m.Landing) 
    },
    { 
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
        import('./features/auth/pages/login/login').then(m => m.Login) 
    },
    { 
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
        import('./features/auth/pages/register/register').then(m => m.Register) 
    },
    { 
        path: 'resend-verification',
        loadComponent: () =>
        import('./features/auth/pages/resend-verification/resend-verification').then(m => m.ResendVerification) 
    },
    { 
        path: 'verify',
        loadComponent: () =>
        import('./features/auth/pages/verify/verify').then(m => m.Verify) 
    },
    { 
        path: 'forgot-password',
        canActivate: [guestGuard],
        loadComponent: () =>
        import('./features/auth/pages/forgot-password/forgot-password').then(m => m.ForgotPassword) 
    },
    { 
        path: 'reset-password',
        canActivate: [guestGuard],
        loadComponent: () =>
        import('./features/auth/pages/reset-password/reset-password').then(m => m.ResetPassword) 
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {   
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                import('./features/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'calendar',
                loadComponent: () =>
                import('./features/calendar/calendar').then(m => m.Calendar)
            },
            {
                path: 'projects',
                loadComponent: () =>
                import('./features/projects/projects').then(m => m.Projects)
            },
            {
                path: 'project-details/:id',
                component: ProjectDetails,
                // Disable prerendering for this route
                data: { prerender: false }
            },
            {
                path: 'reports',
                loadComponent: () =>
                import('./features/reports/reports').then(m => m.Reports)
            },
            {
                path: 'tasks',
                loadComponent: () =>
                import('./features/tasks/tasks/tasks').then(m => m.Tasks)
            },
            {
                path: 'task-details/:id',
                component: TaskDetails,
                // Disable prerendering for this route
                data: { prerender: false }
            }
        ]
    }
];
