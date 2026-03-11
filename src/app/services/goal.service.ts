import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  targetValue: number;
  progress: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  isPrimary?: boolean;
  deadline?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/goals`; // Adjust base path as needed per BFF docs

  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  goals$ = this.goalsSubject.asObservable();

  constructor() { }

  /**
   * Fetches the goals from the API and updates local state.
   */
  async getGoals(): Promise<Goal[]> {
    try {
      const goals = await firstValueFrom(this.http.get<Goal[]>(this.apiUrl));
      this.goalsSubject.next(goals);
      return goals;
    } catch (error) {
      console.error('Error fetching goals from API', error);
      return [];
    }
  }

  /**
   * Creates a new goal via the API.
   */
  async createGoal(data: { title: string; description?: string; targetValue: number }): Promise<{ success: boolean, goal?: Goal }> {
    try {
      const newGoal = await firstValueFrom(this.http.post<Goal>(this.apiUrl, data));
      const currentGoals = this.goalsSubject.value;
      this.goalsSubject.next([...currentGoals, newGoal]);
      return { success: true, goal: newGoal };
    } catch (error) {
      console.error('Error creating goal', error);
      return { success: false };
    }
  }

  /**
   * Deletes a goal via the API.
   */
  async deleteGoal(goalId: string): Promise<{ success: boolean, error?: string }> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${goalId}`));
      const updatedGoals = this.goalsSubject.value.filter(g => g.id !== goalId);
      this.goalsSubject.next(updatedGoals);
      return { success: true };
    } catch (error) {
      console.error('Error deleting goal', error);
      return { success: false, error: 'Failed to delete goal' };
    }
  }
}

