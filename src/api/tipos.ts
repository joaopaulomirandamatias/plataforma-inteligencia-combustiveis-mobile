/**
 * O que o app carrega — NÃO o que a API devolve.
 *
 * A forma do fio é `unknown`: só existe dentro de `borda.ts`, que a converte
 * nestes tipos. O que está aqui é o que pode entrar na árvore de componentes
 * e — ponto que só existe no app — no CACHE OFFLINE em disco.
 *
 * A separação é a mesma defesa do portal (política de linguagem, "entrada
 * tolerante, saída restrita"): `localizador`, hashes e ids de evidência são
 * dado de auditoria. No app o risco não é o payload de hidratação, é o
 * AsyncStorage: o que entra no cache fica gravado no aparelho. Por isso a
 * borda (`borda.ts`) é uma lista de permissão campo a campo, e o cache só
 * recebe o que passou por ela.
 */

export type TipoFato = "cadastro" | "pmqc" | "preco" | "atendimento" | "autuacao" | "aferição";

export interface Fato {
  tipo: TipoFato;
  data_validade: string;
  descricao: string;
  fonte: string;
}

export type ClassificacaoPMQC = "conforme" | "não conforme" | "não classificado";

export interface ContagensPMQC {
  conforme: number;
  nao_conforme: number;
  nao_classificado: number;
}

export interface EnsaioPMQC {
  ensaio: string;
  resultado: string | null;
  unidade: string | null;
  /** Triestado da fonte. Coerção por truthy/falsy é proibida. */
  conforme: boolean | null;
  classificacao: ClassificacaoPMQC;
  fonte: string;
  data_coleta: string;
}

export interface AgrupamentoPMQC {
  data_coleta: string;
  produto: string;
  grupo_produto: string | null;
  fonte: string;
  contagens: ContagensPMQC;
  ensaios: EnsaioPMQC[];
}

export interface QualidadeCombustivel {
  identidade_agrupamento: "derivada";
  limite: number;
  truncado: boolean;
  agrupamentos: AgrupamentoPMQC[];
}

export interface CargaFonte {
  fonte: string;
  coletado_em: string;
}

export interface Posto {
  posto_id: string;
  versao_snapshot: string;
  as_of: string;
  razao_social: string | null;
  cnpj: string | null;
  bandeira: string | null;
  endereco: string | null;
  municipio: string | null;
  uf: string | null;
  cadastro_desde: string | null;
  cargas: CargaFonte[];
  fatos_recentes: Fato[];
  qualidade_combustivel: QualidadeCombustivel;
}

export interface PostoResumo {
  posto_id: string;
  razao_social: string | null;
  bandeira: string | null;
  municipio: string | null;
  uf: string | null;
}

export interface PaginaPostos {
  itens: PostoResumo[];
  proximo_cursor: string | null;
  as_of: string;
  /** Eco antifalha-silenciosa: `null` significa que NENHUMA busca textual foi aplicada. */
  busca: string | null;
}

export interface MediaRegional {
  escopo: "municipio" | "uf";
  nome: string;
  uf: string;
  media: number;
  /** Postos DISTINTOS por trás da média (cobertura), nunca linhas. */
  amostras: number;
}

export interface ItemContextoRegional {
  produto: string;
  preco_posto: number;
  unidade: string | null;
  semana_inicio: string;
  semana_fim: string;
  fonte: string;
  medias: MediaRegional[];
}

export interface ContextoRegional {
  posto_id: string;
  as_of: string;
  itens: ItemContextoRegional[];
}

export type FonteGeo = "GEO-ANP" | "GEO-01";

export interface PontoMapa {
  posto_id: string;
  razao_social: string | null;
  bandeira: string | null;
  municipio: string | null;
  uf: string | null;
  latitude: number;
  longitude: number;
  distancia_m: number | null;
  /** GEO-ANP = posição publicada pela ANP; GEO-01 = estimada pelo endereço. */
  fonte: FonteGeo;
  coletado_em: string;
}

export interface MapaPostos {
  itens: PontoMapa[];
  truncado: boolean;
  modo: "bbox" | "raio";
  limite: number;
  as_of: string;
}

export interface CargaSaude {
  fonte: string;
  coletado_em: string;
}

export interface ExecucaoSaude {
  fonte: string;
  ultima_execucao: string;
  acao: string;
}

export interface Saude {
  estado: string;
  versao_snapshot: string;
  cargas: CargaSaude[];
  execucoes: ExecucaoSaude[];
}

/** Erro RFC 9457 devolvido pela API. */
export interface Problema {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  codigo?: string;
  correlation_id?: string;
}
