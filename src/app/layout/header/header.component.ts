import { Component, signal, ChangeDetectionStrategy, HostListener, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserProfileService } from '../../core/services/user-profile.service';
import { OpportunityService } from '../../features/opportunities/services/opportunity.service';
import { NotificationsService } from '../../core/services/notifications.service';
import {
  TpIconComponent,
  TpBadgeComponent
} from '../../shared/components';

@Component({
  selector: 'tp-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TpIconComponent,
    TpBadgeComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly userProfile = inject(UserProfileService);
  readonly opportunityService = inject(OpportunityService);
  readonly notificationsService = inject(NotificationsService);
  readonly unreadCount = this.notificationsService.unreadCount;

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  isUserMenuOpen = signal<boolean>(false);
  isSearchOpen = signal<boolean>(false);
  searchTerm = signal<string>('');
  searchQuery = this.searchTerm;

  constructor(private router: Router) {}

  isCompanyView(): boolean {
    return this.router.url.startsWith('/empresa');
  }

  toggleSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.isSearchOpen.update(v => !v);
    if (this.isSearchOpen()) {
      setTimeout(() => {
        this.searchInputRef?.nativeElement.focus();
      }, 50);
    }
  }

  closeSearch(): void {
    this.isSearchOpen.set(false);
  }

  onSearchInput(event: Event | string): void {
    const query = typeof event === 'string'
      ? event
      : (event.target as HTMLInputElement)?.value || '';

    this.searchTerm.set(query);
    this.opportunityService.setSearchQuery(query);
    if (!this.router.url.startsWith('/oportunidades')) {
      this.router.navigate(['/oportunidades']);
    }
  }

  executeSearch(): void {
    if (!this.router.url.startsWith('/oportunidades')) {
      this.router.navigate(['/oportunidades']);
    }
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.opportunityService.setSearchQuery('');
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isUserMenuOpen()) {
      this.closeUserMenu();
    }
  }
}
