import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { todosOsTextos } from "@/lib/mensagens";
import { AVISO_INTERPRETACAO, LEXICO_BLOQUEADO, termosBloqueados } from "@/lib/politica";

describe("detector do léxico bloqueado", () => {
  it("alcança a flexão de gênero e de número", () => {
    for (const forma of ["suspeito", "suspeita", "suspeitos", "suspeitas"]) {
      expect(termosBloqueados(`amostra ${forma}`)).toContain("suspeit");
    }
    expect(termosBloqueados("combustível adulterado")).toContain("adultera");
    expect(termosBloqueados("houve adulteração")).toContain("adultera");
  });

  it("não dispara dentro de outra palavra", () => {
    expect(termosBloqueados("não é um posto aprovado")).toEqual([]);
    expect(termosBloqueados("lote reprovado na inspeção")).toEqual([]);
    expect(termosBloqueados("cadastro regular")).toEqual([]);
  });

  it("dispara no início do texto e depois de pontuação", () => {
    expect(termosBloqueados("Fraude")).toContain("fraude");
    expect(termosBloqueados("(irregular)")).toContain("irregular");
    expect(termosBloqueados("provado em laudo")).toContain("provad");
  });

  it("ignora acento e caixa dos dois lados", () => {
    expect(termosBloqueados("IMPOSSÍVEL de burlar")).toContain("impossive");
    expect(termosBloqueados("máfia")).toContain("mafia");
    expect(termosBloqueados("Grupo Econômico")).toContain("grupo econom");
  });

  it("impossibilidade é fato administrativo e passa", () => {
    expect(termosBloqueados("impossibilidade de coleta")).toEqual([]);
  });
});

describe("a cópia do app respeita a política de linguagem", () => {
  it("nenhuma mensagem centralizada contém termo bloqueado", () => {
    const textos = [...todosOsTextos(), AVISO_INTERPRETACAO];
    expect(textos.length).toBeGreaterThan(40);
    for (const texto of textos) {
      expect({ texto, termos: termosBloqueados(texto) }).toEqual({ texto, termos: [] });
    }
  });

  /**
   * Rótulos de botão, títulos e textos de acessibilidade moram nos
   * componentes, fora de `mensagens.ts`. Varrer o FONTE inteiro é mais
   * grosseiro do que renderizar cada tela, e é de propósito: pega também o
   * texto de um estado que nenhum teste de tela chegou a montar. O custo é
   * que comentário também é varrido — quem precisar citar um termo
   * bloqueado para explicar a regra o faz em `politica.ts`, que é a exceção.
   */
  it("nenhum arquivo de tela ou componente contém termo bloqueado", () => {
    const raiz = join(__dirname, "..");
    const isentos = new Set(["lib/politica.ts"]);
    const achados: string[] = [];

    const visitar = (pasta: string) => {
      for (const nome of readdirSync(pasta)) {
        const caminho = join(pasta, nome);
        const rel = relative(raiz, caminho).replace(/\\/g, "/");
        if (statSync(caminho).isDirectory()) {
          if (rel !== "testes") visitar(caminho);
        } else if (/\.tsx?$/.test(nome) && !isentos.has(rel)) {
          const termos = termosBloqueados(readFileSync(caminho, "utf8"));
          if (termos.length > 0) achados.push(`${rel}: ${termos.join(", ")}`);
        }
      }
    };
    visitar(raiz);

    expect(achados).toEqual([]);
  });

  it("o léxico não tem radical repetido nem com acento", () => {
    expect(new Set(LEXICO_BLOQUEADO).size).toBe(LEXICO_BLOQUEADO.length);
    for (const radical of LEXICO_BLOQUEADO) {
      expect(radical).toBe(radical.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase());
    }
  });
});
