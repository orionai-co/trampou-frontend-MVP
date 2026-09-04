import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeaturedCompany } from '../../../../core/models/sponsored-content.model';
import {
  MatchBreakdownData,
  buildMatchBreakdownFromCompany
} from '../../../../core/models/match-breakdown.model';
import { TpIconComponent } from '../../../../shared/components';

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
export class FeaturedCompanyCardComponent {
  @Input({ required: true }) company!: FeaturedCompany;
  @Output() exploreCompany = new EventEmitter<FeaturedCompany>();
  @Output() openMatch = new EventEmitter<MatchBreakdownData>();

  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;

  readonly isPlaying = signal<boolean>(false);
  readonly isMuted = signal<boolean>(true);
  readonly progressPercent = signal<number>(0);

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
