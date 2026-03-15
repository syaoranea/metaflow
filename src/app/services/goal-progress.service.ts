import { Injectable } from '@angular/core';
import { Goal } from './goal.service';

@Injectable({
    providedIn: 'root'
})
export class GoalProgressService {
    /**
     * Calculates the goal progress based on time elapsed and general consistency.
     * 
     * @param goal The goal object containing created_at and deadline.
     * @param generalConsistency The user's habit consistency (0-100).
     * @returns Calculated progress percentage (0-100).
     */
    calculateProgress(goal: Goal, generalConsistency: number): number {
        if (!goal.created_at || !goal.deadline) return 0;

        const start = new Date(goal.created_at);
        // Ensure we only use the date part to avoid time-of-day discrepancies
        start.setHours(0, 0, 0, 0);

        const end = new Date(goal.deadline);
        end.setHours(23, 59, 59, 999);

        const today = new Date();
        today.setHours(12, 0, 0, 0); // Noon for stable comparison

        const totalDuration = end.getTime() - start.getTime();
        if (totalDuration <= 0) return 0;

        const elapsed = today.getTime() - start.getTime();
        // Use Math.max(0) because if created_at is in the future, elapsed would be negative
        const timeProgress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

        // Efficiency logic:
        // Consistency >= 70% -> 100% efficient
        // Consistency < 70%  -> Reduced efficiency: (Consistency * 100) / 70
        let efficiency = 1.0;
        if (generalConsistency < 70) {
            // 70 is the "discipline threshold"
            efficiency = (generalConsistency / 70);
        }

        const finalProgress = Math.round(timeProgress * efficiency);
        return Math.max(0, Math.min(100, finalProgress));
    }
}
