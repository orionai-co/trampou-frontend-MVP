import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TpIconComponent } from '../../shared/components';

@Component({
  selector: 'tp-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TpIconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {}
