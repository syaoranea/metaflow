import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private mockGoals: Goal[] = [
    {
      id: "goal-1",
      userId: "mock-user-123",
      title: "Organizar minhas finanças",
      description: "Ter controle total sobre meus gastos e começar a investir",
      targetValue: 10000,
      progress: 2500,
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    },
    {
      id: "goal-2",
      userId: "mock-user-123",
      title: "Ler 12 livros no ano",
      description: "Desenvolver o hábito da leitura diária",
      targetValue: 12,
      progress: 3,
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    }
  ];

  private goalsSubject = new BehaviorSubject<Goal[]>(this.mockGoals);
  goals$ = this.goalsSubject.asObservable();

  constructor() { }

  async getGoals(): Promise<Goal[]> {
    return this.mockGoals;
  }

  async createGoal(data: { title: string; description?: string; targetValue: number }): Promise<{ success: boolean, goal?: Goal }> {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      userId: "mock-user-123",
      title: data.title,
      description: data.description || null,
      targetValue: data.targetValue,
      progress: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.mockGoals = [...this.mockGoals, newGoal];
    this.goalsSubject.next(this.mockGoals);
    return { success: true, goal: newGoal };
  }

  async deleteGoal(goalId: string): Promise<{ success: boolean, error?: string }> {
    this.mockGoals = this.mockGoals.filter(g => g.id !== goalId);
    this.goalsSubject.next(this.mockGoals);
    return { success: true };
  }
}
