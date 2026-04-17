import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardCacheService } from '../../../services/dashboard-cache.service';
import { AuthService } from '../../../services/auth.service';
import { signal } from '@angular/core';

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
    readonly cache  = inject(DashboardCacheService);
    private authService = inject(AuthService);

    userName = signal<string>('Usuário');

    async ngOnInit() {
        // 1. Restore persisted data synchronously → UI shows immediately
        this.cache.loadFromStorage();

        // 2. Load user name (lightweight — just session data)
        const user = await this.authService.getUser();
        if (user) {
            this.userName.set(user.name.split(' ')[0]);
        }

        // 3. Refresh from API in the background (stale-while-revalidate)
        //    If loadFromStorage returned data the user sees it instantly;
        //    when refresh() resolves the signals update reactively.
        this.cache.refresh();
    }
}
