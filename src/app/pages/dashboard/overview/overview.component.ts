import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HabitService, Habit } from '../../../services/habit.service';
import { GoalService, Goal } from '../../../services/goal.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
    private habitService = inject(HabitService);
    private goalService = inject(GoalService);
    private authService = inject(AuthService);

    userName = signal<string>('Usuário');
    recentHabits = signal<Habit[]>([]);
    primaryGoals = signal<Goal[]>([]);

    stats = signal({
        habitsCompletion: 0,
        goalsProgress: 0,
        activeDays: 0
    });

    async ngOnInit() {
        // Carregar dados de forma assíncrona
        const user = await this.authService.getUser();
        if (user) {
            this.userName.set(user.name.split(' ')[0]);
        }

        const habits = await this.habitService.getHabits();
        this.recentHabits.set(habits.slice(0, 3));

        const goals = await this.goalService.getGoals();
        this.primaryGoals.set(goals.filter((g: Goal) => g.status === 'ACTIVE').slice(0, 2));

        this.calculateStats(habits, goals);
    }

    private calculateStats(habits: Habit[], goals: Goal[]) {
        const totalHabits = habits.length;
        const completedHabits = habits.filter(h => h._progresso_atual >= h._meta_total).length;

        const habitsCompletion = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

        const activeGoals = goals.filter(g => g.status === 'ACTIVE');
        const totalProgress = activeGoals.reduce((acc, g) => acc + (g.progress / g.targetValue), 0);
        const goalsProgress = activeGoals.length > 0 ? Math.round((totalProgress / activeGoals.length) * 100) : 0;

        this.stats.set({
            habitsCompletion,
            goalsProgress,
            activeDays: 12 // Mock value for now
        });
    }
}
