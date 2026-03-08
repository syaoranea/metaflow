import { Injectable } from '@angular/core';

export interface ReportsData {
  summary: any;
  habits: any[];
  goals: any[];
  lineTrendData: number[];
  lineLabels: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  async getReportsData(periodDays: number = 30): Promise<ReportsData> {
    const totalHabitsCompleted = 45;
    const averageConsistency = 78;

    const habitsReport = [
      {
        habitId: "h1",
        title: "Registrar gastos diarios",
        completionRate: 85,
        weeklyTrend: [0, 1, 0, 1, 1, 1, 1] // 1 = concluded, 0 = pending
      },
      {
        habitId: "h2",
        title: "Ler 20 paginas",
        completionRate: 60,
        weeklyTrend: [0, 0, 0, 1, 1, 1, 1]
      }
    ];

    const goalsReport = [
      {
        goalId: "g1",
        title: "Organizar finanças",
        progress: 2500,
        consistency: 50
      }
    ];

    const bestHabitName = "Registrar gastos diarios";

    const lineTrendData = Array(periodDays).fill(0).map((_, i) => Math.min(100, 30 + (i * 2) + Math.floor(Math.random() * 20)));
    const lineLabels = Array(periodDays).fill('').map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (periodDays - i));
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    return {
      summary: {
        totalHabitsCompleted,
        totalHabitsVariation: 5,
        averageConsistency,
        consistencyVariation: 2,
        bestHabit: bestHabitName,
        productiveWeek: "Ultima semana"
      },
      habits: habitsReport,
      goals: goalsReport,
      lineTrendData,
      lineLabels
    };
  }
}
