import { Injectable, signal, computed, inject } from '@angular/core';
import { CompanyJob, Candidate, CompanyMetrics } from '../models/company-job.model';
import { ShiftChatService } from '../../../core/services/shift-chat.service';

const INITIAL_MOCK_JOBS: CompanyJob[] = [
  {
    id: 'comp-job-1',
    title: 'Garçom para Evento Corporativo',
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Jardins',
      address: 'Alameda Santos, 1200'
    },
    date: 'Hoje, 25 Ago',
    schedule: {
      start: '18:00',
      end: '23:30',
      totalHours: 5.5
    },
    slots: {
      total: 4,
      filled: 2
    },
    paymentAmount: 190,
    requiredLevel: 2,
    status: 'open',
    requirements: [
      'Camisa social preta lisa',
      'Calça social preta e sapato fechado',
      'Experiência prévia em serviço de bandeja à francesa'
    ],
    candidates: [
      {
        id: 'cand-1',
        name: 'Lucas Mendes',
        avatarInitials: 'LM',
        level: 2,
        rating: 4.9,
        reviewsCount: 38,
        matchPercentage: 98,
        punctualityRate: 100,
        pixKeyPreview: '***.391.842-**',
        status: 'approved',
        bio: 'Garçom de Salão e Eventos Corporativos com mais de 4 anos de experiência em buffets premium e serviço de alta gastronomia.',
        roleTitle: 'Garçom de Salão • Eventos & Gastronomia',
        location: 'São Paulo, SP (Jardins • 2.5 km)',
        verified: true,
        completedShiftsCount: 42,
        matchReasons: ['Categoria Gastronomia', 'Raio de 2.5 km', 'Nível 2 Atendido', 'Uniforme Completo'],
        skills: ['Garçom de Salão', 'Serviço à Francesa', 'Atendimento & Bar', 'Recepção de Eventos', 'Boas Práticas de Higiene'],
        recentReviews: [
          {
            companyName: 'Buffet Espaço Fasano',
            rating: 5.0,
            comment: 'Lucas foi impecável no atendimento aos convidados VIP. Chegou com 20 min de antecedência e muito bem uniformizado.',
            date: 'Há 3 dias',
            badge: 'Pontual e Proativo'
          },
          {
            companyName: 'Restaurante Vila Nova',
            rating: 4.8,
            comment: 'Excelente dinâmica de salão e domínio do serviço de bandeja. Confiável e muito educado.',
            date: 'Há 1 semana',
            badge: 'Excelente Postura'
          }
        ]
      },
      {
        id: 'cand-2',
        name: 'Mariana Costa',
        avatarInitials: 'MC',
        level: 3,
        rating: 5.0,
        reviewsCount: 52,
        matchPercentage: 95,
        punctualityRate: 98,
        pixKeyPreview: '***.729.104-**',
        status: 'approved',
        bio: 'Chefe de Salão e Bartender especializada em eventos de grande porte e coordenação de equipes de apoio.',
        roleTitle: 'Maitrê & Garçonete Especialista',
        location: 'São Paulo, SP (Pinheiros • 3.8 km)',
        verified: true,
        completedShiftsCount: 58,
        matchReasons: ['Nível 3 Especialista', 'Avaliação Máxima 5.0', 'Raio de 3.8 km'],
        skills: ['Chefia de Salão', 'Coquetelaria Clássica', 'Fechamento de Caixa', 'Treinamento de Equipe'],
        recentReviews: [
          {
            companyName: 'Grand Hotel Hyatt',
            rating: 5.0,
            comment: 'Profissional de altíssimo nível. Liderou a equipe de apoio e manteve o ritmo perfeito durante todo o banquete.',
            date: 'Há 5 dias',
            badge: 'Liderança & Eficiência'
          }
        ]
      },
      {
        id: 'cand-3',
        name: 'Rodrigo Silveira',
        avatarInitials: 'RS',
        level: 2,
        rating: 4.8,
        reviewsCount: 24,
        matchPercentage: 92,
        punctualityRate: 96,
        pixKeyPreview: '***.483.910-**',
        status: 'applied',
        bio: 'Garçom e Cumim ágil com vasta experiência em bistrôs, restaurantes movimentados e eventos sociais.',
        roleTitle: 'Garçom de Salão & Atendimento',
        location: 'São Paulo, SP (Bela Vista • 4.1 km)',
        verified: true,
        completedShiftsCount: 27,
        matchReasons: ['Categoria compatível', 'Raio de 4.1 km', 'Nível 2 Atendido'],
        skills: ['Garçom de Salão', 'Montagem de Praça', 'Atendimento Rápido', 'Apoio de Bar'],
        recentReviews: [
          {
            companyName: 'Bistrô Paris 6',
            rating: 4.9,
            comment: 'Rodrigo é muito ágil e atencioso. Aguentou o ritmo intenso do sábado à noite sem perder a calma.',
            date: 'Há 4 dias',
            badge: 'Ágil & Focado'
          },
          {
            companyName: 'Eventos Jardins',
            rating: 4.7,
            comment: 'Chegou no horário, ótima apresentação e prestativo com os convidados.',
            date: 'Há 2 semanas',
            badge: 'Pontual'
          }
        ]
      },
      {
        id: 'cand-4',
        name: 'Beatriz Almeida',
        avatarInitials: 'BA',
        level: 1,
        rating: 4.7,
        reviewsCount: 16,
        matchPercentage: 88,
        punctualityRate: 94,
        pixKeyPreview: '***.812.540-**',
        status: 'applied',
        bio: 'Atendente e Auxiliar de eventos com foco em recepção, organização e suporte geral em eventos gastronômicos.',
        roleTitle: 'Auxiliar de Eventos & Atendimento',
        location: 'São Paulo, SP (Moema • 5.0 km)',
        verified: true,
        completedShiftsCount: 18,
        matchReasons: ['Disponibilidade imediata', 'Alta receptividade'],
        skills: ['Recepção', 'Organização de Mesas', 'Atendimento ao Cliente'],
        recentReviews: [
          {
            companyName: 'Espaço JK Eventos',
            rating: 4.8,
            comment: 'Muito dedicada e com sorriso no rosto o tempo todo. Excelente suporte.',
            date: 'Há 1 semana',
            badge: 'Simpatia & Dedicação'
          }
        ]
      },
      {
        id: 'cand-5',
        name: 'Carlos Eduardo Ramos',
        avatarInitials: 'CR',
        level: 2,
        rating: 4.9,
        reviewsCount: 31,
        matchPercentage: 94,
        punctualityRate: 100,
        pixKeyPreview: '***.193.854-**',
        status: 'applied',
        bio: 'Profissional pontual e proativo com histórico sólido em eventos corporativos e serviço volante.',
        roleTitle: 'Garçom & Apoio de Salão',
        location: 'São Paulo, SP (Consolação • 1.9 km)',
        verified: true,
        completedShiftsCount: 35,
        matchReasons: ['100% Pontualidade', 'Raio de 1.9 km', 'Nível 2 Atendido'],
        skills: ['Serviço Volante', 'Organização de Buffet', 'Bandeja', 'Comunicação Clara'],
        recentReviews: [
          {
            companyName: 'Teatro Bradesco Eventos',
            rating: 5.0,
            comment: 'Carlos é impecável. Nunca se atrasa e sempre antecipa as necessidades do salão.',
            date: 'Há 6 dias',
            badge: '100% Pontual'
          }
        ]
      }
    ]
  },
  {
    id: 'comp-job-2',
    title: 'Recepcionista para Feira Tech Summit',
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Itaim Bibi',
      address: 'Rua Funchal, 418'
    },
    date: 'Amanhã, 26 Ago',
    schedule: {
      start: '08:30',
      end: '17:30',
      totalHours: 9
    },
    slots: {
      total: 2,
      filled: 0
    },
    paymentAmount: 220,
    requiredLevel: 2,
    status: 'open',
    requirements: [
      'Vestimenta esporte fino/social',
      'Boa comunicação verbal',
      'Conhecimento básico de credenciamento digital'
    ],
    candidates: [
      {
        id: 'cand-6',
        name: 'Fernanda Lima',
        avatarInitials: 'FL',
        level: 2,
        rating: 4.9,
        reviewsCount: 29,
        matchPercentage: 96,
        punctualityRate: 100,
        pixKeyPreview: '***.502.819-**',
        status: 'applied'
      },
      {
        id: 'cand-7',
        name: 'Guilherme Siqueira',
        avatarInitials: 'GS',
        level: 2,
        rating: 4.8,
        reviewsCount: 21,
        matchPercentage: 90,
        punctualityRate: 95,
        pixKeyPreview: '***.640.129-**',
        status: 'applied'
      }
    ]
  },
  {
    id: 'comp-job-3',
    title: 'Bartender Especialista em Coquetelaria',
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Pinheiros',
      address: 'Rua dos Pinheiros, 680'
    },
    date: 'Sexta, 29 Ago',
    schedule: {
      start: '19:00',
      end: '02:00',
      totalHours: 7
    },
    slots: {
      total: 2,
      filled: 2
    },
    paymentAmount: 260,
    requiredLevel: 3,
    status: 'in_progress',
    requirements: [
      'Aparência profissional',
      'Domínio de coquetéis clássicos e autorais',
      'Agilidade em ritmo de alta demanda'
    ],
    candidates: [
      {
        id: 'cand-8',
        name: 'Thiago Faria',
        avatarInitials: 'TF',
        level: 3,
        rating: 5.0,
        reviewsCount: 64,
        matchPercentage: 99,
        punctualityRate: 100,
        pixKeyPreview: '***.934.120-**',
        status: 'approved'
      },
      {
        id: 'cand-9',
        name: 'Juliana Barbosa',
        avatarInitials: 'JB',
        level: 3,
        rating: 4.9,
        reviewsCount: 47,
        matchPercentage: 97,
        punctualityRate: 98,
        pixKeyPreview: '***.311.902-**',
        status: 'approved'
      }
    ]
  },
  {
    id: 'comp-job-4',
    title: 'Auxiliar de Cozinha para Jantar Harmonizado',
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Bela Vista',
      address: 'Rua Treze de Maio, 840'
    },
    date: '20 Ago',
    schedule: {
      start: '17:00',
      end: '23:00',
      totalHours: 6
    },
    slots: {
      total: 3,
      filled: 3
    },
    paymentAmount: 180,
    requiredLevel: 1,
    status: 'completed',
    requirements: [
      'Dólmã ou jaleco branco limpo',
      'Calçado antiderrapante',
      'Corte e pré-preparo de insumos'
    ],
    candidates: [
      {
        id: 'cand-10',
        name: 'Marcelo Augusto',
        avatarInitials: 'MA',
        level: 2,
        rating: 4.9,
        reviewsCount: 42,
        matchPercentage: 97,
        punctualityRate: 100,
        pixKeyPreview: '***.482.918-**',
        status: 'approved'
      },
      {
        id: 'cand-11',
        name: 'Camila Vasconcelos',
        avatarInitials: 'CV',
        level: 2,
        rating: 4.8,
        reviewsCount: 30,
        matchPercentage: 93,
        punctualityRate: 97,
        pixKeyPreview: '***.294.811-**',
        status: 'approved'
      },
      {
        id: 'cand-12',
        name: 'Alexandre Pires',
        avatarInitials: 'AP',
        level: 1,
        rating: 4.9,
        reviewsCount: 19,
        matchPercentage: 91,
        punctualityRate: 100,
        pixKeyPreview: '***.610.742-**',
        status: 'approved'
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly _jobs = signal<CompanyJob[]>(INITIAL_MOCK_JOBS);
  readonly jobs = this._jobs.asReadonly();

  readonly companyProfile = signal({
    name: 'Buffet Espaço Paulista',
    verified: true,
    category: 'Gastronomia & Eventos',
    rating: 4.9,
    completedShiftsTotal: 48
  });

  readonly metrics = computed<CompanyMetrics>(() => {
    const list = this._jobs();
    const openJobs = list.filter(j => j.status === 'open').length;
    
    // Candidatos aguardando triagem (status === 'applied') em vagas ativas/abertas
    const candidatesUnderReview = list
      .filter(j => j.status === 'open' || j.status === 'in_progress')
      .reduce((total, job) => total + job.candidates.filter(c => c.status === 'applied').length, 0);

    // Contagem de turnos concluídos somando histórico base da contratante + vagas finalizadas no app
    const completedInApp = list.filter(j => j.status === 'completed').length;
    const completedShifts = this.companyProfile().completedShiftsTotal + (completedInApp > 1 ? completedInApp - 1 : 0);

    return {
      openJobs,
      candidatesUnderReview,
      completedShifts
    };
  });

  readonly activeJobs = computed<CompanyJob[]>(() => {
    return this._jobs().filter(j => j.status === 'open' || j.status === 'in_progress');
  });

  readonly historyJobs = computed<CompanyJob[]>(() => {
    return this._jobs().filter(j => j.status === 'completed' || j.status === 'cancelled');
  });

  createJob(jobData: Partial<CompanyJob>): CompanyJob {
    const newId = `comp-job-${Date.now()}`;
    const newJob: CompanyJob = {
      id: newId,
      title: jobData.title || 'Novo Turno',
      category: jobData.category || 'Gastronomia',
      location: jobData.location || {
        city: 'São Paulo',
        neighborhood: 'Centro',
        address: 'Av. Paulista, 1000'
      },
      date: jobData.date || 'Hoje',
      schedule: jobData.schedule || {
        start: '18:00',
        end: '23:00',
        totalHours: 5
      },
      slots: {
        total: jobData.slots?.total || 1,
        filled: 0
      },
      paymentAmount: jobData.paymentAmount || 150,
      requiredLevel: jobData.requiredLevel || 1,
      status: 'open',
      requirements: jobData.requirements && jobData.requirements.length > 0
        ? jobData.requirements
        : ['Aparência profissional e pontualidade'],
      candidates: []
    };

    this._jobs.update(list => [newJob, ...list]);
    return newJob;
  }

  approveCandidate(jobId: string, candidateId: string): void {
    this._jobs.update(list =>
      list.map(job => {
        if (job.id !== jobId) return job;

        let filledCount = job.slots.filled;
        const updatedCandidates = job.candidates.map(candidate => {
          if (candidate.id === candidateId && candidate.status !== 'approved') {
            if (filledCount < job.slots.total) {
              filledCount += 1;
            }
            return { ...candidate, status: 'approved' as const };
          }
          return candidate;
        });

        const newStatus = filledCount >= job.slots.total ? 'in_progress' : job.status;

        return {
          ...job,
          slots: {
            ...job.slots,
            filled: filledCount
          },
          status: newStatus,
          candidates: updatedCandidates
        };
      })
    );
  }

  rejectCandidate(jobId: string, candidateId: string): void {
    this._jobs.update(list =>
      list.map(job => {
        if (job.id !== jobId) return job;

        let filledCount = job.slots.filled;
        const updatedCandidates = job.candidates.map(candidate => {
          if (candidate.id === candidateId) {
            if (candidate.status === 'approved' && filledCount > 0) {
              filledCount -= 1;
            }
            return { ...candidate, status: 'rejected' as const };
          }
          return candidate;
        });

        const newStatus = filledCount < job.slots.total && job.status === 'in_progress' ? 'open' : job.status;

        return {
          ...job,
          slots: {
            ...job.slots,
            filled: filledCount
          },
          status: newStatus,
          candidates: updatedCandidates
        };
      })
    );
  }

  private readonly shiftChatService = inject(ShiftChatService);

  getJobById(jobId: string): CompanyJob | undefined {
    return this._jobs().find(j => j.id === jobId);
  }

  completeShiftAndPayout(jobId: string): {
    job: CompanyJob;
    receiptData: {
      transactionId: string;
      amount: number;
      paidAt: string;
      companyName: string;
      freelancerName: string;
      pixKeyPreview: string;
      jobTitle: string;
    };
  } | null {
    const job = this.getJobById(jobId);
    if (!job) return null;

    // Atualiza status para 'completed'
    this._jobs.update(list =>
      list.map(j => (j.id === jobId ? { ...j, status: 'completed' as const } : j))
    );

    // Exclui sala efêmera vinculada ao turno encerrado
    this.shiftChatService.deleteRoomOnShiftEnd(jobId);

    // Incrementa métrica de turnos concluídos da empresa
    this.companyProfile.update(prof => ({
      ...prof,
      completedShiftsTotal: prof.completedShiftsTotal + 1
    }));

    const approvedCandidate = job.candidates.find(c => c.status === 'approved') || job.candidates[0];
    const freelancerName = approvedCandidate?.name || 'Profissional Trampou';
    const pixKeyPreview = approvedCandidate?.pixKeyPreview || '***.842.190-**';

    const now = new Date();
    const paidAt = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const receiptData = {
      transactionId: `PIX-${Date.now()}-${job.category.toUpperCase().slice(0, 4)}`,
      amount: job.paymentAmount,
      paidAt,
      companyName: this.companyProfile().name,
      freelancerName,
      pixKeyPreview,
      jobTitle: job.title
    };

    return {
      job: { ...job, status: 'completed' },
      receiptData
    };
  }
}

