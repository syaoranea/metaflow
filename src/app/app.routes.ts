import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ShellComponent } from './pages/dashboard/shell/shell.component';
import { HabitsComponent } from './pages/dashboard/habits/habits.component';
import { GoalsComponent } from './pages/dashboard/goals/goals.component';
import { PerformanceComponent } from './pages/dashboard/performance/performance.component';
import { ReportsComponent } from './pages/dashboard/reports/reports.component';
import { SettingsComponent } from './pages/dashboard/settings/settings.component';
import { OverviewComponent } from './pages/dashboard/overview/overview.component';
import { AdminComponent } from './pages/dashboard/admin/admin.component';
import { ToolsComponent } from './pages/dashboard/tools/tools.component';
import { ToolDetailsComponent } from './pages/dashboard/tools/tool-details/tool-details.component';
import { LandingComponent } from './pages/landing/landing.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', component: LandingComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'dashboard',
        component: ShellComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: OverviewComponent },
            { path: 'admin', component: AdminComponent },
            { path: 'habits', component: HabitsComponent },
            { path: 'goals', component: GoalsComponent },
            { path: 'performance', component: PerformanceComponent },
            { path: 'reports', component: ReportsComponent },
            { path: 'settings', component: SettingsComponent },
            {
                path: 'tools',
                children: [
                    { path: '', component: ToolsComponent },
                    {
                        path: 'mfe1',
                        loadComponent: () => import('@angular-architects/native-federation').then(m => m.loadRemoteModule('mfe1', './Component')).then(m => m.AppComponent).catch(err => {
                            console.error('Error loading remote module', err);
                            // Provide an error component or returning void depending on your needs.
                        })
                    },
                    {
                        path: 'gerador-metas',
                        loadComponent: () => import('@angular-architects/native-federation')
                            .then(m => m.loadRemoteModule('gerador-metas', './Component'))
                            .then(m => m.AppComponent)
                            .catch(err => {
                                console.error('Error loading Gerador de Metas MFE:', err);
                                // Fallback or redirect if loading fails
                                window.location.href = 'https://metasflow-khrm.vercel.app';
                                return null;
                            })
                    },
                    {
                        path: 'nutri-planner',
                        loadComponent: () => import('./pages/dashboard/tools/mfe-wrapper/mfe-wrapper.component').then(m => m.MfeWrapperComponent)
                    },
                    {
                        path: 'controle-financeiro',
                        loadComponent: () => import('./pages/dashboard/tools/finance-wrapper/finance-wrapper.component').then(m => m.FinanceWrapperComponent)
                    },
                    {
                        path: 'planner-devocional',
                        loadComponent: () => import('./pages/dashboard/tools/planner-wrapper/planner-wrapper.component').then(m => m.PlannerWrapperComponent)
                    },
                    { path: ':id', component: ToolDetailsComponent }
                ]
            }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
