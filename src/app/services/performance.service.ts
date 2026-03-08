import { Injectable } from '@angular/core';

export interface PerformanceData {
  consistencyScore: number;
  scoreVariation: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  milestonesUnlocked: string[];
  disciplineScore: number;
  executionScore: number;
  regularityScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  constructor() { }

  async getPerformanceData(periodDays: number = 30): Promise<PerformanceData> {
    const baseDiscipline = 85;
    const baseExecution = 72;
    const baseRegularity = 90;

    const lengthMod = periodDays === 7 ? 0.8 : periodDays === 90 ? 1.1 : 1.0;

    return {
      consistencyScore: Math.min(100, Math.round(((baseDiscipline + baseExecution + baseRegularity) / 3) * lengthMod)),
      scoreVariation: periodDays === 7 ? 4 : periodDays === 30 ? 12 : -5,
      currentStreak: 12,
      bestStreak: 20,
      level: 3,
      milestonesUnlocked: ["m1", "m2"],
      disciplineScore: Math.round(baseDiscipline * lengthMod),
      executionScore: Math.round(baseExecution * lengthMod),
      regularityScore: Math.round(baseRegularity * lengthMod)
    };
  }
}
