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
                        loadChildren: async () => {
                            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                            let remoteEntryUrl = 'https://controle-financeiro-azure-psi.vercel.app/remoteEntry.json';

                            if (isLocal) {
                                try {
                                    const response = await fetch('http://localhost:4206/remoteEntry.json', { method: 'HEAD' });
                                    if (response.ok) {
                                        remoteEntryUrl = 'http://localhost:4206/remoteEntry.json';
                                    }
                                } catch (e) {
                                    console.warn('MFE Controle Financeiro local (4206) indisponível. Usando versão de produção.');
                                }
                            }

                            const { loadRemoteModule } = await import('@angular-architects/native-federation');
                            try {
                                const m = await (loadRemoteModule as any)({
                                    type: 'module',
                                    remoteEntry: remoteEntryUrl,
                                    exposedModule: './Routes'
                                });
                                return m.routes;
                            } catch (e) {
                                console.warn('MFE não expõe ./Routes ainda. Usando fallback Component.');
                                return import('./pages/dashboard/tools/finance-wrapper/finance-wrapper.component').then(c => [{
                                    path: '', component: c.FinanceWrapperComponent
                                }]);
                            }
                        }
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
