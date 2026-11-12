import AsyncStorage from "@react-native-async-storage/async-storage";

import { criarLoja } from "@/armazenamento/loja";
import {
  alternarFavorito,
  apagarDadosDoUsuario,
  ehFavorito,
  lojaFavoritos,
  lojaRecentes,
  MAXIMO_DE_RECENTES,
  registrarVisita,
} from "@/armazenamento/usuario";
import { CHAVE_PROXIMOS, podeGravar } from "@/offline/consultas";
import { VESTIGIOS_DE_AUDITORIA } from "@/testes/apoio";

const posto = (n: number) => ({
  posto_id: `posto-${n}`,
  razao_social: `POSTO ${n}`,
  municipio: "SAO PAULO",
  uf: "SP",
});

beforeEach(async () => {
  await apagarDadosDoUsuario();
  await AsyncStorage.clear();
});

describe("loja persistida", () => {
  it("lê o que estava gravado e mescla sobre o valor inicial", async () => {
    await AsyncStorage.setItem("teste:mescla", JSON.stringify({ a: 2 }));
    const loja = criarLoja("teste:mescla", { a: 1, b: "novo" });
    await loja.pronta;
    expect(loja.ler()).toEqual({ a: 2, b: "novo" });
    expect(loja.foiCarregada()).toBe(true);
  });

  it("conteúdo ilegível não derruba o app: segue com o inicial", async () => {
    await AsyncStorage.setItem("teste:lixo", "{não é json");
    const loja = criarLoja("teste:lixo", { a: 1 });
    await loja.pronta;
    expect(loja.ler()).toEqual({ a: 1 });
  });

  it("grava a cada mudança e avisa quem assina", async () => {
    const loja = criarLoja("teste:grava", { n: 0 });
    await loja.pronta;
    const ouvinte = jest.fn();
    const cancelar = loja.assinar(ouvinte);
    loja.definir((atual) => ({ n: atual.n + 1 }));
    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect(JSON.parse((await AsyncStorage.getItem("teste:grava")) as string)).toEqual({ n: 1 });
    cancelar();
    loja.definir((atual) => ({ n: atual.n + 1 }));
    expect(ouvinte).toHaveBeenCalledTimes(1);
  });
});

describe("favoritos e recentes", () => {
  it("alterna favorito e guarda só a identificação mínima", () => {
    alternarFavorito({ ...posto(1), cnpj: "00000000000100", localizador: "x" } as never, new Date("2026-11-10T12:00:00Z"));
    const itens = lojaFavoritos.ler().itens;
    expect(ehFavorito(itens, "posto-1")).toBe(true);
    expect(Object.keys(itens[0] ?? {}).sort()).toEqual(["municipio", "posto_id", "quando", "razao_social", "uf"]);

    alternarFavorito(posto(1));
    expect(lojaFavoritos.ler().itens).toEqual([]);
  });

  it("recentes não repetem o posto e respeitam o limite", () => {
    for (let n = 1; n <= MAXIMO_DE_RECENTES + 2; n += 1) registrarVisita(posto(n));
    registrarVisita(posto(3));
    const ids = lojaRecentes.ler().itens.map((item) => item.posto_id);
    expect(ids).toHaveLength(MAXIMO_DE_RECENTES);
    expect(ids[0]).toBe("posto-3");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("o que vai para o disco não tem dado de auditoria", async () => {
    alternarFavorito(posto(1));
    registrarVisita(posto(2));
    const gravado = JSON.stringify(await AsyncStorage.multiGet(await AsyncStorage.getAllKeys()));
    for (const vestigio of VESTIGIOS_DE_AUDITORIA) expect(gravado).not.toContain(vestigio);
  });
});

describe("o que o cache offline pode gravar", () => {
  const consulta = (chave: unknown[], status: "success" | "error" | "pending") =>
    ({ queryKey: chave, state: { status } }) as unknown as Parameters<typeof podeGravar>[0];

  it("grava ficha e listas bem-sucedidas", () => {
    expect(podeGravar(consulta(["posto", "abc", null], "success"))).toBe(true);
    expect(podeGravar(consulta(["postos", { uf: "SP" }], "success"))).toBe(true);
  });

  it("erro nunca vira dado guardado", () => {
    expect(podeGravar(consulta(["posto", "abc", null], "error"))).toBe(false);
    expect(podeGravar(consulta(["posto", "abc", null], "pending"))).toBe(false);
  });

  it("postos próximos não vão para o disco: a chave contém a coordenada do usuário", () => {
    expect(podeGravar(consulta([CHAVE_PROXIMOS, -23.55, -46.63, 5000], "success"))).toBe(false);
  });
});
