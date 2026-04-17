import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Habit } from './habit.service';
import { Goal } from './goal.service';

const CACHE_KEY = 'dashboard_cache';

interface DashboardCache {
    date: string;
    habitsCompletion: number;
    goalsProgress: number;
    activeDays: number;
    recentHabits: Habit[];
    primaryGoals: Goal[];
}

export interface DashboardStats {
    habitsCompletion: number;
    goalsProgress: number;
    activeDays: number;
}

/**
 * Singleton service that owns the dashboard summary data.
 *
 * Strategy: stale-while-revalidate
 *  1. loadFromStorage() → restores last cached data instantly (sync)
 *  2. refresh()         → fetches fresh data from API and updates cache
 *  3. invalidate()      → clears cache + calls refresh() (called after mutations)
 *
 * NOTE: This service uses HttpClient directly to avoid circular deps with
 * GoalService / HabitService (which inject this service to call invalidate).
 */
@Injectable({ providedIn: 'root' })
export class DashboardCacheService {
    private http = inject(HttpClient);

    private readonly habitsUrl = `${environment.apiUrl}/api/habits`;
    private readonly goalsUrl  = `${environment.apiUrl}/api/goals`;

    // ─── Public reactive state ───────────────────────────────────────────────

    /** Computed stats shown in the stats cards */
    stats = signal<DashboardStats>({ habitsCompletion: 0, goalsProgress: 0, activeDays: 0 });

    /** First 3 habits for the "Hábitos Recentes" section */
    recentHabits = signal<Habit[]>([]);

    /** First 2 goals for the "Suas Metas" section */
    primaryGoals = signal<Goal[]>([]);

    /**
     * True once data is available (either from cache or API).
     * Use this to hide skeleton loaders.
     */
    isLoaded = signal(false);

    // ─── Cache helpers ───────────────────────────────────────────────────────

    private todayStr(): string {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Synchronously restores persisted data from localStorage.
     * Returns true if valid cache was found, false otherwise.
     */
    loadFromStorage(): boolean {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return false;
            const cache: DashboardCache = JSON.parse(raw);
            if (cache.date !== this.todayStr()) return false; // stale day

            this.stats.set({
                habitsCompletion: cache.habitsCompletion,
                goalsProgress:    cache.goalsProgress,
                activeDays:       cache.activeDays,
            });
            this.recentHabits.set(cache.recentHabits ?? []);
            this.primaryGoals.set(cache.primaryGoals ?? []);
            this.isLoaded.set(true);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Fetches fresh data from the API, updates signals and persists to localStorage.
     * Safe to call in background (stale-while-revalidate).
     * On error: logs the issue and exits skeleton state so the UI doesn't hang.
     */
    async refresh(): Promise<void> {
        try {
            // Use allSettled so a single failing endpoint doesn't block the other
            const [habitsResult, goalsResult] = await Promise.allSettled([
                firstValueFrom(this.http.get<Habit[]>(this.habitsUrl)),
                firstValueFrom(this.http.get<Goal[]>(this.goalsUrl)),
            ]);

            const habits = habitsResult.status === 'fulfilled' ? habitsResult.value : [];
            const goals  = goalsResult.status  === 'fulfilled' ? goalsResult.value  : [];

            if (habitsResult.status === 'rejected') {
                console.error('[DashboardCacheService] habits fetch failed', habitsResult.reason);
            }
            if (goalsResult.status === 'rejected') {
                console.error('[DashboardCacheService] goals fetch failed', goalsResult.reason);
            }

            this.applyData(habits, goals);
        } catch (err) {
            console.error('[DashboardCacheService] refresh failed', err);
            // Ensure skeleton is dismissed even on unexpected errors
            this.isLoaded.set(true);
        }
    }

    /**
     * Clears the persisted cache and fires a full refresh.
     * Call this after any create / update / delete on goals or habits.
     */
    async invalidate(): Promise<void> {
        localStorage.removeItem(CACHE_KEY);
        await this.refresh();
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    private applyData(habits: Habit[], goals: Goal[]): void {
        // Consistência — habits completed vs total
        const totalHabits     = habits.length;
        const completedHabits = habits.filter(h => h._progresso_atual >= h._meta_total).length;
        const habitsCompletion = totalHabits > 0
            ? Math.round((completedHabits / totalHabits) * 100)
            : 0;

        // Progresso Metas — average of goal.progress values
        const totalProgress = goals.reduce((acc, g) => acc + (g.progress / 100), 0);
        const goalsProgress = goals.length > 0
            ? Math.round((totalProgress / goals.length) * 100)
            : 0;

        // Frequência — consecutive active days derived from habit logs
        const activeDays = this.calcActiveDays(habits);

        const statsData: DashboardStats = { habitsCompletion, goalsProgress, activeDays };
        this.stats.set(statsData);
        this.recentHabits.set(habits.slice(0, 3));
        this.primaryGoals.set(goals.slice(0, 2));
        this.isLoaded.set(true);

        // Persist to localStorage
        const cache: DashboardCache = {
            date: this.todayStr(),
            ...statsData,
            recentHabits: habits.slice(0, 3),
            primaryGoals: goals.slice(0, 2),
        };
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch {
            // storage full — silently ignore
        }
    }

    /**
     * Derives a consecutive-day streak from habit log dates.
     * Falls back to 0 when logs are unavailable.
     */
    private calcActiveDays(habits: Habit[]): number {
        if (!habits.length) return 0;

        // Collect all unique dates across all habit logs
        const activeDates = new Set<string>();
        for (const habit of habits) {
            for (const log of (habit.logs ?? [])) {
                const raw: string = log.date ?? log.logDate ?? log.createdAt ?? '';
                const day = raw.split('T')[0];
                if (day) activeDates.add(day);
            }
        }

        if (!activeDates.size) return 0;

        // Count consecutive days backwards from today
        const today = new Date();
        let streak = 0;
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (activeDates.has(key)) {
                streak++;
            } else if (i > 0) {
                break; // gap found — streak ends
            }
        }
        return streak;
    }
}
