import { paraPosto } from "@/api/borda";
import { contarEnsaios, resumirQualidade } from "@/lib/qualidade";
import { agrupamentoDoFio, postoDoFio } from "@/testes/apoio";

describe("indicadores factuais do recorte", () => {
  const qualidade = paraPosto(postoDoFio()).qualidade_combustivel;

  it("conta só o que está no payload exibido", () => {
    const resumo = resumirQualidade(qualidade);
    expect(resumo.agrupamentos).toBe(2);
    expect(resumo.ensaios).toBe(5);
    expect(resumo.produtos).toEqual(["Gasolina comum", "Etanol hidratado"]);
    expect(resumo.periodo).toEqual({ inicio: "2025-09-02", fim: "2026-05-18" });
    expect(resumo.truncado).toBe(true);
    expect(resumo.limite).toBe(8);
  });

  it("as três contagens somam o total de ensaios exibidos", () => {
    const { contagens, ensaios } = resumirQualidade(qualidade);
    expect(contagens).toEqual({ conforme: 3, nao_conforme: 1, nao_classificado: 1 });
    expect(contagens.conforme + contagens.nao_conforme + contagens.nao_classificado).toBe(ensaios);
  });

  it("reconta a partir dos ensaios, ignorando contagens agregadas divergentes", () => {
    const fio = postoDoFio({
      qualidade_combustivel: {
        identidade_agrupamento: "derivada",
        limite: 8,
        truncado: false,
        agrupamentos: [agrupamentoDoFio({ contagens: { conforme: 99, nao_conforme: 99, nao_classificado: 99 } })],
      },
    });
    const resumo = resumirQualidade(paraPosto(fio).qualidade_combustivel);
    expect(resumo.contagens).toEqual({ conforme: 2, nao_conforme: 1, nao_classificado: 1 });
  });

  it("recorte vazio não produz período nem vira zero por cento", () => {
    const resumo = resumirQualidade({ identidade_agrupamento: "derivada", limite: 8, truncado: false, agrupamentos: [] });
    expect(resumo.agrupamentos).toBe(0);
    expect(resumo.periodo).toBeNull();
    expect(Object.keys(resumo)).not.toContain("percentual");
  });

  it("null é não classificado, nunca não conforme", () => {
    const ensaios = qualidade.agrupamentos[0]?.ensaios ?? [];
    expect(contarEnsaios(ensaios.filter((e) => e.conforme === null))).toEqual({
      conforme: 0,
      nao_conforme: 0,
      nao_classificado: 1,
    });
  });
});
