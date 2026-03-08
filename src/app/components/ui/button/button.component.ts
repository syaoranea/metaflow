import { Component, Input, ContentChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() customClass: string = '';
  @Input() variant: 'primary' | 'secondary' = 'primary';

  // Check if an element with the `icon` attribute was passed
  @ContentChild('icon') iconElement?: ElementRef;

  get baseClasses(): string {
    const primaryStr = "bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:outline-slate-900";
    const secondaryStr = "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:outline-slate-300";

    const variantStr = this.variant === 'primary' ? primaryStr : secondaryStr;

    return `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variantStr} ${this.customClass}`;
  }

  get hasIcon(): boolean {
    return !!this.iconElement;
  }
}
