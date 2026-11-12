import { api, FalhaDeConsulta, montarUrl, origemDaApi } from "@/api/cliente";
import { paginaDoFio, postoDoFio } from "@/testes/apoio";

const fetchOriginal = global.fetch;

function responder(status: number, corpo: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  }) as unknown as typeof fetch;
}

function urlChamada(): string {
  return (global.fetch as jest.Mock).mock.calls[0][0] as string;
}

afterEach(() => {
  global.fetch = fetchOriginal;
  delete process.env.EXPO_PUBLIC_PIC_API_URL;
});

describe("cliente da API pública", () => {
  it("usa a origem configurada e remove a barra final", () => {
    process.env.EXPO_PUBLIC_PIC_API_URL = "https://api.exemplo.test/";
    expect(origemDaApi()).toBe("https://api.exemplo.test");
  });

  it("monta a consulta sem parâmetros vazios e com codificação", () => {
    const url = montarUrl("/v1/postos", { q: "posto são joão", uf: "SP", municipio: "", cursor: null, limit: 30 });
    expect(url).toBe(`${origemDaApi()}/v1/postos?q=posto%20s%C3%A3o%20jo%C3%A3o&uf=SP&limit=30`);
  });

  it("só chama rotas implementadas no contrato", async () => {
    responder(200, paginaDoFio());
    await api.postos({ q: "exemplo", uf: "SP" });
    expect(urlChamada()).toContain("/v1/postos?q=exemplo&uf=SP");

    responder(200, postoDoFio());
    await api.posto("abc/123", "2026-06-15T00:00:00Z");
    expect(urlChamada()).toContain("/v1/postos/abc%2F123?as_of=2026-06-15T00%3A00%3A00Z");
  });

  it("postos próximos usa o modo raio, em que a distância vem do servidor", async () => {
    responder(200, { itens: [], truncado: false, modo: "raio", limite: 200, as_of: "2026-11-10T12:00:00Z" });
    await api.postosProximos({ latitude: -23.55, longitude: -46.63 }, 5000);
    expect(urlChamada()).toContain("/v1/postos/mapa?lat=-23.55&lon=-46.63&raio_m=5000");
    expect(urlChamada()).not.toContain("min_lat");
  });

  it("não envia credencial: a API pública é anônima", async () => {
    responder(200, paginaDoFio());
    await api.postos({ uf: "SP" });
    const opcoes = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    expect(Object.keys(opcoes.headers as Record<string, string>)).toEqual(["Accept"]);
  });

  it("404 vira 'não encontrado'", async () => {
    responder(404, { codigo: "posto_nao_encontrado" });
    await expect(api.posto("x")).rejects.toMatchObject({ motivo: "nao_encontrado", codigo: "posto_nao_encontrado" });
  });

  it("422 preserva o código de domínio (busca curta)", async () => {
    responder(422, { codigo: "busca_curta" });
    await expect(api.postos({ q: "ab" })).rejects.toMatchObject({ motivo: "recusada", status: 422, codigo: "busca_curta" });
  });

  it("5xx vira indisponibilidade", async () => {
    responder(503, {});
    await expect(api.saude()).rejects.toMatchObject({ motivo: "indisponivel", status: 503 });
  });

  it("falha de rede vira 'sem conexão'", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Network request failed")) as unknown as typeof fetch;
    await expect(api.saude()).rejects.toMatchObject({ motivo: "sem_conexao" });
  });

  it("resposta 200 fora do contrato vira indisponibilidade, não tela quebrada", async () => {
    responder(200, { posto_id: "sem-o-resto" });
    const erro = await api.posto("x").catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(FalhaDeConsulta);
    expect(erro).toMatchObject({ motivo: "indisponivel", codigo: "fora_do_contrato" });
  });
});
