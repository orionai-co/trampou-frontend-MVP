import { Component, signal, computed, ChangeDetectionStrategy, HostListener, inject, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserProfileService } from '../../core/services/user-profile.service';
import { OpportunityService } from '../../features/opportunities/services/opportunity.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { AuthService } from '../../core/services/auth.service';
import { CompanyService } from '../../features/company/services/company.service';
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
export class HeaderComponent implements OnInit {
  readonly userProfile = inject(UserProfileService);
  readonly opportunityService = inject(OpportunityService);
  readonly notificationsService = inject(NotificationsService);
  readonly authService = inject(AuthService);
  readonly companyService = inject(CompanyService);

  readonly unreadCount = this.notificationsService.unreadCount;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly currentUser = this.authService.currentUser;
  readonly userRole = this.authService.userRole;

  readonly userAvatarInitials = computed(() => {
    const user = this.currentUser();
    if (user?.avatarUrl) return user.avatarUrl;
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return this.userProfile.avatarInitials();
  });

  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    if (user?.name) {
      return user.name.split(' ')[0] || user.name;
    }
    return this.userProfile.shortName();
  });

  readonly userFullName = computed(() => {
    return this.currentUser()?.name || this.userProfile.name();
  });

  readonly userEmail = computed(() => {
    return this.currentUser()?.email || this.userProfile.email();
  });

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  isUserMenuOpen = signal<boolean>(false);
  isSearchOpen = signal<boolean>(false);
  searchTerm = signal<string>('');
  searchQuery = this.searchTerm;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.authService.initSession();
    this.userProfile.fetchUserProfile();
  }

  isCompanyView(): boolean {
    return this.router.url.startsWith('/empresa');
  }

  onPublishJob(): void {
    this.companyService.openCreateJobModalRequest();
    if (!this.router.url.startsWith('/empresa')) {
      this.router.navigate(['/empresa'], { queryParams: { createJob: 'true' } });
    }
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

  onLogout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isUserMenuOpen()) {
      this.closeUserMenu();
    }
  }
}
