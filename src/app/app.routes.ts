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
            { path: 'settings', component: SettingsComponent }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
