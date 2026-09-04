import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import {
  CampaignType,
  CampaignDurationDays,
  SponsoredCampaign,
  CAMPAIGN_PLANS,
  CampaignPlan
} from '../../../../core/models/sponsored-campaign.model';
import {
  TpModalComponent,
  TpIconComponent,
  TpButtonComponent
} from '../../../../shared/components';

export interface RadiusOption {
  value: number;
  label: string;
  sublabel: string;
}

export const RADIUS_OPTIONS: RadiusOption[] = [
  { value: 5, label: '5 km', sublabel: 'Hiperlocal / Bairro' },
  { value: 10, label: '10 km', sublabel: 'Região & Entorno (Recomendado)' },
  { value: 25, label: '25 km', sublabel: 'Grande Metrópole' },
  { value: 50, label: 'Cidade Toda', sublabel: 'Alcance Máximo Estadual' }
];

export interface VideoOption {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
}

export const AVAILABLE_VIDEOS: VideoOption[] = [
  {
    id: 'vid-1',
    title: 'Cozinha e Equipe Operacional',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-restaurant-kitchen-staff-working-42998-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    duration: '0:45'
  },
  {
    id: 'vid-2',
    title: 'Salão, Bar & Ambientação',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-restaurant-kitchen-staff-working-42998-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    duration: '0:30'
  }
];

@Component({
  selector: 'tp-boost-campaign-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TpModalComponent,
    TpIconComponent,
    TpButtonComponent
  ],
  templateUrl: './boost-campaign-modal.component.html',
  styleUrl: './boost-campaign-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoostCampaignModalComponent {
  private readonly campaignService = inject(CampaignService);

  @Input() isOpen = false;
  @Input() companyName = 'Buffet Espaço Paulista';
  @Input() companyHandle = '@espacopaulista';
  @Input() companyRating = 4.9;
  @Input() companyReviewsCount = 84;
  @Input() openJobsCount = 3;

  @Output() closed = new EventEmitter<void>();
  @Output() campaignCreated = new EventEmitter<SponsoredCampaign>();

  readonly plans = CAMPAIGN_PLANS;
  readonly radiusOptions = RADIUS_OPTIONS;
  readonly availableVideos = AVAILABLE_VIDEOS;

  // Estados reativos do formulário
  readonly selectedType = signal<CampaignType>('featured_company');
  readonly selectedDuration = signal<CampaignDurationDays>(7);
  readonly selectedRadius = signal<number>(10);
  readonly headline = signal<string>(
    'Conheça nossa megaestrutura gastronômica, nossa equipe e como é trabalhar nos maiores eventos de SP.'
  );
  readonly selectedVideoIndex = signal<number>(0);

  readonly selectedPlan = computed<CampaignPlan>(() => {
    return this.plans.find(p => p.durationDays === this.selectedDuration()) || this.plans[1];
  });

  readonly currentVideo = computed<VideoOption>(() => {
    return this.availableVideos[this.selectedVideoIndex()] || this.availableVideos[0];
  });

  onClose(): void {
    this.closed.emit();
  }

  selectType(type: CampaignType): void {
    this.selectedType.set(type);
    if (type === 'boost_job') {
      this.headline.set('Vagas urgentes abertas com diárias atrativas e pagamento 100% via PIX no encerramento.');
    } else {
      this.headline.set('Conheça nossa megaestrutura gastronômica, nossa equipe e como é trabalhar nos maiores eventos de SP.');
    }
  }

  selectDuration(days: CampaignDurationDays): void {
    this.selectedDuration.set(days);
  }

  selectRadius(radius: number): void {
    this.selectedRadius.set(radius);
  }

  selectVideo(index: number): void {
    this.selectedVideoIndex.set(index);
  }

  updateHeadline(value: string): void {
    this.headline.set(value);
  }

  confirmCampaign(): void {
    const video = this.currentVideo();
    const plan = this.selectedPlan();

    const created = this.campaignService.createCampaign({
      type: this.selectedType(),
      title: this.selectedType() === 'featured_company' 
        ? `Destaque — ${this.companyName}` 
        : `Impulsionamento de Vagas — ${this.companyName}`,
      headline: this.headline(),
      videoUrl: video.url,
      videoThumbnail: video.thumbnail,
      durationDays: plan.durationDays,
      targeting: {
        radiusKm: this.selectedRadius(),
        category: 'Gastronomia & Eventos',
        minLevel: 2
      }
    });

    this.campaignCreated.emit(created);
    this.onClose();
  }
}
