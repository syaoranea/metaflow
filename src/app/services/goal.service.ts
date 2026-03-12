import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Goal {
  id: string;
  sk: string;
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
  async createGoal(data: { title: string; description?: string; targetValue: number; email?: string }): Promise<{ success: boolean, goal?: Goal }> {
    try {
      // Gerar SK no front usando UUID
      const sk = crypto.randomUUID();
      const payload = { ...data, sk };

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
  async updateGoal(goalIdOrSk: string, data: Partial<Goal>): Promise<{ success: boolean, goal?: Goal }> {
    try {
      // Garantir que estamos enviando para o endpoint usando o ID/SK mapeado
      const updatedGoal = await firstValueFrom(this.http.patch<Goal>(`${this.apiUrl}/${goalIdOrSk}`, data));
      const currentGoals = this.goalsSubject.value;
      this.goalsSubject.next(currentGoals.map(g => (g.id === goalIdOrSk || g.sk === goalIdOrSk) ? updatedGoal : g));
      return { success: true, goal: updatedGoal };
    } catch (error) {
      console.error('Error updating goal', error);
      return { success: false };
    }
  }

  /**
   * Deletes a goal via the API.
   */
  async deleteGoal(goalIdOrSk: string): Promise<{ success: boolean, error?: string }> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${goalIdOrSk}`));
      const updatedGoals = this.goalsSubject.value.filter(g => g.id !== goalIdOrSk && g.sk !== goalIdOrSk);
      this.goalsSubject.next(updatedGoals);
      return { success: true };
    } catch (error) {
      console.error('Error deleting goal', error);
      return { success: false, error: 'Failed to delete goal' };
    }
  }
}

