import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Tool {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    color: string;
    rating: number;
    featured?: boolean;
    mfeRoute?: string;
}

@Component({
    selector: 'app-tools',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './tools.component.html',
    styleUrl: './tools.component.scss'
})
export class ToolsComponent {
    searchQuery = signal('');

    tools = signal<Tool[]>([
        {
            id: 'nutri-planner',
            name: 'NutriPlanner',
            description: 'Planejamento nutricional inteligente para uma vida saudável. Controle sua alimentação com precisão.',
            icon: 'utensils',
            category: 'Saúde & Bem-estar',
            color: 'from-emerald-400 to-green-600',
            rating: 4.9,
            featured: true,
            mfeRoute: 'nutri-planner'
        },
        {
            id: 'goal-calculator',
            name: 'Calculadora de Metas',
            description: 'Projete o tempo necessário e os recursos para alcançar qualquer objetivo complexo.',
            icon: 'calculator',
            category: 'Produtividade',
            color: 'from-emerald-400 to-teal-600',
            rating: 4.7
        },
        {
            id: 'habit-monitor-pro',
            name: 'Monitor de Hábitos Pro',
            description: 'Visualizações avançadas e correlações entre seus hábitos e seu humor/energia.',
            icon: 'activity',
            category: 'Saúde & Bem-estar',
            color: 'from-orange-400 to-rose-600',
            rating: 4.8,
            featured: true
        },
        {
            id: 'suggestion-gen-v2',
            name: 'Gerador de Metas v2',
            description: 'Sugestões personalizadas de metas baseadas no seu perfil financeiro e pessoal.',
            icon: 'sparkles',
            category: 'Estratégia',
            color: 'from-blue-400 to-cyan-600',
            rating: 4.9,
            mfeRoute: 'gerador-metas'
        },
        {
            id: 'focus-hero',
            name: 'Focus Hero',
            description: 'Bloqueador de distrações e timer Pomodoro integrado com seu calendário.',
            icon: 'timer',
            category: 'Produtividade',
            color: 'from-amber-400 to-orange-600',
            rating: 4.6
        },
        {
            id: 'financial-planner',
            name: 'Planejador Financeiro',
            description: 'Simule investimentos e projeções de economia para metas de longo prazo.',
            icon: 'wallet',
            category: 'Finanças',
            color: 'from-indigo-400 to-blue-600',
            rating: 4.8
        },
        {
            id: 'planner-devocional',
            name: 'Planner Devocional',
            description: 'Organize seu tempo de devoção e reflexão diária com suporte a múltiplos perfis.',
            icon: 'book-open',
            category: 'Saúde & Bem-estar',
            color: 'from-purple-400 to-indigo-600',
            rating: 4.8,
            mfeRoute: 'planner-devocional'
        }
    ]);

    categories = ['Todos', 'Inteligência Artificial', 'Produtividade', 'Saúde & Bem-estar', 'Estratégia', 'Finanças'];
    activeCategory = signal('Todos');

    filteredTools = signal<Tool[]>(this.tools());

    setCategory(category: string) {
        this.activeCategory.set(category);
        if (category === 'Todos') {
            this.filteredTools.set(this.tools());
        } else {
            this.filteredTools.set(this.tools().filter(t => t.category === category));
        }
    }
}
