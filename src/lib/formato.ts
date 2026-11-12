/**
 * Formatação de apresentação. Nada aqui decide ou calcula negócio: só muda a
 * FORMA de um valor que a API já entregou.
 */

export function dataBr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return "—";
  return `${dia}/${mes}/${ano}`;
}

/** `dd/mm` para intervalos curtos ("semana de 01/11 a 07/11/2026"). */
export function diaMesBr(iso: string | null | undefined): string {
  return dataBr(iso).slice(0, 5);
}

export function instanteBr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const quando = new Date(iso);
  if (Number.isNaN(quando.getTime())) return "—";
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${dois(quando.getDate())}/${dois(quando.getMonth() + 1)}/${quando.getFullYear()} ${dois(
    quando.getHours(),
  )}:${dois(quando.getMinutes())}`;
}

/**
 * A semana ANP é `[domingo, domingo+7)`: `semana_fim` é EXCLUSIVO. Na tela, o
 * último dia mostrado é o sábado — mostrar o domingo seguinte faria duas
 * semanas vizinhas parecerem sobrepostas.
 */
export function semanaBr(inicioIso: string, fimExclusivoIso: string): string {
  const fim = new Date(`${fimExclusivoIso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(fim.getTime())) return `semana de ${dataBr(inicioIso)}`;
  fim.setUTCDate(fim.getUTCDate() - 1);
  return `semana de ${diaMesBr(inicioIso)} a ${dataBr(fim.toISOString())}`;
}

export function cnpjBr(cnpj: string | null | undefined): string {
  if (!cnpj) return "—";
  const digitos = cnpj.replace(/\D/g, "");
  if (digitos.length !== 14) return cnpj;
  return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

/**
 * Preço NOMINAL com as casas que a fonte publicou (a ANP usa três). Não
 * arredonda para duas: arredondar é alterar o dado.
 */
export function precoBr(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return "—";
  const [inteiro, decimal = ""] = String(valor).split(".");
  return `R$ ${inteiro},${decimal.padEnd(2, "0")}`;
}

/** "R$ / litro" → "/L"; unidade desconhecida volta como veio. */
export function unidadeCurta(unidade: string | null | undefined): string {
  if (!unidade) return "";
  const limpa = unidade.replace(/^R\$\s*\/\s*/i, "").trim().toLowerCase();
  if (limpa === "litro" || limpa === "l") return "/L";
  if (limpa === "m³" || limpa === "m3") return "/m³";
  return unidade;
}

export function distanciaBr(metros: number | null | undefined): string | null {
  if (metros === null || metros === undefined || !Number.isFinite(metros)) return null;
  if (metros < 1000) return `${Math.round(metros / 10) * 10} m`;
  return `${(metros / 1000).toFixed(1).replace(".", ",")} km`;
}

const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e", "em"]);
const SIGLAS = new Set(["GNV", "ANP", "S.A.", "SA", "S/A", "ME", "EPP", "EIRELI", "II", "III", "IV"]);

/**
 * As fontes publicam nomes em CAIXA ALTA. Em telas pequenas isso ocupa mais e
 * lê pior; o app mostra em caixa de nome próprio. Só a caixa muda — nenhuma
 * letra, acento ou palavra é acrescentada ou retirada.
 */
export function nomeProprio(texto: string | null | undefined): string {
  if (!texto) return "";
  return texto
    .trim()
    .split(/\s+/)
    .map((palavra, indice) => {
      const alta = palavra.toLocaleUpperCase("pt-BR");
      if (SIGLAS.has(alta)) return alta;
      if (alta === "LTDA" || alta === "LTDA.") return "Ltda.";
      const baixa = palavra.toLocaleLowerCase("pt-BR");
      if (indice > 0 && MINUSCULAS.has(baixa)) return baixa;
      return baixa.charAt(0).toLocaleUpperCase("pt-BR") + baixa.slice(1);
    })
    .join(" ");
}

const NOMES_PRODUTOS: Record<string, string> = {
  GASOLINA: "Gasolina",
  "GASOLINA COMUM": "Gasolina comum",
  "GASOLINA C COMUM": "Gasolina comum",
  "GASOLINA ADITIVADA": "Gasolina aditivada",
  "GASOLINA C ADITIVADA": "Gasolina aditivada",
  ETANOL: "Etanol",
  "ETANOL HIDRATADO": "Etanol hidratado",
  "OLEO DIESEL": "Diesel",
  "ÓLEO DIESEL": "Diesel",
  "OLEO DIESEL S10": "Diesel S10",
  "ÓLEO DIESEL S10": "Diesel S10",
  "DIESEL S10": "Diesel S10",
  "DIESEL S500": "Diesel S500",
  GNV: "GNV",
};

/**
 * Rótulo de leitura do produto. Espelha a tabela de equivalências do portal
 * (`web/src/lib/fatos.ts`). Enquanto a API não devolver o rótulo canônico
 * (item do roadmap), as duas tabelas precisam andar juntas.
 */
export function nomeProduto(texto: string): string {
  const normalizado = texto.trim().replace(/\s+/g, " ").toLocaleUpperCase("pt-BR");
  return NOMES_PRODUTOS[normalizado] ?? nomeProprio(normalizado).replace(/\bGnv\b/g, "GNV").replace(/\bS(\d+)\b/gi, "S$1");
}

const NOMES_FONTES: Record<string, string> = {
  F01: "ANP · cadastro",
  F02: "ANP · PMQC",
  F03: "ANP · preços",
  F06: "Senacon · Sindec",
  "GEO-ANP": "ANP · GEO",
  "GEO-01": "Estimada pelo endereço",
};

/**
 * Traduz o código interno da fonte para um nome que o leitor reconhece.
 * Código desconhecido volta como veio: inventar um nome seria pior que mostrar
 * o código, e a fonte nunca some da tela.
 */
export function nomeFonte(codigo: string): string {
  return NOMES_FONTES[codigo.trim().toUpperCase()] ?? codigo;
}

export const SECAO_DA_FONTE: Record<string, string> = {
  F01: "Cadastro",
  F02: "Qualidade",
  F03: "Preços",
  F06: "Atendimentos",
  "GEO-ANP": "Localização",
  "GEO-01": "Localização",
};
