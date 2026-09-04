import {
  Component,
  Input,
  ChangeDetectionStrategy,
  signal,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyMedia } from '../../models/company-profile.model';
import { TpIconComponent } from '../../../../shared/components';

@Component({
  selector: 'tp-company-media-gallery',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  templateUrl: './company-media-gallery.component.html',
  styleUrl: './company-media-gallery.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyMediaGalleryComponent {
  @Input({ required: true }) media!: CompanyMedia;

  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;

  readonly isPlayingVideo = signal<boolean>(false);
  readonly isMuted = signal<boolean>(true);
  readonly progressPercent = signal<number>(0);
  readonly selectedPhoto = signal<string | null>(null);

  toggleVideoPlay(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const video = this.videoPlayerRef?.nativeElement;
    const willPlay = !this.isPlayingVideo();
    this.isPlayingVideo.set(willPlay);

    if (video) {
      if (willPlay) {
        video.play()?.catch?.(() => {
          // Fallback
        });
      } else {
        video.pause();
      }
    }
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
    this.isPlayingVideo.set(false);
    this.progressPercent.set(0);
  }

  selectPhoto(photo: string): void {
    this.selectedPhoto.set(photo);
  }

  closePhotoModal(): void {
    this.selectedPhoto.set(null);
  }
}
