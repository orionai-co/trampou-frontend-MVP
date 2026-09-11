import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador de CNPJ de acordo com a regra oficial da Receita Federal do Brasil.
 * Retorna null se for válido (ou vazio, delegando obrigatoriedade ao Validators.required),
 * ou { cnpjInvalid: true } se inválido.
 */
export function validateCnpj(control: AbstractControl): ValidationErrors | null {
  if (control.value === null || control.value === undefined || control.value === '') {
    return null;
  }

  const value = String(control.value);
  const clean = value.replace(/\D/g, '');

  if (clean.length !== 14) {
    return { cnpjInvalid: true };
  }

  // Rejeita sequências com todos os dígitos repetidos (ex: 00000000000000, 11111111111111)
  if (/^(\d)\1{13}$/.test(clean)) {
    return { cnpjInvalid: true };
  }

  // Cálculo do 1º dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += parseInt(clean.charAt(i), 10) * weights1[i];
  }
  const rest1 = sum1 % 11;
  const digit1 = rest1 < 2 ? 0 : 11 - rest1;

  if (parseInt(clean.charAt(12), 10) !== digit1) {
    return { cnpjInvalid: true };
  }

  // Cálculo do 2º dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += parseInt(clean.charAt(i), 10) * weights2[i];
  }
  const rest2 = sum2 % 11;
  const digit2 = rest2 < 2 ? 0 : 11 - rest2;

  if (parseInt(clean.charAt(13), 10) !== digit2) {
    return { cnpjInvalid: true };
  }

  return null;
}

/**
 * Função utilitária pura para validação booleana direta de CNPJ
 */
export function isValidCnpj(cnpj: string | null | undefined): boolean {
  if (!cnpj) return false;
  const clean = String(cnpj).replace(/\D/g, '');
  if (clean.length !== 14 || /^(\d)\1{13}$/.test(clean)) {
    return false;
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += parseInt(clean.charAt(i), 10) * weights1[i];
  }
  const rest1 = sum1 % 11;
  const digit1 = rest1 < 2 ? 0 : 11 - rest1;
  if (parseInt(clean.charAt(12), 10) !== digit1) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += parseInt(clean.charAt(i), 10) * weights2[i];
  }
  const rest2 = sum2 % 11;
  const digit2 = rest2 < 2 ? 0 : 11 - rest2;
  return parseInt(clean.charAt(13), 10) === digit2;
}

/**
 * Factory opcional no formato ValidatorFn para formulários reativos
 */
export const cnpjValidator: ValidatorFn = validateCnpj;
