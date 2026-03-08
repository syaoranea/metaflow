import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Habit {
  id: string;
  userId: string;
  goalId: string | null;
  title: string;
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
  private mockHabits: Habit[] = [
    {
      id: "habit-1",
      userId: "mock-user-123",
      goalId: "goal-1",
      title: "Registrar todos os gastos",
      frequency: 1,
      createdAt: new Date().toISOString(),
      goal: { title: "Nível 1" },
      logs: [],
      _progresso_atual: 5,
      _meta_total: 30,
      _ultima_verificacao: new Date().toISOString(),
      _origem_meta: 2
    },
    {
      id: "habit-2",
      userId: "mock-user-123",
      goalId: "goal-1",
      title: "Atualizar orçamento mensal",
      frequency: 7,
      createdAt: new Date().toISOString(),
      goal: { title: "Nível 1" },
      logs: [],
      _progresso_atual: 1,
      _meta_total: 4,
      _ultima_verificacao: null,
      _origem_meta: 1 // Automatic, read-only
    }
  ];

  private habitsSubject = new BehaviorSubject<Habit[]>(this.mockHabits);
  habits$ = this.habitsSubject.asObservable();

  constructor() { }

  async getHabits(): Promise<Habit[]> {
    return this.mockHabits; // Returns current snapshot
  }

  async createHabit(data: { title: string; frequency: number; goalId?: string }): Promise<{ success: boolean, error?: string, habit?: Habit }> {
    const freq = data.frequency === 1 ? 1 : 2;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      userId: "mock-user-123", // Using constant mock user id
      goalId: data.goalId || "",
      title: data.title,
      frequency: data.frequency,
      createdAt: new Date().toISOString(),
      goal: { title: data.goalId ? `Nível ${data.goalId}` : "Sem Meta" },
      logs: [],
      _progresso_atual: 0,
      _meta_total: freq === 1 ? 30 : 4,
      _ultima_verificacao: new Date().toISOString(), // Fallback
      _origem_meta: 2 // Manual
    };

    this.mockHabits = [...this.mockHabits, newHabit];
    this.habitsSubject.next(this.mockHabits);
    return { success: true, habit: newHabit };
  }

  async toggleHabitLog(habitId: string, _dateIsoString: string): Promise<{ success: boolean, error?: string }> {
    const habitIndex = this.mockHabits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return { success: false, error: "Habit not found" };

    const habit = { ...this.mockHabits[habitIndex] };

    if (habit._origem_meta === 1) {
      return { success: false, error: "Cannot manually check-in automatic habits." };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const lastCheckedStr = habit._ultima_verificacao ? new Date(habit._ultima_verificacao).toISOString().split('T')[0] : null;
    const isCompletedToday = todayStr === lastCheckedStr;

    if (isCompletedToday) {
      habit._progresso_atual = Math.max(0, habit._progresso_atual - 1);
      habit._ultima_verificacao = null;
    } else {
      habit._progresso_atual += 1;
      habit._ultima_verificacao = new Date().toISOString();
    }

    const newHabits = [...this.mockHabits];
    newHabits[habitIndex] = habit;
    this.mockHabits = newHabits;
    this.habitsSubject.next(this.mockHabits);

    return { success: true };
  }
}
