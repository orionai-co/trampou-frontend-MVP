import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { CompanyService } from '../../services/company.service';
import { VideoStorageService } from '../../../../core/services/video-storage.service';
import {
  CampaignType,
  CampaignDurationDays,
  SponsoredCampaign,
  CAMPAIGN_PLANS,
  CampaignPlan,
  BoostCampaignStorageItem,
  TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY,
  TRAMPOU_BOOST_DISMISSED_STORAGE_KEY
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

export interface RadiusImpactEstimate {
  professionalsRange: string;
  reachLabel: string;
  description: string;
  topRoles: string[];
  estimatedDailyViews: string;
}

export const RADIUS_IMPACT_DATA: Record<number, RadiusImpactEstimate> = {
  5: {
    professionalsRange: '850 a 1.400 profissionais ativos',
    reachLabel: 'Alcance Hiperlocal',
    description: 'Foco exclusivo no seu bairro e arredores. Ideal para turnos de urgência onde o deslocamento rápido é essencial.',
    topRoles: ['Garçons & Cumins', 'Auxiliares de Cozinha', 'Operacionais'],
    estimatedDailyViews: '180 a 320 visualizações/dia'
  },
  10: {
    professionalsRange: '3.200 a 4.800 profissionais ativos',
    reachLabel: 'Região & Entorno (Recomendado)',
    description: 'Equilíbrio ideal entre alta quantidade de candidatos e proximidade geográfica para garantir pontualidade.',
    topRoles: ['Cozinheiros', 'Bartenders', 'Garçons', 'Baristas'],
    estimatedDailyViews: '550 a 890 visualizações/dia'
  },
  25: {
    professionalsRange: '10.500 a 16.000 profissionais ativos',
    reachLabel: 'Grande Metrópole',
    description: 'Abrange as principais zonas da metrópole. Recomendado para eventos de médio e grande porte com várias vagas abertas.',
    topRoles: ['Maitres & Chefes de Fila', 'Sommeliers', 'Chefs de Praça', 'Brigada Completa'],
    estimatedDailyViews: '1.400 a 2.200 visualizações/dia'
  },
  50: {
    professionalsRange: 'Mais de 35.000 profissionais ativos',
    reachLabel: 'Toda a Cidade & Região Metropolitana',
    description: 'Visibilidade prioritária de topo de feed em toda a capital e região metropolitana para fortalecimento da marca empregadora.',
    topRoles: ['Todos os perfis e categorias verificadas do Trampou'],
    estimatedDailyViews: '3.000+ visualizações/dia'
  }
};

export interface UploadedVideoInfo {
  id: string;
  fileName: string;
  url: string;
  fileSizeText: string;
  fileSizeBytes: number;
}

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
export class BoostCampaignModalComponent implements OnChanges {
  private readonly campaignService = inject(CampaignService);
  private readonly companyService = inject(CompanyService, { optional: true });
  private readonly videoStorageService = inject(VideoStorageService);

  private selectedVideoFile: File | null = null;

  @Input() isOpen = false;
  @Input() companyName = 'Buffet Espaço Paulista';
  @Input() companyHandle = '@espacopaulista';
  @Input() companyRating = 4.9;
  @Input() companyReviewsCount = 84;
  @Input() openJobsCount = 3;
  @Input() campaignToEdit?: BoostCampaignStorageItem | null;

  @Output() closed = new EventEmitter<void>();
  @Output() campaignCreated = new EventEmitter<SponsoredCampaign>();

  readonly plans = CAMPAIGN_PLANS;
  readonly radiusOptions = RADIUS_OPTIONS;

  // Controle de etapa do Stepper (1: Criativo, 2: Alcance, 3: Investimento)
  readonly currentStep = signal<1 | 2 | 3>(1);

  // Estados reativos do formulário
  readonly selectedType = signal<CampaignType>('featured_company');
  readonly selectedDuration = signal<CampaignDurationDays>(7);
  readonly selectedRadius = signal<number>(10);
  readonly headline = signal<string>(
    'Conheça nossa megaestrutura gastronômica, nossa equipe e como é trabalhar nos maiores eventos de SP.'
  );

  // Upload real de vídeo do dispositivo (sem mocks pré-definidos)
  readonly uploadedVideo = signal<UploadedVideoInfo | null>(null);
  readonly selectedVideoUrl = computed<string>(() => this.uploadedVideo()?.url || '');

  readonly selectedPlan = computed<CampaignPlan>(() => {
    return this.plans.find(p => p.durationDays === this.selectedDuration()) || this.plans[1];
  });

  readonly currentImpact = computed<RadiusImpactEstimate>(() => {
    return RADIUS_IMPACT_DATA[this.selectedRadius()] || RADIUS_IMPACT_DATA[10];
  });

  readonly isStep1Valid = computed<boolean>(() => {
    return this.headline().trim().length >= 5 && !!this.uploadedVideo();
  });

  readonly dailyCost = computed<string>(() => {
    const plan = this.selectedPlan();
    const daily = plan.price / plan.durationDays;
    return daily.toFixed(2).replace('.', ',');
  });

  readonly modalTitle = computed<string>(() => {
    return this.campaignToEdit ? '✏️ Editar Impulsionamento da Empresa' : '🚀 Impulsionar Empresa no Feed';
  });

  readonly modalSubtitle = computed<string>(() => {
    return this.campaignToEdit 
      ? 'Ajuste headline, vídeo, raio de alcance ou duração do seu anúncio ativo' 
      : 'Ganhe visibilidade prioritária para os melhores profissionais da sua região';
  });

  readonly confirmButtonLabel = computed<string>(() => {
    return this.campaignToEdit 
      ? 'Salvar Alterações do Anúncio' 
      : `Confirmar & Ativar Campanha (R$ ${this.selectedPlan().price},00)`;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['campaignToEdit'] && this.campaignToEdit) {
      this.populateForEdit(this.campaignToEdit);
    } else if (changes['isOpen'] && this.isOpen && !this.campaignToEdit) {
      this.currentStep.set(1);
    }
  }

  private populateForEdit(item: BoostCampaignStorageItem): void {
    this.currentStep.set(1);
    if (item.objective) {
      this.selectedType.set((item.objective === 'boost_job' ? 'boost_job' : 'featured_company') as CampaignType);
    }
    if (item.headline) {
      this.headline.set(item.headline);
    }
    if (item.radiusKm) {
      this.selectedRadius.set(item.radiusKm);
    }
    if (item.days) {
      this.selectedDuration.set(item.days as CampaignDurationDays);
    }
    if (item.videoUrl) {
      this.uploadedVideo.set({
        id: 'edit-video',
        fileName: 'Vídeo ativo da campanha',
        url: item.videoUrl,
        fileSizeText: '',
        fileSizeBytes: 0
      });
    }
  }

  nextStep(): void {
    if (this.currentStep() === 1 && !this.isStep1Valid()) {
      return;
    }
    if (this.currentStep() < 3) {
      this.currentStep.update(step => (step + 1) as 1 | 2 | 3);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => (step - 1) as 1 | 2 | 3);
    }
  }

  goToStep(step: 1 | 2 | 3): void {
    if (step === this.currentStep()) {
      return;
    }
    // Não permite pular para passos 2 ou 3 se o passo 1 for inválido
    if (step > 1 && !this.isStep1Valid()) {
      return;
    }
    this.currentStep.set(step);
  }

  onClose(): void {
    this.currentStep.set(1);
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

  triggerFileInput(inputElement: HTMLInputElement): void {
    inputElement.click();
  }

  onVideoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedVideoFile = file;

    let objectUrl = '';
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      objectUrl = URL.createObjectURL(file);
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

    const uploadedInfo: UploadedVideoInfo = {
      id: `custom-vid-${Date.now()}`,
      fileName: file.name,
      url: objectUrl,
      fileSizeText: `${sizeMb} MB`,
      fileSizeBytes: file.size
    };

    this.uploadedVideo.set(uploadedInfo);
    input.value = '';
  }

  removeUploadedVideo(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const current = this.uploadedVideo();
    if (current?.url && typeof URL !== 'undefined' && URL.revokeObjectURL) {
      try {
        URL.revokeObjectURL(current.url);
      } catch {
        // safe fallback
      }
    }
    this.selectedVideoFile = null;
    this.uploadedVideo.set(null);
  }

  updateHeadline(value: string): void {
    this.headline.set(value);
  }

  confirmCampaign(): void {
    const video = this.uploadedVideo();
    const plan = this.selectedPlan();
    const isEditing = !!this.campaignToEdit;
    const campaignId = this.campaignToEdit?.id || `camp-${Date.now()}`;
    const createdAt = this.campaignToEdit?.createdAt || new Date().toISOString();
    const storageKey = `campaign_${campaignId}`;

    const videoUrl = video?.url || '';
    const videoFileName = video?.fileName || this.selectedVideoFile?.name || this.campaignToEdit?.videoFileName || '';
    const videoMimeType = this.selectedVideoFile?.type || this.campaignToEdit?.videoMimeType || 'video/mp4';

    // Salva arquivo no IndexedDB de forma resiliente para sobreviver a refresh
    if (this.selectedVideoFile) {
      this.videoStorageService.saveVideo(storageKey, this.selectedVideoFile).catch(() => {});
      this.videoStorageService.saveVideo('active_boost_video', this.selectedVideoFile).catch(() => {});
    }

    const storageItem: BoostCampaignStorageItem = {
      id: campaignId,
      companyId: this.campaignToEdit?.companyId || 'comp-001',
      companyName: this.companyName,
      objective: this.selectedType(),
      headline: this.headline(),
      videoUrl: videoUrl,
      videoFileName: videoFileName,
      videoMimeType: videoMimeType,
      videoDurationText: videoFileName ? 'Vídeo Anexado' : (this.campaignToEdit?.videoDurationText || '0:45'),
      videoStorageKey: storageKey,
      videoThumbnail: videoFileName ? '' : (this.campaignToEdit?.videoThumbnail || ''),
      radiusKm: this.selectedRadius(),
      days: plan.durationDays,
      price: plan.price,
      active: true,
      createdAt
    };

    if (this.companyService) {
      if (isEditing) {
        this.companyService.updateBoostCampaign(storageItem);
      } else {
        this.companyService.saveBoostCampaign(storageItem);
      }
    } else if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(TRAMPOU_BOOST_DISMISSED_STORAGE_KEY);
        const raw = localStorage.getItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        const list: BoostCampaignStorageItem[] = Array.isArray(existing) ? existing : [existing];
        const others = list.filter(c => c.id !== storageItem.id);
        const updated = [
          { ...storageItem, status: 'active' as const },
          ...others.map(c => ({ ...c, active: false, status: c.status || ('completed' as const) }))
        ];
        localStorage.setItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Erro ao salvar no storage compartilhado:', err);
      }
    }

    const created = this.campaignService.createCampaign({
      id: storageItem.id,
      companyId: storageItem.companyId,
      type: this.selectedType(),
      title: this.selectedType() === 'featured_company' 
        ? `Destaque — ${this.companyName}` 
        : `Impulsionamento de Vagas — ${this.companyName}`,
      headline: this.headline(),
      videoUrl: videoUrl,
      videoThumbnail: storageItem.videoThumbnail,
      durationDays: plan.durationDays,
      targeting: {
        radiusKm: this.selectedRadius(),
        category: 'Gastronomia & Eventos',
        minLevel: 2
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trampou:boost-updated', { detail: storageItem }));
    }

    this.campaignCreated.emit(created);
    this.onClose();
  }
}
