const brl = (digits: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export function formatPrice(value: number): string {
  return brl(Number.isInteger(value) ? 0 : 2).format(value);
}

export function yearlySavingsPercent(monthly: number, yearly: number): number {
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}

/** State for the pricing section's monthly/yearly billing switch. */
export default () => ({
  yearly: false,
});
