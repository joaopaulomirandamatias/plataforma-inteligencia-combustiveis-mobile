/**
 * Paridade do léxico: o espelho do app tem de ser IGUAL à fonte canônica do
 * repositório de docs (`docs/agentes/lexico-bloqueado.json`).
 *
 * O arquivo canônico é procurado em dois lugares:
 *
 * 1. `PIC_LEXICO_CANONICO` — o caminho que o CI informa depois de clonar o
 *    repositório de docs (público, então sem credencial), como no portal;
 * 2. `.lexico-docs/`, o destino padrão desse clone;
 * 3. o repositório de docs clonado ao lado deste, no desenvolvimento local.
 *
 * Sem o arquivo, o teste PULA fora de CI e FALHA dentro dela: uma conferência
 * que não pôde acontecer não é um verde.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { LEXICO_BLOQUEADO } from "@/lib/politica";

const RAIZ = join(__dirname, "..", "..");

const CANDIDATOS = [
  ...(process.env.PIC_LEXICO_CANONICO ? [join(RAIZ, process.env.PIC_LEXICO_CANONICO)] : []),
  join(RAIZ, ".lexico-docs", "docs", "agentes", "lexico-bloqueado.json"),
  join(RAIZ, "..", "plataforma-inteligencia-combustiveis-docs", "docs", "agentes", "lexico-bloqueado.json"),
];

const caminho = CANDIDATOS.find((candidato) => existsSync(candidato));
const emCI = Boolean(process.env.CI);

describe("paridade com o léxico canônico", () => {
  if (!caminho) {
    (emCI ? it : it.skip)("o léxico canônico precisa estar em disco na CI", () => {
      throw new Error(`Léxico canônico não encontrado. Procurado em:\n${CANDIDATOS.join("\n")}`);
    });
    return;
  }

  const canonico = JSON.parse(readFileSync(caminho, "utf8")) as { termos: { radical: string }[] };
  const radicais = canonico.termos.map((termo) => termo.radical);

  it("o espelho do app tem exatamente os radicais da fonte, na mesma ordem", () => {
    expect([...LEXICO_BLOQUEADO]).toEqual(radicais);
  });

  it("a fonte canônica não está vazia", () => {
    expect(radicais.length).toBeGreaterThan(10);
  });
});
