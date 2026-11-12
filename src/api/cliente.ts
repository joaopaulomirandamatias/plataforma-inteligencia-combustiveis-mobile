/**
 * Cliente HTTP da API pública da plataforma.
 *
 * O app é um canal de entrega: não fala com banco, não tem regra de negócio e
 * só chama operações com `x-estado: implemented` no `openapi.yaml`. A lista
 * abaixo É a allowlist — operação `planned` ou `restricted` não tem função
 * aqui, e a ausência é deliberada.
 *
 * Hoje a API é anônima: nenhuma credencial é enviada.
 */
import {
  paraContextoRegional,
  paraMapaPostos,
  paraPaginaPostos,
  paraPosto,
  paraSaude,
  RespostaForaDoContrato,
} from "@/api/borda";
import type { ContextoRegional, MapaPostos, PaginaPostos, Posto, Problema, Saude } from "@/api/tipos";

const ORIGEM_PADRAO = "https://pic-api-production.up.railway.app";
const TEMPO_LIMITE_MS = 10_000;

export function origemDaApi(): string {
  const configurada = process.env.EXPO_PUBLIC_PIC_API_URL?.trim().replace(/\/+$/, "");
  return configurada || ORIGEM_PADRAO;
}

export type MotivoFalha = "sem_conexao" | "tempo_esgotado" | "nao_encontrado" | "recusada" | "indisponivel";

/**
 * Toda falha de consulta chega às telas nesta forma. `motivo` decide a
 * mensagem; `codigo` é o código de domínio da API (ex.: `busca_curta`).
 */
export class FalhaDeConsulta extends Error {
  constructor(
    public readonly motivo: MotivoFalha,
    public readonly status: number | null = null,
    public readonly codigo: string | null = null,
  ) {
    super(`Consulta falhou: ${motivo}${codigo ? ` (${codigo})` : ""}`);
    this.name = "FalhaDeConsulta";
  }
}

type Parametros = Record<string, string | number | null | undefined>;

export function montarUrl(caminho: string, parametros: Parametros = {}): string {
  const consulta = Object.entries(parametros)
    .filter((par): par is [string, string | number] => par[1] !== null && par[1] !== undefined && par[1] !== "")
    .map(([chave, valor]) => `${encodeURIComponent(chave)}=${encodeURIComponent(String(valor))}`)
    .join("&");
  return `${origemDaApi()}${caminho}${consulta ? `?${consulta}` : ""}`;
}

async function obter(caminho: string, parametros?: Parametros, sinal?: AbortSignal): Promise<unknown> {
  const controle = new AbortController();
  let esgotou = false;
  const relogio = setTimeout(() => {
    esgotou = true;
    controle.abort();
  }, TEMPO_LIMITE_MS);
  const aoCancelar = () => controle.abort();
  sinal?.addEventListener("abort", aoCancelar);

  let resposta: Response;
  try {
    resposta = await fetch(montarUrl(caminho, parametros), {
      headers: { Accept: "application/json" },
      signal: controle.signal,
    });
  } catch {
    throw new FalhaDeConsulta(esgotou ? "tempo_esgotado" : "sem_conexao");
  } finally {
    clearTimeout(relogio);
    sinal?.removeEventListener("abort", aoCancelar);
  }

  if (!resposta.ok) {
    let problema: Problema = {};
    try {
      problema = (await resposta.json()) as Problema;
    } catch {
      // corpo ausente ou não-JSON: o status já basta para classificar.
    }
    const codigo = typeof problema.codigo === "string" ? problema.codigo : null;
    if (resposta.status === 404) throw new FalhaDeConsulta("nao_encontrado", 404, codigo);
    if (resposta.status === 400 || resposta.status === 422) {
      throw new FalhaDeConsulta("recusada", resposta.status, codigo);
    }
    throw new FalhaDeConsulta("indisponivel", resposta.status, codigo);
  }

  try {
    return await resposta.json();
  } catch {
    throw new FalhaDeConsulta("indisponivel", resposta.status);
  }
}

/** Aplica a borda; resposta fora do contrato vira indisponibilidade honesta. */
function naBorda<T>(converter: (bruto: unknown) => T, bruto: unknown): T {
  try {
    return converter(bruto);
  } catch (erro) {
    if (erro instanceof RespostaForaDoContrato) throw new FalhaDeConsulta("indisponivel", 200, "fora_do_contrato");
    throw erro;
  }
}

export interface FiltroPostos {
  q?: string;
  uf?: string;
  municipio?: string;
  cursor?: string | null;
  limite?: number;
}

export const BUSCA_MINIMA = 3;

export const api = {
  /** `GET /saude` — frescor das fontes. */
  async saude(sinal?: AbortSignal): Promise<Saude> {
    return naBorda(paraSaude, await obter("/saude", undefined, sinal));
  },

  /** `GET /v1/postos` — coleção com cursor keyset opaco. */
  async postos(filtro: FiltroPostos, sinal?: AbortSignal): Promise<PaginaPostos> {
    const bruto = await obter(
      "/v1/postos",
      { q: filtro.q, uf: filtro.uf, municipio: filtro.municipio, cursor: filtro.cursor, limit: filtro.limite ?? 30 },
      sinal,
    );
    return naBorda(paraPaginaPostos, bruto);
  },

  /** `GET /v1/postos/{posto_id}` — ficha as-of. */
  async posto(postoId: string, asOf?: string | null, sinal?: AbortSignal): Promise<Posto> {
    return naBorda(paraPosto, await obter(`/v1/postos/${encodeURIComponent(postoId)}`, { as_of: asOf }, sinal));
  },

  /** `GET /v1/postos/{posto_id}/contexto-regional`. */
  async contextoRegional(postoId: string, asOf?: string | null, sinal?: AbortSignal): Promise<ContextoRegional> {
    const bruto = await obter(
      `/v1/postos/${encodeURIComponent(postoId)}/contexto-regional`,
      { as_of: asOf },
      sinal,
    );
    return naBorda(paraContextoRegional, bruto);
  },

  /** `GET /v1/postos/mapa` no modo raio — a distância é calculada pelo servidor. */
  async postosProximos(
    centro: { latitude: number; longitude: number },
    raioMetros: number,
    sinal?: AbortSignal,
  ): Promise<MapaPostos> {
    const bruto = await obter(
      "/v1/postos/mapa",
      { lat: centro.latitude, lon: centro.longitude, raio_m: raioMetros, limit: 200 },
      sinal,
    );
    return naBorda(paraMapaPostos, bruto);
  },
};
