export const API_ENDPOINTS = {
  // Autenticação & Sessão
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me'
  },
  // Oportunidades & Feed
  OPPORTUNITIES: {
    FEED: '/opportunities/feed',
    DETAILS: (id: string) => `/opportunities/${id}`,
    APPLY: (id: string) => `/opportunities/${id}/apply`,
    CANCEL_APPLICATION: (id: string) => `/opportunities/${id}/cancel`
  },
  // Meus Trabalhos & Turnos
  MY_JOBS: {
    CONFIRMED: '/my-jobs/confirmed',
    UNDER_REVIEW: '/my-jobs/under-review',
    HISTORY: '/my-jobs/history',
    CHECK_IN: (jobId: string) => `/my-jobs/${jobId}/check-in`,
    CANCEL_SHIFT: (jobId: string) => `/my-jobs/${jobId}/cancel`
  },
  // Empresas & Perfil Público
  COMPANIES: {
    FEATURED: '/companies/featured',
    PUBLIC_PROFILE: (idOrHandle: string) => `/companies/${idOrHandle}/profile`,
    FOLLOW: (companyId: string) => `/companies/${companyId}/follow`,
    FAVORITE: (companyId: string) => `/companies/${companyId}/favorite`,
    OPEN_JOBS: (companyId: string) => `/companies/${companyId}/jobs`
  },
  // Campanhas & Gestão da Empresa (/empresa)
  CAMPAIGNS: {
    LIST: '/campaigns',
    ACTIVE: '/campaigns/active',
    CREATE: '/campaigns',
    METRICS: '/campaigns/metrics'
  },
  // Usuário Logado & Perfil
  USER_PROFILE: {
    ME: '/users/me',
    UPDATE_PIX: '/users/me/pix-key',
    REPUTATION: '/users/me/reputation'
  },
  // Painel Operacional da Empresa (/empresa)
  COMPANY_DASHBOARD: {
    PROFILE: '/companies/me',
    ACTIVE_JOBS: '/companies/me/jobs/active',
    HISTORY_JOBS: '/companies/me/jobs/history',
    CONTACTS: '/companies/me/contacts',
    METRICS: '/companies/me/metrics',
    CREATE_JOB: '/company/jobs'
  },
  // Avisos & Notificações
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all'
  },
  // Mensagens do Chat Unificado
  MESSAGES: {
    CHANNEL: (channelId: string) => `/messages/${channelId}`,
    SEND: '/messages'
  }
} as const;
