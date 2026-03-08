import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeroComponent } from './sections/hero/hero.component';
import { ProblemComponent } from './sections/problem/problem.component';
import { SolutionComponent } from './sections/solution/solution.component';
import { HowItWorksComponent } from './sections/how-it-works/how-it-works.component';
import { DifferentialsComponent } from './sections/differentials/differentials.component';
import { PricingComponent } from './sections/pricing/pricing.component';
import { CtaComponent } from './sections/cta/cta.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    ProblemComponent,
    SolutionComponent,
    HowItWorksComponent,
    DifferentialsComponent,
    PricingComponent,
    CtaComponent,
    FooterComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

}
