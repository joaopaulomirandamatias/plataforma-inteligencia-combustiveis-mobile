/**
 * Política de linguagem — espelho do léxico bloqueado (ADR-008).
 *
 * A FONTE normativa é `docs/agentes/lexico-bloqueado.json`, no repositório de
 * docs. Este arquivo é o TERCEIRO espelho (backend, portal, app), e o teste
 * `paridade.test.ts` falha quando ele diverge da fonte.
 *
 * O detector é o mesmo das outras camadas, e as duas propriedades dele não são
 * detalhe de implementação:
 *
 * 1. Os termos são RADICAIS sem a vogal final, para alcançar a flexão de
 *    gênero ("suspeit" pega suspeito, suspeita, suspeitos, suspeitas).
 * 2. A comparação exige fronteira de INÍCIO de palavra e fim livre, para não
 *    disparar dentro de outra palavra ("provad" não casa "aprovado").
 *
 * Simplificar para palavra inteira ou para substring reabre um buraco que já
 * custou uma divergência silenciosa entre camadas.
 */

export const LEXICO_BLOQUEADO: readonly string[] = [
  "fraude",
  "fraudad",
  "fraudador",
  "fraudulent",
  "adultera",
  "criminos",
  "culpad",
  "comprovad",
  "provad",
  "certeza",
  "garantid",
  "impossive",
  "grupo econom",
  "sonega",
  "mafia",
  "quadrilh",
  "irregular",
  "suspeit",
];

export function semAcento(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const DETECTORES = LEXICO_BLOQUEADO.map((radical) => ({
  radical,
  // Fronteira de início: começo do texto ou qualquer caractere que não seja
  // letra/dígito. Fim livre.
  padrao: new RegExp(`(^|[^a-z0-9])${escaparRegex(radical)}`),
}));

/** Devolve os radicais bloqueados presentes no texto; vazio quando limpo. */
export function termosBloqueados(texto: string): string[] {
  const normalizado = semAcento(texto);
  return DETECTORES.filter(({ padrao }) => padrao.test(normalizado)).map(({ radical }) => radical);
}

/**
 * Aviso obrigatório da ficha. Mesma redação do portal, com "esta ficha" no
 * lugar de "esta página".
 */
export const AVISO_INTERPRETACAO =
  "Esta ficha reúne dados públicos da ANP e da Senacon/Sindec, com data e fonte " +
  "em cada informação. Ela não avalia, não classifica e não conclui nada sobre os " +
  "estabelecimentos: a apuração é competência dos órgãos reguladores. Em caso de " +
  "dúvida sobre um produto, procure a ANP ou o Procon.";
