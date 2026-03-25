import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';

export interface Tool {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    color: string;
    rating: number;
    featured?: boolean;
    longDescription?: string;
    features?: string[];
    mfeRoute?: string;
}

@Component({
    selector: 'app-tool-details',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './tool-details.component.html',
    styleUrl: './tool-details.component.scss'
})
export class ToolDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    tool = signal<Tool | null>(null);

    toolsData: Tool[] = [
        {
            id: 'routine-analyzer',
            name: 'Analizador de Rotinas',
            description: 'IA que analisa seus hábitos e sugere melhorias baseadas em seu desempenho real.',
            longDescription: 'O Analisador de Rotinas usa algoritmos avançados de aprendizado de máquina para processar seus dados de hábitos e desempenho. Ele identifica padrões subconscientes que podem estar drenando sua energia e sugere ajustes precisos para otimizar seu dia.',
            icon: 'brain-circuit',
            category: 'Inteligência Artificial',
            color: 'from-purple-500 to-indigo-600',
            rating: 4.9,
            features: [
                'Análise preditiva de níveis de energia',
                'Detecção de gargalos na rotina matinal',
                'Sugestões personalizadas via IA',
                'Relatórios semanais de eficiência'
            ]
        },
        {
            id: 'goal-calculator',
            name: 'Calculadora de Metas',
            description: 'Projete o tempo necessário e os recursos para alcançar qualquer objetivo complexo.',
            longDescription: 'Seja para metas financeiras ou pessoais, nossa calculadora decompõe grandes objetivos em micro-etapas realizáveis, calculando a probabilidade de sucesso baseada na sua disponibilidade de tempo atual.',
            icon: 'calculator',
            category: 'Produtividade',
            color: 'from-emerald-400 to-teal-600',
            rating: 4.7,
            features: [
                'Divisão automática de sub-metas',
                'Cálculo de ROI (Retorno sobre Investimento de tempo)',
                'Projeções de datas de conclusão',
                'Análise de riscos e obstáculos'
            ]
        },
        {
            id: 'divide-ai',
            name: 'Divideaí',
            description: 'App de dividir despesas, aluguel e comida do evento',
            longDescription: 'App simplificado para divisão de despesas comuns. Ideal para rachar o aluguel, contas de casa ou a comida daquele evento especial com amigos. Transparência e facilidade no acerto de contas.',
            icon: 'users',
            category: 'Finanças',
            color: 'from-cyan-400 to-blue-600',
            rating: 4.9,
            features: [
                'Divisão equitativa ou personalizada de contas',
                'Controle de despesas compartilhadas (aluguel, luz, internet)',
                'Gestão de gastos em eventos e viagens',
                'Cálculo automático de "quem deve quanto para quem"'
            ]
        },
        {
            id: 'controle-financeiro-info',
            name: 'Controle Financeiro',
            description: 'Gerenciamento completo do seu fluxo de caixa, despesas e investimentos com integração em tempo real.',
            longDescription: 'Tenha clareza total sobre para onde está indo o seu dinheiro. O Controle Financeiro é uma ferramenta completa que integra registro de gastos diários, controle de renda, orçamento por categoria, acompanhamento de investimentos e revisão estratégica mensal em um único painel.\n\nCom integração em tempo real com sua base de dados Supabase, todas as suas informações financeiras ficam sincronizadas e disponíveis instantaneamente, de qualquer lugar.',
            icon: 'banknote',
            category: 'Finanças',
            color: 'from-emerald-400 to-teal-600',
            rating: 4.9,
            featured: true,
            mfeRoute: 'controle-financeiro',
            features: [
                'Registro de gastos diários por categoria e subcategoria',
                'Controle de entradas de renda mensais',
                'Visão geral e orçamento mensal por categoria (com barras de progresso)',
                'Carteira de investimentos com rendimento calculado automaticamente',
                'Revisão estratégica: patrimônio, dívidas e metas com IA',
                'Integração em tempo real com Supabase',
                'Histórico de patrimônio em gráfico de barras',
                'Geração de metas financeiras com Inteligência Artificial'
            ]
        }
    ];

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = params['id'];
            const foundTool = this.toolsData.find(t => t.id === id);
            if (foundTool) {
                this.tool.set(foundTool);
            } else {
                // Fallback for demo
                this.tool.set(this.toolsData[0]);
            }
        });
    }

    navigateToMfe() {
        const route = this.tool()?.mfeRoute;
        if (route) {
            this.router.navigate(['/dashboard/tools', route]);
        }
    }
}
