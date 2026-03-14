import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../components/ui/button/button.component';

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './confirmation-modal.component.html',
    styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
    @Input() isOpen: boolean = false;
    @Input() title: string = 'Confirmar Ação';
    @Input() message: string = 'Tem certeza que deseja realizar esta ação?';
    @Input() confirmText: string = 'Confirmar';
    @Input() cancelText: string = 'Cancelar';
    @Input() variant: 'danger' | 'primary' = 'primary';
    @Input() isLoading: boolean = false;

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
