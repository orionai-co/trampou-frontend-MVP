import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OpportunityFilters,
  OpportunityCategory
} from '../../models/opportunity.model';
import {
  TpIconComponent
} from '../../../../shared/components';

@Component({
  selector: 'tp-opportunity-filters',
  standalone: true,
  imports: [
    CommonModule,
    TpIconComponent
  ],
  templateUrl: './opportunity-filters.component.html',
  styleUrl: './opportunity-filters.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityFiltersComponent {
  @Input() currentFilters: OpportunityFilters = {
    category: 'Todas',
    sortBy: 'highest_match'
  };

  @Input() appliedCount = 0;

  @Output() filtersChange = new EventEmitter<OpportunityFilters>();

  categories: OpportunityCategory[] = [
    'Todas',
    'Eventos',
    'Gastronomia',
    'Atendimento',
    'Logística',
    'Operacional'
  ];

  onCategoryChange(cat: OpportunityCategory): void {
    this.currentFilters = { ...this.currentFilters, category: cat };
    this.emitChange();
  }

  toggleTodayOrUrgent(): void {
    this.currentFilters = {
      ...this.currentFilters,
      onlyTodayOrUrgent: !this.currentFilters.onlyTodayOrUrgent
    };
    this.emitChange();
  }

  onDistanceChange(dist?: number): void {
    this.currentFilters = {
      ...this.currentFilters,
      maxDistanceKm: dist
    };
    this.emitChange();
  }

  hasActiveFilters(): boolean {
    return !!(
      (this.currentFilters.category && this.currentFilters.category !== 'Todas') ||
      (this.currentFilters.searchQuery && this.currentFilters.searchQuery.trim() !== '') ||
      this.currentFilters.onlyTodayOrUrgent ||
      this.currentFilters.maxDistanceKm
    );
  }

  resetFilters(): void {
    this.currentFilters = {
      ...this.currentFilters,
      category: 'Todas',
      maxDistanceKm: undefined,
      onlyTodayOrUrgent: false,
      searchQuery: ''
    };
    this.emitChange();
  }

  private emitChange(): void {
    this.filtersChange.emit(this.currentFilters);
  }
}
