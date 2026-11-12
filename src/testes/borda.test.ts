import {
  classificar,
  paraContextoRegional,
  paraMapaPostos,
  paraPaginaPostos,
  paraPosto,
  paraSaude,
  RespostaForaDoContrato,
} from "@/api/borda";
import {
  contextoDoFio,
  ensaioDoFio,
  agrupamentoDoFio,
  mapaDoFio,
  paginaDoFio,
  postoDoFio,
  saudeDoFio,
  VESTIGIOS_DE_AUDITORIA,
} from "@/testes/apoio";

function semVestigios(valor: unknown) {
  const serializado = JSON.stringify(valor);
  for (const vestigio of VESTIGIOS_DE_AUDITORIA) {
    expect(serializado).not.toContain(vestigio);
  }
}

describe("borda: o que vem do fio e o que o app carrega", () => {
  it("a amostra do fio contém os campos de auditoria (senão o teste não prova nada)", () => {
    expect(JSON.stringify(postoDoFio())).toContain("localizador");
    expect(JSON.stringify(mapaDoFio())).toContain("resultado_sha256");
  });

  it("ficha, contexto, mapa e saúde não carregam dado de auditoria", () => {
    semVestigios(paraPosto(postoDoFio()));
    semVestigios(paraContextoRegional(contextoDoFio()));
    semVestigios(paraMapaPostos(mapaDoFio()));
    semVestigios(paraSaude(saudeDoFio()));
  });

  it("campo novo que a API passe a expor não atravessa", () => {
    const posto = paraPosto(postoDoFio({ score_risco: 0.91, socios: [{ cpf: "000.000.000-00" }] }));
    expect(JSON.stringify(posto)).not.toContain("score_risco");
    expect(JSON.stringify(posto)).not.toContain("socios");
  });

  it("preserva os campos públicos da ficha", () => {
    const posto = paraPosto(postoDoFio());
    expect(posto.razao_social).toBe("POSTO EXEMPLO AVENIDA LTDA");
    expect(posto.cnpj).toBe("00000000000100");
    expect(posto.cargas).toEqual([
      { fonte: "F01", coletado_em: "2026-11-10T09:12:00Z" },
      { fonte: "F02", coletado_em: "2026-10-20T17:40:00Z" },
      { fonte: "F03", coletado_em: "2026-11-08T12:05:00Z" },
    ]);
    expect(posto.fatos_recentes).toHaveLength(2);
    expect(posto.qualidade_combustivel.truncado).toBe(true);
    expect(posto.qualidade_combustivel.agrupamentos).toHaveLength(2);
  });

  it("descarta fato de tipo sem contrato público", () => {
    const posto = paraPosto(
      postoDoFio({
        fatos_recentes: [{ tipo: "hipotese_interna", data_validade: "2026-01-01", descricao: "x", fonte: "X", localizador: "y" }],
      }),
    );
    expect(posto.fatos_recentes).toEqual([]);
  });

  it("campos opcionais ausentes viram null ou lista vazia, nunca undefined", () => {
    const posto = paraPosto({
      posto_id: "p",
      versao_snapshot: "v",
      as_of: "2026-11-10T12:00:00Z",
      qualidade_combustivel: { identidade_agrupamento: "derivada", limite: 8, truncado: false, agrupamentos: [] },
    });
    expect(posto.razao_social).toBeNull();
    expect(posto.bandeira).toBeNull();
    expect(posto.cargas).toEqual([]);
    expect(posto.fatos_recentes).toEqual([]);
  });

  describe("triestado do ensaio", () => {
    it("mapeamento fechado: true, false e null", () => {
      expect(classificar(true)).toBe("conforme");
      expect(classificar(false)).toBe("não conforme");
      expect(classificar(null)).toBe("não classificado");
    });

    it.each([0, "", undefined, "true", 1])("recusa %p em vez de coagir", (valor) => {
      expect(() => classificar(valor)).toThrow(RespostaForaDoContrato);
    });

    it("a classificação exibida deriva do triestado, não do texto recebido", () => {
      const fio = postoDoFio({
        qualidade_combustivel: {
          identidade_agrupamento: "derivada",
          limite: 8,
          truncado: false,
          agrupamentos: [agrupamentoDoFio({ ensaios: [ensaioDoFio({ conforme: false, classificacao: "conforme" })] })],
        },
      });
      const ensaio = paraPosto(fio).qualidade_combustivel.agrupamentos[0]?.ensaios[0];
      expect(ensaio?.classificacao).toBe("não conforme");
    });
  });

  it("resposta fora do contrato é recusada, não remendada", () => {
    expect(() => paraPosto({ posto_id: "p" })).toThrow(RespostaForaDoContrato);
    expect(() => paraPosto(null)).toThrow(RespostaForaDoContrato);
    expect(() => paraPaginaPostos({ itens: "x" })).toThrow(RespostaForaDoContrato);
    expect(() =>
      paraPosto(postoDoFio({ qualidade_combustivel: { identidade_agrupamento: "fisica", limite: 8, truncado: false, agrupamentos: [] } })),
    ).toThrow(RespostaForaDoContrato);
    expect(() => paraMapaPostos(mapaDoFio({ itens: [{ ...mapaDoFio().itens[0], fonte: "OUTRA" }] }))).toThrow(
      RespostaForaDoContrato,
    );
  });

  it("a coleção preserva o eco de busca, inclusive quando ausente", () => {
    expect(paraPaginaPostos(paginaDoFio()).busca).toBe("EXEMPLO");
    expect(paraPaginaPostos(paginaDoFio({ busca: null })).busca).toBeNull();
    expect(paraPaginaPostos(paginaDoFio({ proximo_cursor: null })).proximo_cursor).toBeNull();
  });

  it("o mapa mantém a origem da posição e a distância do servidor", () => {
    const ponto = paraMapaPostos(mapaDoFio()).itens[0];
    expect(ponto?.fonte).toBe("GEO-ANP");
    expect(ponto?.distancia_m).toBe(348.7);
  });
});
