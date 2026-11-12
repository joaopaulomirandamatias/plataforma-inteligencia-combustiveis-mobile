/**
 * Hooks de consulta: uma função por operação `implemented` da API.
 *
 * As chaves seguem `[recurso, ...parâmetros]`. A chave `CHAVE_PROXIMOS` é a
 * única que NÃO vai para o disco (ver `offline/consultas.ts`).
 */
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { api, BUSCA_MINIMA, type FiltroPostos } from "@/api/cliente";
import { CHAVE_PROXIMOS } from "@/offline/consultas";

export function useSaude() {
  return useQuery({
    queryKey: ["saude"],
    queryFn: ({ signal }) => api.saude(signal),
    staleTime: 30 * 60 * 1000,
  });
}

export type FiltroBusca = Pick<FiltroPostos, "q" | "uf" | "municipio">;

/** Busca só dispara com termo válido ou com recorte geográfico. */
export function buscaValida(filtro: FiltroBusca): boolean {
  const termo = filtro.q?.trim() ?? "";
  if (termo.length > 0) return termo.length >= BUSCA_MINIMA;
  return Boolean(filtro.uf);
}

export function usePostos(filtro: FiltroBusca) {
  const q = filtro.q?.trim() || undefined;
  const uf = filtro.uf?.trim().toUpperCase() || undefined;
  const municipio = filtro.municipio?.trim() || undefined;
  return useInfiniteQuery({
    queryKey: ["postos", { q, uf, municipio }],
    queryFn: ({ pageParam, signal }) => api.postos({ q, uf, municipio, cursor: pageParam }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (ultima) => ultima.proximo_cursor,
    enabled: buscaValida({ q, uf, municipio }),
  });
}

export function usePosto(postoId: string | undefined, asOf?: string | null) {
  return useQuery({
    queryKey: ["posto", postoId, asOf ?? null],
    queryFn: ({ signal }) => api.posto(postoId as string, asOf, signal),
    enabled: Boolean(postoId),
  });
}

export function useContextoRegional(postoId: string | undefined, asOf?: string | null) {
  return useQuery({
    queryKey: ["contexto-regional", postoId, asOf ?? null],
    queryFn: ({ signal }) => api.contextoRegional(postoId as string, asOf, signal),
    enabled: Boolean(postoId),
  });
}

export interface Centro {
  latitude: number;
  longitude: number;
}

export function usePostosProximos(centro: Centro | null, raioMetros: number) {
  return useQuery({
    queryKey: [CHAVE_PROXIMOS, centro?.latitude, centro?.longitude, raioMetros],
    queryFn: ({ signal }) => api.postosProximos(centro as Centro, raioMetros, signal),
    enabled: centro !== null,
    // O contrato não declara a ordem dos itens no modo raio. A lista é
    // apresentada pela `distancia_m` que o SERVIDOR calculou — o app só ordena,
    // não mede. Ponto sem distância vai para o fim.
    select: (mapa) => ({
      ...mapa,
      itens: [...mapa.itens].sort(
        (a, b) => (a.distancia_m ?? Number.POSITIVE_INFINITY) - (b.distancia_m ?? Number.POSITIVE_INFINITY),
      ),
    }),
    // A coordenada não deve sobreviver à sessão: sem persistência (ver
    // `podeGravar`) e coletada da memória logo depois de sair da tela.
    gcTime: 60 * 1000,
  });
}
