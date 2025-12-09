// src/utils/validateCPF.ts
export const validateCPF = (value: string): boolean => {
  const cpf = value?.replace(/\D/g, "") ?? "";
  if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calcDigit = (base: string, factor: number) => {
    const total = base
      .split("")
      .map((num, idx) => Number(num) * (factor - idx))
      .reduce((sum, val) => sum + val, 0);
    const mod = (total * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  const digit1 = calcDigit(cpf.slice(0, 9), 10);
  const digit2 = calcDigit(cpf.slice(0, 10), 11);
  return digit1 === Number(cpf[9]) && digit2 === Number(cpf[10]);
};
