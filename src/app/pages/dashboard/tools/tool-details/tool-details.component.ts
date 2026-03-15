import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
            id: 'habit-monitor-pro',
            name: 'Monitor de Hábitos Pro',
            description: 'Visualizações avançadas e correlações entre seus hábitos e seu humor/energia.',
            longDescription: 'O Monitor de Hábitos Pro não apenas rastreia se você fez algo, mas entende o impacto disso na sua vida global. Através de correlações avançadas, você entenderá exatamente como um hábito matinal impacta sua produtividade à tarde.',
            icon: 'activity',
            category: 'Saúde & Bem-estar',
            color: 'from-orange-400 to-rose-600',
            rating: 4.8,
            features: [
                'Gráficos de calor de consistência',
                'Correlação hábito vs. humor',
                'Exportação de dados em CSV/JSON',
                'Alertas inteligentes de quebra de sequência'
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
}
