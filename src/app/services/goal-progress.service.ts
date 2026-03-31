import { Injectable } from '@angular/core';
import { Goal } from './goal.service';

const CACHE_KEY = 'goal_progress_cache';

interface ProgressCache {
    date: string;                 // YYYY-MM-DD — used to invalidate daily
    data: Record<string, number>; // goalSk -> progress (0-100)
}

@Injectable({
    providedIn: 'root'
})
export class GoalProgressService {

    // ─── Core calculation ─────────────────────────────────────────────────────

    /**
     * Calculates goal progress: timeProgress × efficiency.
     *
     * timeProgress = (today − created_at) / (deadline − created_at) × 100
     *
     * efficiency:
     *   - consistency = 0 (no habit data) → 1.0 (no penalty, follows time only)
     *   - consistency ≥ 70%               → 1.0
     *   - consistency  < 70%              → consistency / 70
     */
    calculateProgress(goal: Goal, generalConsistency: number): number {
        if (!goal.created_at || !goal.deadline) return 0;

        const start = new Date(goal.created_at);
        start.setHours(0, 0, 0, 0);

        const end = new Date(goal.deadline);
        end.setHours(23, 59, 59, 999);

        const today = new Date();
        today.setHours(12, 0, 0, 0);

        const totalDuration = end.getTime() - start.getTime();
        if (totalDuration <= 0) return 0;

        const elapsed = today.getTime() - start.getTime();
        const timeProgress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

        // No habit data → no penalty
        let efficiency = 1.0;
        if (generalConsistency > 0) {
            efficiency = generalConsistency >= 70 ? 1.0 : generalConsistency / 70;
        }

        return Math.max(0, Math.min(100, Math.round(timeProgress * efficiency)));
    }

    // ─── Cache helpers ────────────────────────────────────────────────────────

    private todayStr(): string {
        return new Date().toISOString().split('T')[0];
    }

    /** Reads today's cache. Returns null if missing or stale (new day). */
    getCachedProgressMap(): Record<string, number> | null {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const cache: ProgressCache = JSON.parse(raw);
            if (cache.date !== this.todayStr()) return null;
            return cache.data;
        } catch {
            return null;
        }
    }

    /** Calculates progress for all goals, persists to localStorage and returns the map. */
    computeAndCacheAll(goals: Goal[], generalConsistency: number): Record<string, number> {
        const data: Record<string, number> = {};
        for (const goal of goals) {
            data[goal.sk] = this.calculateProgress(goal, generalConsistency);
        }
        const cache: ProgressCache = { date: this.todayStr(), data };
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch {
            // storage full or unavailable — silently ignore
        }
        return data;
    }

    /** Forces recalculation on next page load. */
    clearCache(): void {
        localStorage.removeItem(CACHE_KEY);
    }
}
