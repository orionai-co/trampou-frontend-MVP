export type UserRole = 'professional' | 'contractor';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUserSummary;
  accessToken?: string;
}

export interface ProfessionalRegisterPayload {
  nome: string;
  email: string;
  whatsapp: string;
  senha: string;
  area: string;
  especialidades: string[] | string;
  experiencia: string;
  cidade: string;
  estado: string;
  raio: number | string;
  disponibilidade: string[] | string;
  name?: string;
  password?: string;
}

export interface CompanyRegisterPayload {
  responsavel: string;
  email: string;
  whatsapp: string;
  senha: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  segmento: string;
  tipoContratante: string;
  cidade: string;
  estado: string;
  endereco: string;
  name?: string;
  password?: string;
}
