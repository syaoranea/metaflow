import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss'
})
export class HowItWorksComponent {
  steps = [
    {
      number: "01",
      title: "Defina direção",
      desc: "Transforme intenções vagas em metas mensuráveis. Saiba exatamente aonde quer chegar."
    },
    {
      number: "02",
      title: "Execute diariamente",
      desc: "Acompanhe os hábitos essenciais que constroem a ponte entre seu estado atual e seu objetivo."
    },
    {
      number: "03",
      title: "Acompanhe sua evolução",
      desc: "Visualize seu progresso através de dados reais inspirados nas interfaces mais limpas do mercado."
    }
  ];
}
