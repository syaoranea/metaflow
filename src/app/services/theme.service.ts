import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme-preference';
  
  // Signal to store the current theme
  theme = signal<'light' | 'dark'>(this.getInitialTheme());

  constructor() {
    // Effect to apply the theme class whenever the signal changes
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
      localStorage.setItem(this.THEME_KEY, currentTheme);
    });
  }

  toggleTheme() {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }

  private getInitialTheme(): 'light' | 'dark' {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as 'light' | 'dark' | null;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: 'light' | 'dark') {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
