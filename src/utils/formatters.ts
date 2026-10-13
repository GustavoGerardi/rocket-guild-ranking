export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits }).format(
    value,
  );
}

export function dateLabel(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
