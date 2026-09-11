import { FormControl } from '@angular/forms';
import { validateCnpj, isValidCnpj } from '../../src/app/core/validators/cnpj.validator';

describe('validateCnpj & isValidCnpj', () => {
  describe('validateCnpj (Reactive Forms Validator)', () => {
    it('deve retornar null para valores vazios ou não definidos (permitindo composição com Validators.required)', () => {
      expect(validateCnpj(new FormControl(''))).toBeNull();
      expect(validateCnpj(new FormControl(null))).toBeNull();
      expect(validateCnpj(new FormControl(undefined))).toBeNull();
    });

    it('deve aceitar CNPJs reais conhecidos válidos (formatados e desformatados)', () => {
      // Banco do Brasil: 00.000.000/0001-91
      expect(validateCnpj(new FormControl('00.000.000/0001-91'))).toBeNull();
      expect(validateCnpj(new FormControl('00000000000191'))).toBeNull();

      // Petrobras: 33.000.167/0001-01
      expect(validateCnpj(new FormControl('33.000.167/0001-01'))).toBeNull();
      expect(validateCnpj(new FormControl('33000167000101'))).toBeNull();

      // Ambev: 07.526.557/0001-00
      expect(validateCnpj(new FormControl('07.526.557/0001-00'))).toBeNull();
      expect(validateCnpj(new FormControl('07526557000100'))).toBeNull();

      // Magazine Luiza: 47.960.950/0001-21
      expect(validateCnpj(new FormControl('47.960.950/0001-21'))).toBeNull();
      expect(validateCnpj(new FormControl('47960950000121'))).toBeNull();
    });

    it('deve rejeitar sequências de dígitos repetidos', () => {
      expect(validateCnpj(new FormControl('00000000000000'))).toEqual({ cnpjInvalid: true });
      expect(validateCnpj(new FormControl('11111111111111'))).toEqual({ cnpjInvalid: true });
      expect(validateCnpj(new FormControl('11.111.111/1111-11'))).toEqual({ cnpjInvalid: true });
      expect(validateCnpj(new FormControl('22.222.222/2222-22'))).toEqual({ cnpjInvalid: true });
      expect(validateCnpj(new FormControl('99.999.999/9999-99'))).toEqual({ cnpjInvalid: true });
    });

    it('deve rejeitar CNPJs com primeiro ou segundo dígito verificador trocado', () => {
      // Banco do Brasil original: 00.000.000/0001-91
      expect(validateCnpj(new FormControl('00.000.000/0001-92'))).toEqual({ cnpjInvalid: true });
      expect(validateCnpj(new FormControl('00.000.000/0001-81'))).toEqual({ cnpjInvalid: true });

      // Petrobras original: 33.000.167/0001-01
      expect(validateCnpj(new FormControl('33.000.167/0001-02'))).toEqual({ cnpjInvalid: true });
      expect(validateCnpj(new FormControl('33.000.167/0001-11'))).toEqual({ cnpjInvalid: true });
    });

    it('deve rejeitar strings com tamanhos incorretos ou caracteres inválidos', () => {
      expect(validateCnpj(new FormControl('12345'))).toEqual({ cnpjInvalid: true });
      expect(validateCnpj(new FormControl('12.345.678/0001'))).toEqual({ cnpjInvalid: true });
      expect(validateCnpj(new FormControl('00.000.000/0001-910'))).toEqual({ cnpjInvalid: true }); // 15 dígitos
      expect(validateCnpj(new FormControl('abcdefghijklmn'))).toEqual({ cnpjInvalid: true });
    });
  });

  describe('isValidCnpj (Pure Utility Function)', () => {
    it('deve retornar true para CNPJs válidos', () => {
      expect(isValidCnpj('00.000.000/0001-91')).toBeTrue();
      expect(isValidCnpj('33.000.167/0001-01')).toBeTrue();
      expect(isValidCnpj('47960950000121')).toBeTrue();
    });

    it('deve retornar false para valores nulos, vazios ou inválidos', () => {
      expect(isValidCnpj('')).toBeFalse();
      expect(isValidCnpj(null)).toBeFalse();
      expect(isValidCnpj(undefined)).toBeFalse();
      expect(isValidCnpj('11111111111111')).toBeFalse();
      expect(isValidCnpj('00.000.000/0001-92')).toBeFalse();
      expect(isValidCnpj('123')).toBeFalse();
    });
  });
});
