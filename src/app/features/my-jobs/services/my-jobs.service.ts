import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { JobApplication, JobApplicationStatus } from '../models/job-application.model';

const INITIAL_MOCK_APPLICATIONS: JobApplication[] = [
  // 1. CONFIRMADOS (ATIVOS)
  {
    id: 'app-001',
    opportunityId: 'opp-001',
    title: 'Garçom para Casamento e Buffet Noturno',
    companyName: 'Buffet Espaço Paulista',
    companyRating: 4.9,
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Vila Olímpia',
      address: 'Rua Funchal, 418',
      mapUrl: 'https://maps.google.com/?q=Rua+Funchal+418+Sao+Paulo',
      distanceKm: 2.4
    },
    date: 'Hoje',
    isToday: true,
    schedule: {
      start: '18:00',
      end: '01:00',
      totalHours: 7
    },
    payment: {
      amount: 180,
      type: 'diaria',
      pixImmediate: true
    },
    status: 'accepted',
    appliedAt: new Date(Date.now() - 3600000 * 3),
    checkInStatus: 'pending',
    instructions: [
      'Entrada de serviço pela lateral do salão (Rua Funchal, 418 - Portão B)',
      'Apresentar documento com foto na portaria e procurar por Roberto (Metre)',
      'Traje social completo (camisa branca de manga longa, calça social preta e sapato preto)',
      'Briefing operacional obrigatório às 17h45'
    ],
    contactPhone: '(11) 98765-4321'
  },
  {
    id: 'app-002',
    opportunityId: 'opp-002',
    title: 'Auxiliar de Bar e Coquetelaria',
    companyName: 'SkyLounge Rooftop',
    companyRating: 4.8,
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Itaim Bibi',
      address: 'Av. Brigadeiro Faria Lima, 3477 - 18º andar',
      mapUrl: 'https://maps.google.com/?q=Av+Brigadeiro+Faria+Lima+3477+Sao+Paulo',
      distanceKm: 3.8
    },
    date: 'Amanhã',
    isToday: false,
    schedule: {
      start: '19:00',
      end: '02:00',
      totalHours: 7
    },
    payment: {
      amount: 160,
      type: 'diaria',
      pixImmediate: true
    },
    status: 'accepted',
    appliedAt: new Date(Date.now() - 3600000 * 8),
    checkInStatus: 'pending',
    instructions: [
      'Subir pelo elevador social até a cobertura e se identificar na recepção',
      'Camisa preta lisa sem estampas e calçado fechado',
      'Apoio direto ao Bartender Chefe (Alex)'
    ],
    contactPhone: '(11) 99123-8877'
  },

  // 2. EM ANÁLISE (AGUARDANDO RODADA DE SELEÇÃO)
  {
    id: 'app-003',
    opportunityId: 'opp-004',
    title: 'Operador de Caixa para Festival Gastronômico',
    companyName: 'Street Gourmet Eventos',
    companyRating: 4.7,
    category: 'Atendimento',
    location: {
      city: 'São Paulo',
      neighborhood: 'Pinheiros',
      address: 'Praça Benedito Calixto, 85',
      mapUrl: 'https://maps.google.com/?q=Praca+Benedito+Calixto+85+Sao+Paulo',
      distanceKm: 4.1
    },
    date: 'Hoje',
    isToday: true,
    schedule: {
      start: '12:00',
      end: '22:00',
      totalHours: 10
    },
    payment: {
      amount: 170,
      type: 'diaria',
      pixImmediate: true
    },
    status: 'pending',
    appliedAt: new Date(Date.now() - 600000),
    responseTimeRemaining: 'Resposta em até 15 min'
  },
  {
    id: 'app-004',
    opportunityId: 'opp-003',
    title: 'Recepcionista e Credenciamento de Feira',
    companyName: 'Expo Tech & Inovação 2026',
    companyRating: 4.9,
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Santana',
      address: 'Rua José Bernardo Pinto, 333 (Expo Center Norte)',
      mapUrl: 'https://maps.google.com/?q=Expo+Center+Norte+Sao+Paulo',
      distanceKm: 7.2
    },
    date: 'Amanhã',
    isToday: false,
    schedule: {
      start: '08:00',
      end: '17:00',
      totalHours: 9
    },
    payment: {
      amount: 150,
      type: 'diaria',
      pixImmediate: true
    },
    status: 'pending',
    appliedAt: new Date(Date.now() - 1800000),
    responseTimeRemaining: 'Resposta em até 35 min'
  },

  // 3. HISTÓRICO (SERVIÇOS CONCLUÍDOS E PAGOS VIA PIX)
  {
    id: 'app-005',
    opportunityId: 'opp-007',
    title: 'Auxiliar de Salão / Cumim para Jantar',
    companyName: 'Restaurante Terraço Jardins',
    companyRating: 4.9,
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Jardins',
      address: 'Alameda Santos, 1120',
      distanceKm: 3.1
    },
    date: '20 Ago',
    schedule: {
      start: '18:30',
      end: '23:30',
      totalHours: 5
    },
    payment: {
      amount: 150,
      type: 'diaria',
      pixImmediate: true,
      paidAt: '20/08/2026 às 23:42',
      receiptId: 'PIX-84920481-TERRACO',
      pixKeyType: 'Chave CPF'
    },
    status: 'completed',
    appliedAt: new Date('2026-08-19T14:00:00')
  },
  {
    id: 'app-006',
    opportunityId: 'opp-009',
    title: 'Promotor de Ativação e Degustação',
    companyName: 'Agência Sparkle Marketing',
    companyRating: 4.8,
    category: 'Atendimento',
    location: {
      city: 'São Paulo',
      neighborhood: 'Morumbi',
      address: 'Av. Roque Petroni Júnior, 1089',
      distanceKm: 5.8
    },
    date: '17 Ago',
    schedule: {
      start: '10:00',
      end: '18:00',
      totalHours: 8
    },
    payment: {
      amount: 160,
      type: 'diaria',
      pixImmediate: true,
      paidAt: '17/08/2026 às 18:15',
      receiptId: 'PIX-73918239-SPARKLE',
      pixKeyType: 'Chave CPF'
    },
    status: 'completed',
    appliedAt: new Date('2026-08-16T10:00:00')
  },
  {
    id: 'app-007',
    opportunityId: 'opp-006',
    title: 'Conferente de Ingressos e Acesso VIP',
    companyName: 'Arena Hall Concerts',
    companyRating: 4.8,
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Mooca',
      address: 'Rua Juventus, 120',
      distanceKm: 6.0
    },
    date: '15 Ago',
    schedule: {
      start: '19:00',
      end: '00:00',
      totalHours: 5
    },
    payment: {
      amount: 140,
      type: 'diaria',
      pixImmediate: true,
      paidAt: '16/08/2026 às 00:10',
      receiptId: 'PIX-63910294-ARENA',
      pixKeyType: 'Chave CPF'
    },
    status: 'completed',
    appliedAt: new Date('2026-08-14T11:00:00')
  },
  {
    id: 'app-008',
    opportunityId: 'opp-011',
    title: 'Garçom para Jantar Corporativo',
    companyName: 'Buffet Mansão Real',
    companyRating: 4.9,
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Brooklin',
      address: 'Rua Flórida, 1750',
      distanceKm: 4.5
    },
    date: '12 Ago',
    schedule: {
      start: '18:00',
      end: '00:00',
      totalHours: 6
    },
    payment: {
      amount: 190,
      type: 'diaria',
      pixImmediate: true,
      paidAt: '12/08/2026 às 00:22',
      receiptId: 'PIX-52910394-MANSAO',
      pixKeyType: 'Chave CPF'
    },
    status: 'completed',
    appliedAt: new Date('2026-08-11T09:00:00')
  },
  {
    id: 'app-009',
    opportunityId: 'opp-012',
    title: 'Auxiliar de Bar e Apoio',
    companyName: 'High Line Bar',
    companyRating: 4.7,
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Vila Madalena',
      address: 'Rua Girassol, 144',
      distanceKm: 3.2
    },
    date: '10 Ago',
    schedule: {
      start: '19:00',
      end: '02:00',
      totalHours: 7
    },
    payment: {
      amount: 160,
      type: 'diaria',
      pixImmediate: true,
      paidAt: '11/08/2026 às 02:12',
      receiptId: 'PIX-41920394-HIGHLINE',
      pixKeyType: 'Chave CPF'
    },
    status: 'completed',
    appliedAt: new Date('2026-08-09T16:00:00')
  },
  {
    id: 'app-010',
    opportunityId: 'opp-005',
    title: 'Auxiliar de Montagem e Estrutura',
    companyName: 'Live Pro Produções',
    companyRating: 4.6,
    category: 'Operacional',
    location: {
      city: 'São Paulo',
      neighborhood: 'Barra Funda',
      address: 'Av. Francisco Matarazzo, 1705',
      distanceKm: 5.5
    },
    date: '06 Ago',
    schedule: {
      start: '07:00',
      end: '15:00',
      totalHours: 8
    },
    payment: {
      amount: 190,
      type: 'diaria',
      pixImmediate: true,
      paidAt: '06/08/2026 às 15:18',
      receiptId: 'PIX-30919294-LIVEPRO',
      pixKeyType: 'Chave CPF'
    },
    status: 'completed',
    appliedAt: new Date('2026-08-05T18:00:00')
  },
  {
    id: 'app-011',
    opportunityId: 'opp-013',
    title: 'Operador de Caixa e Fichas',
    companyName: 'Oktoberfest SP',
    companyRating: 4.8,
    category: 'Atendimento',
    location: {
      city: 'São Paulo',
      neighborhood: 'Interlagos',
      address: 'Autódromo de Interlagos',
      distanceKm: 12.0
    },
    date: '02 Ago',
    schedule: {
      start: '12:00',
      end: '22:00',
      totalHours: 10
    },
    payment: {
      amount: 170,
      type: 'diaria',
      pixImmediate: true,
      paidAt: '02/08/2026 às 22:30',
      receiptId: 'PIX-20919294-OKTOBER',
      pixKeyType: 'Chave CPF'
    },
    status: 'completed',
    appliedAt: new Date('2026-08-01T10:00:00')
  },
  {
    id: 'app-012',
    opportunityId: 'opp-014',
    title: 'Recepcionista de Evento Corporativo',
    companyName: 'Centro de Convenções Rebouças',
    companyRating: 4.9,
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Pinheiros',
      address: 'Av. Rebouças, 600',
      distanceKm: 2.1
    },
    date: '01 Ago',
    schedule: {
      start: '08:00',
      end: '14:00',
      totalHours: 6
    },
    payment: {
      amount: 120,
      type: 'diaria',
      pixImmediate: true,
      paidAt: '01/08/2026 às 14:15',
      receiptId: 'PIX-10919294-REBOUCAS',
      pixKeyType: 'Chave CPF'
    },
    status: 'completed',
    appliedAt: new Date('2026-07-31T15:00:00')
  }
];

@Injectable({
  providedIn: 'root'
})
export class MyJobsService {
  private applicationsState = signal<JobApplication[]>(INITIAL_MOCK_APPLICATIONS);

  readonly applications = this.applicationsState.asReadonly();

  // 1. Confirmados (Aceitos)
  readonly acceptedJobs = computed(() =>
    this.applications().filter(a => a.status === 'accepted')
  );

  // 2. Em Análise (Aguardando)
  readonly pendingJobs = computed(() =>
    this.applications().filter(a => a.status === 'pending')
  );

  // 3. Histórico (Concluídos)
  readonly completedJobs = computed(() =>
    this.applications().filter(a => a.status === 'completed')
  );

  // Métrica 1: A Receber (Total previsto de confirmados)
  readonly toReceiveAmount = computed(() =>
    this.acceptedJobs().reduce((sum, item) => sum + item.payment.amount, 0)
  );

  // Métrica 2: Recebido no Mês (Total pago via PIX dos concluídos)
  readonly receivedThisMonthAmount = computed(() =>
    this.completedJobs().reduce((sum, item) => sum + item.payment.amount, 0)
  );

  getApplications(): Observable<JobApplication[]> {
    return of(this.applications()).pipe(delay(150));
  }

  confirmCheckIn(applicationId: string): Observable<{ success: boolean; time: string }> {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.applicationsState.update(list =>
      list.map(item =>
        item.id === applicationId
          ? { ...item, checkInStatus: 'checked_in', checkInTime: time }
          : item
      )
    );
    return of({ success: true, time }).pipe(delay(200));
  }

  cancelApplication(applicationId: string): Observable<boolean> {
    this.applicationsState.update(list =>
      list.filter(item => item.id !== applicationId)
    );
    return of(true).pipe(delay(150));
  }

  withdrawJob(applicationId: string, reason?: string): Observable<boolean> {
    this.applicationsState.update(list =>
      list.filter(item => item.id !== applicationId)
    );
    return of(true).pipe(delay(150));
  }

  addPendingApplication(app: Partial<JobApplication>): void {
    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      opportunityId: app.opportunityId || `opp-${Date.now()}`,
      title: app.title || 'Oportunidade',
      companyName: app.companyName || 'Empresa Contratante',
      category: app.category || 'Eventos',
      location: app.location || {
        city: 'São Paulo',
        neighborhood: 'Pinheiros',
        address: 'São Paulo, SP'
      },
      date: app.date || 'Hoje',
      isToday: app.isToday !== undefined ? app.isToday : true,
      schedule: app.schedule || { start: '18:00', end: '00:00', totalHours: 6 },
      payment: app.payment || { amount: 150, type: 'diaria', pixImmediate: true },
      status: 'pending',
      appliedAt: new Date(),
      responseTimeRemaining: 'Resposta em até 30 min'
    };

    this.applicationsState.update(list => [newApp, ...list]);
  }
}
