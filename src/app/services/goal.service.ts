import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Goal {
  pk: string;     // USER#<userId>
  sk: string;     // GOAL#<uuid>
  type: 'goal';
  title: string;
  description?: string;
  status?: string;
  category?: string;
  deadline?: string; // ISO String or YYYY-MM-DD
  progress: number;
  created_at: string; // YYYY-MM-DD
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/api/goals`;

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
  async createGoal(data: { title: string; progress?: number; category?: string; deadline?: string; description?: string }): Promise<{ success: boolean, goal?: Goal }> {
    try {
      const user = await this.authService.getUser();
      if (!user) throw new Error('User not authenticated');

      const pk = `USER#${user.id}`;
      const sk = `GOAL#${crypto.randomUUID()}`;
      const created_at = new Date().toISOString().split('T')[0];

      const payload: Goal = {
        pk,
        sk,
        type: 'goal',
        title: data.title,
        description: data.description,
        category: data.category,
        deadline: data.deadline,
        progress: data.progress ?? 0,
        created_at
      };

      const newGoal = await firstValueFrom(this.http.post<Goal>(this.apiUrl, payload));
      const currentGoals = this.goalsSubject.value;
      this.goalsSubject.next([...currentGoals, newGoal]);
      return { success: true, goal: newGoal };
    } catch (error) {
      console.error('Error creating goal', error);
      return { success: false };
    }
  }

  /**
   * Updates an existing goal via the API.
   */
  async updateGoal(sk: string, data: Partial<Goal>): Promise<{ success: boolean, goal?: Goal }> {
    try {
      // Remove metadata fields from payload
      const { pk, sk: _sk, type, ...updateData } = data as any;

      const encodedSk = encodeURIComponent(sk);
      const updatedGoal = await firstValueFrom(this.http.patch<Goal>(`${this.apiUrl}/${encodedSk}`, updateData));
      const currentGoals = this.goalsSubject.value;
      this.goalsSubject.next(currentGoals.map(g => (g.sk === sk) ? updatedGoal : g));
      return { success: true, goal: updatedGoal };
    } catch (error) {
      console.error('Error updating goal', error);
      return { success: false };
    }
  }

  /**
   * Deletes a goal via the API.
   */
  async deleteGoal(sk: string): Promise<{ success: boolean, error?: string }> {
    try {
      const encodedSk = encodeURIComponent(sk);
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${encodedSk}`));
      const updatedGoals = this.goalsSubject.value.filter(g => g.sk !== sk);
      this.goalsSubject.next(updatedGoals);
      return { success: true };
    } catch (error) {
      console.error('Error deleting goal', error);
      return { success: false, error: 'Failed to delete goal' };
    }
  }
}

