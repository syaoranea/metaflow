import { Injectable } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
  profession?: string;
  mainFocus?: string;
}

const MOCK_USER: User = {
  id: "mock-user-123",
  name: "Eduardo Silva (Mock)",
  email: "mock@metaflow.com",
  plan: "pro",
  profession: "Desenvolvedor de Software",
  mainFocus: "Desenvolvimento pessoal"
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInUser: User | null = MOCK_USER; // Default logged in for mock environment

  constructor() { }

  async getUser(): Promise<User | null> {
    return this.loggedInUser;
  }

  async login(email: string): Promise<{ success: boolean, error?: string }> {
    if (!email) return { success: false, error: 'Email requerido.' };
    this.loggedInUser = MOCK_USER;
    return { success: true };
  }

  async register(data: { name: string; email: string; goal: string }): Promise<{ success: boolean, error?: string }> {
    if (!data.email) return { success: false, error: 'Email requerido.' };
    this.loggedInUser = { ...MOCK_USER, name: data.name, email: data.email };
    return { success: true };
  }

  logout(): void {
    this.loggedInUser = null;
  }
}
