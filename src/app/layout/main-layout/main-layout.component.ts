import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'tp-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    MobileNavComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {}
