import { fireEvent, render, screen } from "@testing-library/react-native";

import { paraContextoRegional, paraPosto } from "@/api/borda";
import { SecaoPrecos } from "@/ficha/SecaoPrecos";
import { SecaoQualidade } from "@/ficha/SecaoQualidade";
import { MENSAGENS } from "@/lib/mensagens";
import { termosBloqueados } from "@/lib/politica";
import { agrupamentoDoFio, contextoDoFio, postoDoFio, VESTIGIOS_DE_AUDITORIA } from "@/testes/apoio";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn(), navigate: jest.fn() } }));

/** Todo o texto que a tela renderizou, para as conferências de política. */
function textoDaTela(): string {
  return JSON.stringify(screen.toJSON());
}

describe("aba Qualidade", () => {
  const qualidade = paraPosto(postoDoFio()).qualidade_combustivel;

  it("mostra as três contagens separadas e nenhum percentual", async () => {
    await render(<SecaoQualidade qualidade={qualidade} />);
    expect(screen.getAllByText("3 conforme").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 não conforme").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 não classificado").length).toBeGreaterThan(0);
    // "% volume" é unidade de um ensaio e pode aparecer; taxa do posto, não.
    expect(screen.queryByText(/\d+\s?%\s*(conforme|não conforme|de conformidade|dos ensaios)/)).toBeNull();
  });

  it("avisa que o recorte está truncado, sem publicar total", async () => {
    await render(<SecaoQualidade qualidade={qualidade} />);
    expect(screen.getByText(new RegExp(MENSAGENS.recorteTruncado(8).replace(/[()]/g, "\\$&")))).toBeTruthy();
    expect(screen.queryByText(/\d+ de \d+/)).toBeNull();
  });

  it("só o grupo mais recente abre de início; os outros abrem ao toque", async () => {
    await render(<SecaoQualidade qualidade={qualidade} />);
    expect(screen.getByText("Teor de etanol anidro")).toBeTruthy();
    expect(screen.queryByText("Teor alcoólico")).toBeNull();
    await fireEvent.press(screen.getByText("Mostrar os 1 ensaio"));
    expect(screen.getByText("Teor alcoólico")).toBeTruthy();
  });

  it("cada ensaio leva fonte e data próprias", async () => {
    await render(<SecaoQualidade qualidade={qualidade} />);
    expect(screen.getAllByText("ANP · PMQC · 18/05/2026").length).toBe(4);
  });

  it("resultado sem unidade diz isso em vez de omitir", async () => {
    await render(<SecaoQualidade qualidade={qualidade} />);
    expect(screen.getByText(/Límpido · unidade não informada/)).toBeTruthy();
  });

  it("recorte vazio não vira zero nem aprovação", async () => {
    const vazia = paraPosto(
      postoDoFio({ qualidade_combustivel: { identidade_agrupamento: "derivada", limite: 8, truncado: false, agrupamentos: [] } }),
    ).qualidade_combustivel;
    await render(<SecaoQualidade qualidade={vazia} />);
    expect(screen.getByText(MENSAGENS.semQualidade.etiqueta)).toBeTruthy();
    expect(screen.getByText(MENSAGENS.semQualidade.corpo)).toBeTruthy();
    expect(screen.queryByText(/^0 /)).toBeNull();
    expect(screen.queryByText("grupos de ensaios")).toBeNull();
  });

  it("o que foi renderizado respeita o léxico e não carrega dado de auditoria", async () => {
    await render(<SecaoQualidade qualidade={qualidade} />);
    const texto = textoDaTela();
    expect(termosBloqueados(texto)).toEqual([]);
    for (const vestigio of VESTIGIOS_DE_AUDITORIA) expect(texto).not.toContain(vestigio);
  });

  it("um ensaio não conforme é rotulado no ensaio, nunca no posto", async () => {
    const umSo = paraPosto(
      postoDoFio({
        qualidade_combustivel: {
          identidade_agrupamento: "derivada",
          limite: 8,
          truncado: false,
          agrupamentos: [agrupamentoDoFio()],
        },
      }),
    ).qualidade_combustivel;
    await render(<SecaoQualidade qualidade={umSo} />);
    expect(screen.queryByText(/posto não conforme/i)).toBeNull();
    expect(screen.getAllByText("não conforme").length).toBe(1);
  });
});

describe("aba Preços", () => {
  it("mostra o preço com as casas da fonte, a semana e a cobertura da média", async () => {
    const contexto = paraContextoRegional(contextoDoFio());
    await render(<SecaoPrecos contexto={contexto} carregando={false} erro={null} fatos={[]} />);
    expect(screen.getByText(/R\$ 5,89/)).toBeTruthy();
    expect(screen.getByText("ANP · preços · semana de 01/11 a 07/11/2026")).toBeTruthy();
    expect(screen.getByText("R$ 5,9412")).toBeTruthy();
    expect(screen.getByText("212 postos na semana")).toBeTruthy();
  });

  it("média com poucos postos é marcada como apenas indicativa", async () => {
    const fio = contextoDoFio();
    fio.itens[0]!.medias = [{ escopo: "municipio", nome: "CIDADE PEQUENA", uf: "SP", media: 6.1, amostras: 2 }];
    await render(<SecaoPrecos contexto={paraContextoRegional(fio)} carregando={false} erro={null} fatos={[]} />);
    expect(screen.getByText(MENSAGENS.precos.amostraPequena(2))).toBeTruthy();
  });

  it("sem preço observado: ausência explicada, nunca R$ 0", async () => {
    const contexto = paraContextoRegional(contextoDoFio({ itens: [] }));
    await render(<SecaoPrecos contexto={contexto} carregando={false} erro={null} fatos={[]} />);
    expect(screen.getByText(MENSAGENS.precos.semPreco.etiqueta)).toBeTruthy();
    expect(screen.queryByText(/R\$ 0/)).toBeNull();
  });

  it("não há rótulo de mais barato, mais caro ou recomendação", async () => {
    const contexto = paraContextoRegional(contextoDoFio());
    await render(<SecaoPrecos contexto={contexto} carregando={false} erro={null} fatos={[]} />);
    expect(screen.queryByText(/mais barato|mais caro|recomendad|melhor preço/i)).toBeNull();
  });
});
