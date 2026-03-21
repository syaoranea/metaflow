import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-dashboard-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard-header.component.html',
    styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent implements OnInit, OnDestroy {
    private authService = inject(AuthService);
    public themeService = inject(ThemeService);

    userName = signal<string>('Usuário');
    isDropdownOpen = signal<boolean>(false);
    private userSub?: Subscription;

    ngOnInit() {
        this.userSub = this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.userName.set(user.name.split(' ')[0]);
            }
        });
    }

    ngOnDestroy() {
        this.userSub?.unsubscribe();
    }

    toggleDropdown() {
        this.isDropdownOpen.update(v => !v);
    }

    closeDropdown() {
        this.isDropdownOpen.set(false);
    }

    async logout() {
        await this.authService.logout();
        this.closeDropdown();
    }
}
