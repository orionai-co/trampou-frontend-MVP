import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService, ReviewSubmission } from '../../../core/services/rating.service';
import {
  TpModalComponent,
  TpIconComponent,
  TpButtonComponent
} from '../index';

@Component({
  selector: 'tp-rating-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TpModalComponent,
    TpIconComponent,
    TpButtonComponent
  ],
  templateUrl: './rating-modal.component.html',
  styleUrl: './rating-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingModalComponent {
  readonly ratingService = inject(RatingService);

  @Input() isOpen = false;
  @Input() shiftId = '';
  @Input() shiftTitle = '';
  @Input() reviewerRole: 'company' | 'freelancer' = 'company';
  @Input() reviewerName = '';
  @Input() targetId = '';
  @Input() targetName = '';

  @Output() closed = new EventEmitter<void>();
  @Output() reviewSubmitted = new EventEmitter<ReviewSubmission>();

  selectedRating = signal<number>(5);
  hoveredRating = signal<number>(0);
  selectedTags = signal<string[]>([]);
  commentText = signal<string>('');

  get availableTags(): string[] {
    if (this.reviewerRole === 'company') {
      return [
        'Pontual',
        'Proativo',
        'Uniforme Completo',
        'Excelente Atendimento',
        'Ágil e Organizado',
        'Trabalho em Equipe'
      ];
    } else {
      return [
        'Pagamento Rápido',
        'Ambiente Respeitoso',
        'Instruções Claras',
        'Alimentação no Local',
        'Pontualidade no Briefing',
        'Excelente Estrutura'
      ];
    }
  }

  get modalTitle(): string {
    return this.reviewerRole === 'company'
      ? `Avaliar Profissional: ${this.targetName || 'Freelancer'}`
      : `Avaliar Contratante: ${this.targetName || 'Empresa'}`;
  }

  get modalSubtitle(): string {
    return `Turno: "${this.shiftTitle || 'Serviço sob demanda'}" • Sua avaliação fortalece a comunidade`;
  }

  get ratingLabel(): string {
    const r = this.hoveredRating() || this.selectedRating();
    switch (r) {
      case 1: return 'Insatisfatório (1/5)';
      case 2: return 'Regular (2/5)';
      case 3: return 'Bom (3/5)';
      case 4: return 'Muito Bom (4/5)';
      case 5: return 'Excelente (5/5)';
      default: return 'Excelente (5/5)';
    }
  }

  setRating(rating: number): void {
    this.selectedRating.set(rating);
  }

  setHover(rating: number): void {
    this.hoveredRating.set(rating);
  }

  clearHover(): void {
    this.hoveredRating.set(0);
  }

  toggleTag(tag: string): void {
    const current = this.selectedTags();
    if (current.includes(tag)) {
      this.selectedTags.set(current.filter(t => t !== tag));
    } else {
      this.selectedTags.set([...current, tag]);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  submit(): void {
    const submission = this.ratingService.submitReview({
      shiftId: this.shiftId,
      shiftTitle: this.shiftTitle,
      reviewerRole: this.reviewerRole,
      reviewerName: this.reviewerName || (this.reviewerRole === 'company' ? 'Empresa' : 'Profissional'),
      targetId: this.targetId || 'target-user',
      targetName: this.targetName || 'Avaliado',
      rating: this.selectedRating(),
      tags: this.selectedTags(),
      comment: this.commentText()
    });

    this.reviewSubmitted.emit(submission);
    this.close();
  }

  close(): void {
    this.resetForm();
    this.closed.emit();
  }

  private resetForm(): void {
    this.selectedRating.set(5);
    this.hoveredRating.set(0);
    this.selectedTags.set([]);
    this.commentText.set('');
  }
}
