import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TpIconComponent } from '../../../../shared/components';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroBannerComponent {}
