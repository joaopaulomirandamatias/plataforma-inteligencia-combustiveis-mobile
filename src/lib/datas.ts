/**
 * Datas digitadas pelo usuário para a visão histórica (`as_of`).
 *
 * Aqui só se converte o que a pessoa digitou no instante que vai à API. Quem
 * decide o que existia naquele instante é o backend: o app não filtra nem
 * reconstrói nada no aparelho.
 */

/** Mantém só dígitos e insere as barras: "15062026" → "15/06/2026". */
export function mascararData(texto: string): string {
  const digitos = texto.replace(/\D/g, "").slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

/** `dd/mm/aaaa` → data local à meia-noite; `null` quando não é data real. */
export function interpretarDataBr(texto: string): Date | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!partes) return null;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const data = new Date(ano, mes - 1, dia);
  // `new Date(2026, 1, 31)` vira 3 de março: recusar em vez de aceitar a
  // data "corrigida" que o usuário não digitou.
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;
  return data;
}

export function formatarDataBr(data: Date): string {
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${dois(data.getDate())}/${dois(data.getMonth() + 1)}/${data.getFullYear()}`;
}

export function mesmoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Instante enviado como `as_of`: o FIM do dia escolhido, no fuso do aparelho.
 * Quem pede "15/06" quer ver tudo o que se sabia até o fim daquele dia, não só
 * até a meia-noite em que ele começou.
 */
export function asOfDoDia(dia: Date): string {
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 23, 59, 59).toISOString();
}

/** N meses antes de `agora`, sem estourar o mês (31/03 − 1 mês = 28/02 ou 29/02). */
export function mesesAtras(meses: number, agora: Date): Date {
  const alvo = new Date(agora.getFullYear(), agora.getMonth() - meses, 1);
  const ultimoDia = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate();
  alvo.setDate(Math.min(agora.getDate(), ultimoDia));
  return alvo;
}
