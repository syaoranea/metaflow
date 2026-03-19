import { Component, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-planner-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mfeContainer></div>`,
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
})
export class PlannerWrapperComponent implements OnInit {
  @ViewChild('mfeContainer', { read: ViewContainerRef, static: true })
  viewContainer!: ViewContainerRef;

  private authService = inject(AuthService);

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      const currentUserId = user?.id || 'guest';

      console.log('Carregando Planner Devocional MFE para o usuário:', currentUserId);

      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const remoteEntryUrl = isLocal 
        ? 'http://localhost:4205/remoteEntry.json' 
        : 'https://devocional-mu.vercel.app/remoteEntry.json';

      console.log(`Usando remote entry: ${remoteEntryUrl}`);

      const m = await (loadRemoteModule as any)({
        type: 'module',
        remoteEntry: remoteEntryUrl,
        exposedModule: './Component'
      });

      this.viewContainer.clear();
      const component = m.AppComponent || m.default || m;
      const componentRef = this.viewContainer.createComponent(component as any);
      componentRef.setInput('userId', currentUserId);

      console.log('Planner Devocional MFE carregado com sucesso.');
    } catch (err) {
      console.error('Erro ao carregar Planner Devocional MFE:', err);
    }
  }
}
