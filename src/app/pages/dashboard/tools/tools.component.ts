import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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
    private router = inject(Router);
    private authService = inject(AuthService);

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
            id: 'divide-ai',
            name: 'Divideaí',
            description: 'App de dividir despesas entre amigos, escolher a melhor local para o evento',
            icon: 'users',
            category: 'Finanças',
            color: 'from-cyan-400 to-blue-600',
            rating: 4.9,
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
            id: 'controle-financeiro-info',
            name: 'Controle Financeiro',
            description: 'Gerenciamento completo do seu fluxo de caixa, despesas e investimentos com integração em tempo real.',
            icon: 'banknote',
            category: 'Finanças',
            color: 'from-emerald-400 to-teal-600',
            rating: 4.9,
            featured: true
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

    async openTool(tool: Tool) {
        if (tool.id === 'controle-financeiro-info' || tool.id === 'divide-ai') {
            let userId: string | null = null;

            // Função para garantir que o valor achado é um ID real e não um email
            const extractRealId = (val: any) => val && typeof val === 'string' && !val.includes('@') && val !== 'undefined' && val !== 'null' ? val : null;

            // 1. Tentar pegar do cache do AuthService
            let currentUser: any = null;
            this.authService.currentUser$.subscribe(u => currentUser = u).unsubscribe();
            userId = extractRealId(currentUser?.userId) || extractRealId(currentUser?.uid) || extractRealId(currentUser?._id) || extractRealId(currentUser?.id);

            // 2. Tentar decodificar o token JWT (frequentemente o ID real está em uid ou _id no payload se o id normal foi sobrescrito por email)
            if (!userId) {
                const token = localStorage.getItem('access_token');
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        userId = extractRealId(payload.userId) || extractRealId(payload.uid) || extractRealId(payload._id) || extractRealId(payload.user_id) || extractRealId(payload.id) || extractRealId(payload.sub);
                    } catch (e) {
                        console.error('Erro ao decodificar token', e);
                    }
                }
            }

            // 3. Tentar pegar do localStorage
            if (!userId) {
                userId = extractRealId(localStorage.getItem('user_id'));
            }

            // 4. Último recurso: fazer a requisição no backend
            let userObj: any = null;
            if (!userId) {
                userObj = await this.authService.getUser();
                userId = extractRealId(userObj?.userId) || extractRealId(userObj?.uid) || extractRealId(userObj?._id) || extractRealId(userObj?.id);
            }

            // 5. Validação especial Edu
            let userEmail: string | null = currentUser?.email || localStorage.getItem('user_email');
            if (!userEmail) {
                const token = localStorage.getItem('access_token');
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        userEmail = payload.email || payload.name;
                    } catch (e) {}
                }
            }
            if (!userEmail && !userObj) {
                 userObj = await this.authService.getUser();
                 userEmail = userObj?.email;
            }

            if (userEmail && typeof userEmail === 'string' && userEmail.startsWith('eduardo_rocha')) {
                userId = '1d066118-ae01-487c-b3fa-7ca1f172d63a';
                console.log('ID substituido via validação de email do Edu.');
            }

            const finalUserId = userId || 'sem id';
            console.log('ID real resolvido para redirecionamento:', finalUserId);

            if (tool.id === 'divide-ai') {
                window.location.href = `https://divideai-nu.vercel.app/dashboard?userId=${finalUserId}`;
            } else {
                window.location.href = `https://ai-controle-financeiro.vercel.app/?userId=${finalUserId}`;
            }
        } else {
            const route = tool.mfeRoute ? ['/dashboard/tools', tool.mfeRoute] : ['/dashboard/tools', tool.id];
            this.router.navigate(route);
        }
    }
}
