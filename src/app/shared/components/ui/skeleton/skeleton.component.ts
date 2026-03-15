import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      [class]="'animate-pulse bg-slate-200 ' + customClass"
      [style.width]="width"
      [style.height]="height"
      [style.borderRadius]="borderRadius">
    </div>
  `,
    styles: [`
    :host {
      display: inline-block;
      width: 100%;
    }
  `]
})
export class SkeletonComponent {
    @Input() width: string = '100%';
    @Input() height: string = '1rem';
    @Input() borderRadius: string = '0.5rem';
    @Input() customClass: string = '';
}
