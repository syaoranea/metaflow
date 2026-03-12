import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
  profession?: string;
  mainFocus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/api/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkInitialAuth();
  }

  private checkInitialAuth() {
    if (this.isLoggedIn()) {
      this.getUser().then(user => {
        if (user) this.currentUserSubject.next(user);
      });
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  async getUser(): Promise<User | null> {
    if (!this.isLoggedIn()) return null;
    try {
      console.log('Buscando dados do usuário no BFF...');
      const user = await firstValueFrom(this.http.get<User>(`${environment.apiUrl}/api/auth/me`));
      console.log('Usuário retornado com sucesso:', user);
      this.currentUserSubject.next(user);
      return user;
    } catch (error) {
      console.error('Erro ao buscar o usuário na API. Verifique se o token é válido ou se a BFF está operante.', error);
      // Não chamamos logout() automaticamente aqui para evitar loops de redirecionamento.
      // Apenas retornamos null e deixamos o Guard ou Componente decidir.
      return null;
    }
  }

  async login(email: string, password?: string): Promise<{ success: boolean, error?: string }> {
    try {
      if (!email || !password) return { success: false, error: 'Email e senha requeridos.' };

      const response = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/login`, { email, password }));

      const token = response.accessToken || response.token || response.access_token;

      if (token && token !== 'undefined' && token !== 'null') {
        localStorage.setItem('access_token', token);
        this.currentUserSubject.next(response.user);
        return { success: true };
      } else {
        console.error('BFF nao retornou um token valido:', response);
        return { success: false, error: 'Erro ao processar autenticação (Token ausente).' };
      }
    } catch (error: any) {
      const msg = error.error?.message || 'Erro de autenticação no servidor.';
      return { success: false, error: msg };
    }
  }

  async register(data: { name: string; email: string; goal: string; password?: string }): Promise<{ success: boolean, error?: string }> {
    try {
      if (!data.email || !data.password) return { success: false, error: 'Campos obrigatórios faltando.' };
      await firstValueFrom(this.http.post(`${this.apiUrl}/register`, data));
      return { success: true };
    } catch (error: any) {
      const msg = error.error?.message || 'Erro ao registrar no servidor.';
      return { success: false, error: msg };
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
