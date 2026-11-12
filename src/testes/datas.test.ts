import { asOfDoDia, formatarDataBr, interpretarDataBr, mascararData, mesesAtras, mesmoDia } from "@/lib/datas";

describe("datas da visão histórica", () => {
  it("a máscara insere as barras e ignora o que não é dígito", () => {
    expect(mascararData("1")).toBe("1");
    expect(mascararData("1506")).toBe("15/06");
    expect(mascararData("15062026")).toBe("15/06/2026");
    expect(mascararData("15/06/2026999")).toBe("15/06/2026");
    expect(mascararData("ab1c5")).toBe("15");
  });

  it("aceita só data que existe no calendário", () => {
    expect(interpretarDataBr("15/06/2026")?.getDate()).toBe(15);
    expect(interpretarDataBr("29/02/2024")).not.toBeNull();
    expect(interpretarDataBr("29/02/2026")).toBeNull();
    expect(interpretarDataBr("31/04/2026")).toBeNull();
    expect(interpretarDataBr("00/01/2026")).toBeNull();
    expect(interpretarDataBr("15/13/2026")).toBeNull();
    expect(interpretarDataBr("15/06/26")).toBeNull();
    expect(interpretarDataBr("")).toBeNull();
  });

  it("ida e volta entre texto e data", () => {
    const data = interpretarDataBr("05/01/2026") as Date;
    expect(formatarDataBr(data)).toBe("05/01/2026");
  });

  it("o as_of é o fim do dia escolhido, em ISO com fuso explícito", () => {
    const dia = new Date(2026, 5, 15);
    const asOf = asOfDoDia(dia);
    expect(asOf).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    const instante = new Date(asOf);
    expect(mesmoDia(instante, dia)).toBe(true);
    expect([instante.getHours(), instante.getMinutes(), instante.getSeconds()]).toEqual([23, 59, 59]);
  });

  it("meses atrás não estoura o fim do mês", () => {
    expect(formatarDataBr(mesesAtras(1, new Date(2026, 2, 31)))).toBe("28/02/2026");
    expect(formatarDataBr(mesesAtras(1, new Date(2024, 2, 31)))).toBe("29/02/2024");
    expect(formatarDataBr(mesesAtras(6, new Date(2026, 10, 12)))).toBe("12/05/2026");
    expect(formatarDataBr(mesesAtras(12, new Date(2026, 0, 15)))).toBe("15/01/2025");
  });
});
