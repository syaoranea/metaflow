import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DashboardCacheService } from './dashboard-cache.service';

export interface Habit {
  id: string;
  userId: string;
  goalId: string | null;
  title: string;
  description?: string;
  frequency: number;
  createdAt: string;
  goal: { title: string };
  logs: any[];
  _progresso_atual: number;
  _meta_total: number;
  _ultima_verificacao: string | null;
  _origem_meta: number;
}

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private http = inject(HttpClient);
  private dashboardCache = inject(DashboardCacheService);
  private apiUrl = `${environment.apiUrl}/api/habits`;

  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  habits$ = this.habitsSubject.asObservable();

  constructor() { }

  /**
   * Busca a lista de hábitos do usuário na API.
   */
  async getHabits(): Promise<Habit[]> {
    try {
      const habits = await firstValueFrom(this.http.get<Habit[]>(this.apiUrl));
      this.habitsSubject.next(habits);
      return habits;
    } catch (error) {
      console.error('Error fetching habits', error);
      return [];
    }
  }

  /**
   * Cria um novo hábito chamando o BFF.
   */
  async createHabit(data: { title: string; description?: string; frequency: number; goalId?: string }): Promise<{ success: boolean, error?: string, habit?: Habit }> {
    try {
      const newHabit = await firstValueFrom(this.http.post<Habit>(this.apiUrl, data));
      const currentHabits = this.habitsSubject.value;
      this.habitsSubject.next([...currentHabits, newHabit]);
      this.dashboardCache.invalidate();
      return { success: true, habit: newHabit };
    } catch (error: any) {
      console.error('Error creating habit', error);
      return { success: false, error: 'Failed to create habit.' };
    }
  }

  /**
   * Faz o toggle de conclusão diária do hábito.
   */
  async toggleHabitLog(habitId: string, dateIsoString: string): Promise<{ success: boolean, error?: string }> {
    try {
      // Assuming a standard toggle endpoint structure in the BFF
      const updatedHabit = await firstValueFrom(this.http.post<Habit>(`${this.apiUrl}/${habitId}/toggle`, { date: dateIsoString }));

      const currentHabits = this.habitsSubject.value;
      const index = currentHabits.findIndex(h => h.id === habitId);

      if (index !== -1) {
        currentHabits[index] = updatedHabit;
        this.habitsSubject.next([...currentHabits]);
      }
      this.dashboardCache.invalidate();
      return { success: true };
    } catch (error) {
      console.error('Error toggling habit', error);
      return { success: false, error: 'Failed to toggle habit status.' };
    }
  }
}

