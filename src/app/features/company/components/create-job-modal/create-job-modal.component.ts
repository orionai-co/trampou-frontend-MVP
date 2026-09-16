import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyJob } from '../../models/company-job.model';
import {
  TpModalComponent,
  TpButtonComponent,
  TpIconComponent,
  TpBadgeComponent
} from '../../../../shared/components';

export interface CreateJobFormData {
  title: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  city: string;
  neighborhood: string;
  address: string;
  slotsTotal: number;
  requiredLevel: 1 | 2 | 3;
  paymentAmount: number;
  requirementsText: string;
}

@Component({
  selector: 'tp-create-job-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TpModalComponent,
    TpButtonComponent,
    TpIconComponent,
    TpBadgeComponent
  ],
  templateUrl: './create-job-modal.component.html',
  styleUrl: './create-job-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateJobModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() jobToEdit?: CompanyJob | null;

  @Output() closed = new EventEmitter<void>();
  @Output() jobCreated = new EventEmitter<Partial<CompanyJob>>();
  @Output() jobUpdated = new EventEmitter<CompanyJob>();

  currentStep = signal<1 | 2 | 3>(1);

  categories = [
    'Gastronomia',
    'Eventos',
    'Atendimento',
    'Logística',
    'Operacional'
  ];

  formData = signal<CreateJobFormData>({
    title: '',
    category: 'Gastronomia',
    date: 'Hoje',
    startTime: '18:00',
    endTime: '23:30',
    totalHours: 5.5,
    city: 'São Paulo',
    neighborhood: 'Jardins',
    address: '',
    slotsTotal: 2,
    requiredLevel: 2,
    paymentAmount: 180,
    requirementsText: 'Camisa social preta lisa\nCalça preta e sapato fechado\nPontualidade'
  });

  errorMessage = signal<string | null>(null);

  get stepTitle(): string {
    const isEdit = !!this.jobToEdit;
    switch (this.currentStep()) {
      case 1: return isEdit ? 'Editar Vaga: Função & Logística' : 'Passo 1 de 3: Função & Logística';
      case 2: return isEdit ? 'Editar Vaga: Vagas & Valor' : 'Passo 2 de 3: Vagas & Valor';
      case 3: return isEdit ? 'Editar Vaga: Revisão & Salvar' : 'Passo 3 de 3: Instruções & Publicação';
      default: return isEdit ? 'Editar Vaga' : 'Publicar Vaga';
    }
  }

  get stepSubtitle(): string {
    const isEdit = !!this.jobToEdit;
    switch (this.currentStep()) {
      case 1: return 'Defina a função, categoria, data, horário e endereço do turno';
      case 2: return 'Defina quantas pessoas precisa, nível e valor do repasse via PIX';
      case 3: return isEdit ? 'Revise os dados da vaga e salve as alterações' : 'Revise as instruções de vestimenta e confirme a publicação';
      default: return '';
    }
  }

  get submitButtonLabel(): string {
    return this.jobToEdit ? 'Salvar Alterações da Vaga' : 'Publicar Vaga Agora';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobToEdit'] && this.jobToEdit) {
      this.populateForEdit(this.jobToEdit);
    } else if (changes['isOpen'] && this.isOpen && !this.jobToEdit) {
      this.resetForm();
    }
  }

  private populateForEdit(job: CompanyJob): void {
    this.currentStep.set(1);
    this.errorMessage.set(null);
    this.formData.set({
      title: job.title || '',
      category: job.category || 'Gastronomia',
      date: job.date || 'Hoje',
      startTime: job.schedule?.start || '18:00',
      endTime: job.schedule?.end || '23:30',
      totalHours: job.schedule?.totalHours || 5.5,
      city: job.location?.city || 'São Paulo',
      neighborhood: job.location?.neighborhood || 'Jardins',
      address: job.location?.address || '',
      slotsTotal: job.slots?.total || 1,
      requiredLevel: (job.requiredLevel || 1) as 1 | 2 | 3,
      paymentAmount: job.paymentAmount || 150,
      requirementsText: (job.requirements && job.requirements.length > 0)
        ? job.requirements.join('\n')
        : 'Aparência profissional e pontualidade'
    });
  }

  setCategory(cat: string): void {
    this.formData.update(f => ({ ...f, category: cat }));
  }

  setLevel(lvl: 1 | 2 | 3): void {
    this.formData.update(f => ({ ...f, requiredLevel: lvl }));
  }

  calculateHours(): void {
    const { startTime, endTime } = this.formData();
    if (!startTime || !endTime) return;
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    if (endMinutes < startMinutes) {
      // Passou da meia noite
      endMinutes += 24 * 60;
    }

    const diffHours = (endMinutes - startMinutes) / 60;
    this.formData.update(f => ({ ...f, totalHours: Number(diffHours.toFixed(1)) }));
  }

  nextStep(): void {
    this.errorMessage.set(null);
    const data = this.formData();

    if (this.currentStep() === 1) {
      if (!data.title.trim()) {
        this.errorMessage.set('Por favor, informe o título da vaga.');
        return;
      }
      if (!data.address.trim()) {
        this.errorMessage.set('Por favor, informe o endereço do local de trabalho.');
        return;
      }
      this.calculateHours();
      this.currentStep.set(2);
      return;
    }

    if (this.currentStep() === 2) {
      if (!data.slotsTotal || data.slotsTotal < 1) {
        this.errorMessage.set('Informe pelo menos 1 vaga.');
        return;
      }
      if (!data.paymentAmount || data.paymentAmount < 50) {
        this.errorMessage.set('O valor mínimo de remuneração é R$ 50.');
        return;
      }
      this.currentStep.set(3);
      return;
    }
  }

  prevStep(): void {
    this.errorMessage.set(null);
    if (this.currentStep() === 3) {
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      this.currentStep.set(1);
    }
  }

  submitJob(): void {
    this.errorMessage.set(null);
    const data = this.formData();

    const requirements = data.requirementsText
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (this.jobToEdit) {
      const updatedJob: CompanyJob = {
        ...this.jobToEdit,
        title: data.title.trim(),
        category: data.category,
        date: data.date,
        schedule: {
          start: data.startTime,
          end: data.endTime,
          totalHours: data.totalHours || 5
        },
        location: {
          city: data.city.trim() || 'São Paulo',
          neighborhood: data.neighborhood.trim() || 'Centro',
          address: data.address.trim(),
          distanceKm: this.jobToEdit.location?.distanceKm ?? 2.0
        },
        slots: {
          total: data.slotsTotal,
          filled: Math.min(data.slotsTotal, this.jobToEdit.slots?.filled || 0)
        },
        paymentAmount: Number(data.paymentAmount),
        requiredLevel: data.requiredLevel,
        requirements: requirements.length > 0 ? requirements : ['Aparência profissional e pontualidade']
      };

      this.jobUpdated.emit(updatedJob);
    } else {
      const payload: Partial<CompanyJob> = {
        title: data.title.trim(),
        category: data.category,
        date: data.date,
        schedule: {
          start: data.startTime,
          end: data.endTime,
          totalHours: data.totalHours || 5
        },
        location: {
          city: data.city.trim() || 'São Paulo',
          neighborhood: data.neighborhood.trim() || 'Centro',
          address: data.address.trim()
        },
        slots: {
          total: data.slotsTotal,
          filled: 0
        },
        paymentAmount: Number(data.paymentAmount),
        requiredLevel: data.requiredLevel,
        status: 'open',
        requirements: requirements.length > 0 ? requirements : ['Aparência profissional e pontualidade'],
        candidates: []
      };

      this.jobCreated.emit(payload);
    }

    this.resetForm();
    this.closed.emit();
  }

  close(): void {
    this.resetForm();
    this.closed.emit();
  }

  private resetForm(): void {
    this.currentStep.set(1);
    this.errorMessage.set(null);
    this.formData.set({
      title: '',
      category: 'Gastronomia',
      date: 'Hoje',
      startTime: '18:00',
      endTime: '23:30',
      totalHours: 5.5,
      city: 'São Paulo',
      neighborhood: 'Jardins',
      address: '',
      slotsTotal: 2,
      requiredLevel: 2,
      paymentAmount: 180,
      requirementsText: 'Camisa social preta lisa\nCalça preta e sapato fechado\nPontualidade'
    });
  }
}
