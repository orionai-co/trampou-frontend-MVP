import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  ViewChild,
  ElementRef,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeaturedCompany } from '../../../../core/models/sponsored-content.model';
import {
  MatchBreakdownData,
  buildMatchBreakdownFromCompany
} from '../../../../core/models/match-breakdown.model';
import { TpIconComponent } from '../../../../shared/components';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../core/models/auth.model';
import { VideoStorageService } from '../../../../core/services/video-storage.service';

@Component({
  selector: 'tp-featured-company-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TpIconComponent
  ],
  templateUrl: './featured-company-card.component.html',
  styleUrl: './featured-company-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedCompanyCardComponent implements OnInit, OnChanges, OnDestroy {
  private readonly authService = inject(AuthService, { optional: true });
  private readonly videoStorageService = inject(VideoStorageService);

  @Input({ required: true }) company!: FeaturedCompany;
  @Input() isOwnCompany?: boolean;
  @Output() exploreCompany = new EventEmitter<FeaturedCompany>();
  @Output() openMatch = new EventEmitter<MatchBreakdownData>();

  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;

  readonly isPlaying = signal<boolean>(false);
  readonly isMuted = signal<boolean>(true);
  readonly progressPercent = signal<number>(0);
  readonly resolvedVideoUrl = signal<string>('');

  private readonly onBoostUpdatedListener = (event: any) => {
    if (event?.detail?.videoUrl) {
      this.resolvedVideoUrl.set(event.detail.videoUrl);
    } else {
      this.resolveVideoUrl();
    }
  };

  ngOnInit(): void {
    this.resolveVideoUrl();
    if (typeof window !== 'undefined') {
      window.addEventListener('trampou:boost-updated', this.onBoostUpdatedListener);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['company']) {
      this.resolveVideoUrl();
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('trampou:boost-updated', this.onBoostUpdatedListener);
    }
  }

  async resolveVideoUrl(): Promise<void> {
    if (!this.company) return;

    if (this.company.videoStorageKey) {
      try {
        const url = await this.videoStorageService.getVideoUrl(this.company.videoStorageKey);
        if (url) {
          this.resolvedVideoUrl.set(url);
          return;
        }
      } catch {}
    }

    if (this.company.videoFileName) {
      try {
        const url = await this.videoStorageService.getVideoUrl('active_boost_video');
        if (url) {
          this.resolvedVideoUrl.set(url);
          return;
        }
      } catch {}
    }

    if (this.company.videoUrl) {
      this.resolvedVideoUrl.set(this.company.videoUrl);
    }
  }

  readonly userRole = computed<UserRole>(() => {
    return this.authService?.userRole() ?? 'professional';
  });

  readonly isContractor = computed<boolean>(() => {
    return this.userRole() === 'contractor';
  });

  readonly isOwnAd = computed<boolean>(() => {
    if (this.isOwnCompany !== undefined) {
      return this.isOwnCompany;
    }
    if (!this.isContractor()) {
      return false;
    }
    const user = this.authService?.currentUser();
    if (user?.id && user.id === this.company?.companyId) {
      return true;
    }
    if (this.company?.companyId === 'comp-001') {
      return true;
    }
    return false;
  });

  // Alias para retrocompatibilidade
  get isVideoPlaying() {
    return this.isPlaying;
  }

  onExplore(): void {
    this.exploreCompany.emit(this.company);
  }

  togglePlayVideo(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const video = this.videoPlayerRef?.nativeElement;
    const willPlay = !this.isPlaying();
    this.isPlaying.set(willPlay);

    if (video) {
      if (willPlay) {
        video.play()?.catch?.(() => {
          // Autoplay policy or mock fallback
        });
      } else {
        video.pause();
      }
    }
  }

  // Retrocompatibilidade para chamadas toggleVideoPlay
  toggleVideoPlay(event?: Event): void {
    this.togglePlayVideo(event);
  }

  toggleMute(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const nextMuted = !this.isMuted();
    this.isMuted.set(nextMuted);
    const video = this.videoPlayerRef?.nativeElement;
    if (video) {
      video.muted = nextMuted;
    }
  }

  onTimeUpdate(): void {
    const video = this.videoPlayerRef?.nativeElement;
    if (video && video.duration > 0) {
      const pct = (video.currentTime / video.duration) * 100;
      this.progressPercent.set(Math.min(100, Math.max(0, pct)));
    }
  }

  onVideoEnded(): void {
    this.isPlaying.set(false);
    this.progressPercent.set(0);
  }

  onMatchBadgeClick(event: MouseEvent): void {
    event.stopPropagation();
    const breakdown = buildMatchBreakdownFromCompany(this.company);
    this.openMatch.emit(breakdown);
  }

  openMatchBreakdown(event: MouseEvent): void {
    this.onMatchBadgeClick(event);
  }
}
