import {
  cnpjBr,
  dataBr,
  distanciaBr,
  nomeFonte,
  nomeProduto,
  nomeProprio,
  precoBr,
  semanaBr,
  unidadeCurta,
} from "@/lib/formato";

describe("formatação", () => {
  it("datas ISO viram dd/mm/aaaa sem passar por fuso", () => {
    expect(dataBr("2026-05-18")).toBe("18/05/2026");
    expect(dataBr("2019-03-12T00:00:00Z")).toBe("12/03/2019");
    expect(dataBr(null)).toBe("—");
    expect(dataBr("lixo")).toBe("—");
  });

  it("a semana ANP mostra o sábado, porque o fim é exclusivo", () => {
    expect(semanaBr("2026-11-01", "2026-11-08")).toBe("semana de 01/11 a 07/11/2026");
    expect(semanaBr("2026-12-27", "2027-01-03")).toBe("semana de 27/12 a 02/01/2027");
  });

  it("CNPJ com 14 dígitos é mascarado; o resto volta como veio", () => {
    expect(cnpjBr("00000000000100")).toBe("00.000.000/0001-00");
    expect(cnpjBr("123")).toBe("123");
    expect(cnpjBr(null)).toBe("—");
  });

  it("preço mantém as casas publicadas pela fonte, sem arredondar", () => {
    expect(precoBr(5.89)).toBe("R$ 5,89");
    expect(precoBr(6.199)).toBe("R$ 6,199");
    expect(precoBr(6)).toBe("R$ 6,00");
    expect(precoBr(5.9)).toBe("R$ 5,90");
  });

  it("preço ausente nunca vira zero", () => {
    expect(precoBr(null)).toBe("—");
    expect(precoBr(undefined)).toBe("—");
    expect(precoBr(Number.NaN)).toBe("—");
  });

  it("unidade e distância", () => {
    expect(unidadeCurta("R$ / litro")).toBe("/L");
    expect(unidadeCurta("R$ / m³")).toBe("/m³");
    expect(unidadeCurta(null)).toBe("");
    expect(distanciaBr(348.7)).toBe("350 m");
    expect(distanciaBr(2540)).toBe("2,5 km");
    expect(distanciaBr(null)).toBeNull();
  });

  it("nome próprio muda só a caixa", () => {
    expect(nomeProprio("POSTO EXEMPLO AVENIDA LTDA")).toBe("Posto Exemplo Avenida Ltda.");
    expect(nomeProprio("COMERCIO DE COMBUSTIVEIS DO NORTE S.A.")).toBe("Comercio de Combustiveis do Norte S.A.");
    expect(nomeProprio("SAO PAULO")).toBe("Sao Paulo");
    expect(nomeProprio(null)).toBe("");
  });

  it("produto usa a tabela de equivalências e degrada para caixa de nome", () => {
    expect(nomeProduto("GASOLINA C COMUM")).toBe("Gasolina comum");
    expect(nomeProduto("  oleo  diesel s10 ")).toBe("Diesel S10");
    expect(nomeProduto("GNV")).toBe("GNV");
    expect(nomeProduto("QUEROSENE ILUMINANTE")).toBe("Querosene Iluminante");
  });

  it("fonte desconhecida volta como veio", () => {
    expect(nomeFonte("F02")).toBe("ANP · PMQC");
    expect(nomeFonte("GEO-01")).toBe("Estimada pelo endereço");
    expect(nomeFonte("F99")).toBe("F99");
  });
});
