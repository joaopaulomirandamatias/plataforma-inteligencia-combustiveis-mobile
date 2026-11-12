/**
 * A borda: converte o que veio do fio no que o app pode carregar e GRAVAR.
 *
 * Lista de permissão, campo a campo. Campo novo que a API passe a expor não
 * atravessa para a tela nem para o cache em disco até alguém incluí-lo aqui
 * conscientemente (política de linguagem, decisão de 2026-08-08).
 *
 * Ficam do lado de fora, sempre: `localizador`, `resultado_sha256`,
 * `resultado_chave`, `evidencia_id`, `carga_id`, `provedor`,
 * `versao_provedor`. São dado de auditoria da plataforma, não do consumidor.
 *
 * A borda também valida o mínimo que as telas presumem. Resposta fora do
 * contrato vira `RespostaForaDoContrato` — melhor uma mensagem honesta de
 * indisponibilidade do que uma tela montada sobre `undefined`.
 */
import type {
  AgrupamentoPMQC,
  ClassificacaoPMQC,
  ContextoRegional,
  EnsaioPMQC,
  Fato,
  FonteGeo,
  ItemContextoRegional,
  MapaPostos,
  MediaRegional,
  PaginaPostos,
  PontoMapa,
  Posto,
  PostoResumo,
  QualidadeCombustivel,
  Saude,
  TipoFato,
} from "@/api/tipos";

export class RespostaForaDoContrato extends Error {
  constructor(onde: string) {
    super(`Resposta fora do contrato em ${onde}`);
    this.name = "RespostaForaDoContrato";
  }
}

type Bruto = Record<string, unknown>;

function objeto(valor: unknown, onde: string): Bruto {
  if (valor === null || typeof valor !== "object" || Array.isArray(valor)) {
    throw new RespostaForaDoContrato(onde);
  }
  return valor as Bruto;
}

function lista(valor: unknown, onde: string): unknown[] {
  if (!Array.isArray(valor)) throw new RespostaForaDoContrato(onde);
  return valor;
}

function texto(valor: unknown, onde: string): string {
  if (typeof valor !== "string") throw new RespostaForaDoContrato(onde);
  return valor;
}

function textoOuNulo(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() !== "" ? valor : null;
}

function numero(valor: unknown, onde: string): number {
  if (typeof valor !== "number" || !Number.isFinite(valor)) throw new RespostaForaDoContrato(onde);
  return valor;
}

function booleano(valor: unknown, onde: string): boolean {
  if (typeof valor !== "boolean") throw new RespostaForaDoContrato(onde);
  return valor;
}

const TIPOS_FATO: readonly TipoFato[] = ["cadastro", "pmqc", "preco", "atendimento", "autuacao", "aferição"];

function fato(bruto: unknown): Fato | null {
  const f = objeto(bruto, "fato");
  const tipo = f.tipo as TipoFato;
  // Tipo desconhecido é descartado, não exibido: a ficha só mostra fato cujo
  // tipo tem contrato público aprovado.
  if (!TIPOS_FATO.includes(tipo)) return null;
  return {
    tipo,
    data_validade: texto(f.data_validade, "fato.data_validade"),
    descricao: typeof f.descricao === "string" ? f.descricao : "",
    fonte: texto(f.fonte, "fato.fonte"),
  };
}

/**
 * Mapeamento FECHADO do triestado: `true` → conforme, `false` → não conforme,
 * `null` → não classificado. Qualquer outra coisa (0, "", undefined) é
 * resposta fora do contrato — nunca é coagida.
 */
export function classificar(conforme: unknown): ClassificacaoPMQC {
  if (conforme === true) return "conforme";
  if (conforme === false) return "não conforme";
  if (conforme === null) return "não classificado";
  throw new RespostaForaDoContrato("ensaio.conforme");
}

function ensaio(bruto: unknown): EnsaioPMQC {
  const e = objeto(bruto, "ensaio");
  const conforme = e.conforme as boolean | null;
  return {
    ensaio: texto(e.ensaio, "ensaio.ensaio"),
    resultado: textoOuNulo(e.resultado),
    unidade: textoOuNulo(e.unidade),
    conforme,
    // A classificação exibida deriva do triestado, não do texto recebido:
    // assim rótulo e contagem nunca divergem entre si.
    classificacao: classificar(conforme),
    fonte: texto(e.fonte, "ensaio.fonte"),
    data_coleta: texto(e.data_coleta, "ensaio.data_coleta"),
  };
}

function agrupamento(bruto: unknown): AgrupamentoPMQC {
  const a = objeto(bruto, "agrupamento");
  const c = objeto(a.contagens, "agrupamento.contagens");
  return {
    data_coleta: texto(a.data_coleta, "agrupamento.data_coleta"),
    produto: texto(a.produto, "agrupamento.produto"),
    grupo_produto: textoOuNulo(a.grupo_produto),
    fonte: texto(a.fonte, "agrupamento.fonte"),
    contagens: {
      conforme: numero(c.conforme, "contagens.conforme"),
      nao_conforme: numero(c.nao_conforme, "contagens.nao_conforme"),
      nao_classificado: numero(c.nao_classificado, "contagens.nao_classificado"),
    },
    ensaios: lista(a.ensaios, "agrupamento.ensaios").map(ensaio),
  };
}

function qualidade(bruto: unknown): QualidadeCombustivel {
  const q = objeto(bruto, "qualidade_combustivel");
  if (q.identidade_agrupamento !== "derivada") {
    throw new RespostaForaDoContrato("qualidade_combustivel.identidade_agrupamento");
  }
  return {
    identidade_agrupamento: "derivada",
    limite: numero(q.limite, "qualidade_combustivel.limite"),
    truncado: booleano(q.truncado, "qualidade_combustivel.truncado"),
    agrupamentos: lista(q.agrupamentos, "qualidade_combustivel.agrupamentos").map(agrupamento),
  };
}

export function paraPosto(bruto: unknown): Posto {
  const p = objeto(bruto, "posto");
  return {
    posto_id: texto(p.posto_id, "posto.posto_id"),
    versao_snapshot: texto(p.versao_snapshot, "posto.versao_snapshot"),
    as_of: texto(p.as_of, "posto.as_of"),
    razao_social: textoOuNulo(p.razao_social),
    cnpj: textoOuNulo(p.cnpj),
    bandeira: textoOuNulo(p.bandeira),
    endereco: textoOuNulo(p.endereco),
    municipio: textoOuNulo(p.municipio),
    uf: textoOuNulo(p.uf),
    cadastro_desde: textoOuNulo(p.cadastro_desde),
    cargas: (Array.isArray(p.cargas) ? p.cargas : []).map((bruta) => {
      const c = objeto(bruta, "posto.cargas");
      return { fonte: texto(c.fonte, "carga.fonte"), coletado_em: texto(c.coletado_em, "carga.coletado_em") };
    }),
    fatos_recentes: (Array.isArray(p.fatos_recentes) ? p.fatos_recentes : [])
      .map(fato)
      .filter((f): f is Fato => f !== null),
    qualidade_combustivel: qualidade(p.qualidade_combustivel),
  };
}

function resumo(bruto: unknown): PostoResumo {
  const r = objeto(bruto, "posto_resumo");
  return {
    posto_id: texto(r.posto_id, "posto_resumo.posto_id"),
    razao_social: textoOuNulo(r.razao_social),
    bandeira: textoOuNulo(r.bandeira),
    municipio: textoOuNulo(r.municipio),
    uf: textoOuNulo(r.uf),
  };
}

export function paraPaginaPostos(bruto: unknown): PaginaPostos {
  const p = objeto(bruto, "pagina_postos");
  return {
    itens: lista(p.itens, "pagina_postos.itens").map(resumo),
    proximo_cursor: textoOuNulo(p.proximo_cursor),
    as_of: texto(p.as_of, "pagina_postos.as_of"),
    busca: textoOuNulo(p.busca),
  };
}

function media(bruto: unknown): MediaRegional {
  const m = objeto(bruto, "media");
  const escopo = m.escopo === "uf" ? "uf" : m.escopo === "municipio" ? "municipio" : null;
  if (!escopo) throw new RespostaForaDoContrato("media.escopo");
  return {
    escopo,
    nome: texto(m.nome, "media.nome"),
    uf: texto(m.uf, "media.uf"),
    media: numero(m.media, "media.media"),
    amostras: numero(m.amostras, "media.amostras"),
  };
}

function itemContexto(bruto: unknown): ItemContextoRegional {
  const i = objeto(bruto, "contexto.item");
  return {
    produto: texto(i.produto, "contexto.produto"),
    preco_posto: numero(i.preco_posto, "contexto.preco_posto"),
    unidade: textoOuNulo(i.unidade),
    semana_inicio: texto(i.semana_inicio, "contexto.semana_inicio"),
    semana_fim: texto(i.semana_fim, "contexto.semana_fim"),
    fonte: texto(i.fonte, "contexto.fonte"),
    medias: lista(i.medias, "contexto.medias").map(media),
  };
}

export function paraContextoRegional(bruto: unknown): ContextoRegional {
  const c = objeto(bruto, "contexto");
  return {
    posto_id: texto(c.posto_id, "contexto.posto_id"),
    as_of: texto(c.as_of, "contexto.as_of"),
    itens: lista(c.itens, "contexto.itens").map(itemContexto),
  };
}

function ponto(bruto: unknown): PontoMapa {
  const p = objeto(bruto, "ponto");
  const fonte = p.fonte as FonteGeo;
  if (fonte !== "GEO-ANP" && fonte !== "GEO-01") throw new RespostaForaDoContrato("ponto.fonte");
  return {
    posto_id: texto(p.posto_id, "ponto.posto_id"),
    razao_social: textoOuNulo(p.razao_social),
    bandeira: textoOuNulo(p.bandeira),
    municipio: textoOuNulo(p.municipio),
    uf: textoOuNulo(p.uf),
    latitude: numero(p.latitude, "ponto.latitude"),
    longitude: numero(p.longitude, "ponto.longitude"),
    distancia_m: typeof p.distancia_m === "number" ? p.distancia_m : null,
    fonte,
    coletado_em: texto(p.coletado_em, "ponto.coletado_em"),
  };
}

export function paraMapaPostos(bruto: unknown): MapaPostos {
  const m = objeto(bruto, "mapa");
  return {
    itens: lista(m.itens, "mapa.itens").map(ponto),
    truncado: booleano(m.truncado, "mapa.truncado"),
    modo: m.modo === "raio" ? "raio" : "bbox",
    limite: numero(m.limite, "mapa.limite"),
    as_of: texto(m.as_of, "mapa.as_of"),
  };
}

export function paraSaude(bruto: unknown): Saude {
  const s = objeto(bruto, "saude");
  return {
    estado: texto(s.estado, "saude.estado"),
    versao_snapshot: texto(s.versao_snapshot, "saude.versao_snapshot"),
    cargas: lista(s.cargas, "saude.cargas").map((bruta) => {
      const c = objeto(bruta, "saude.carga");
      return { fonte: texto(c.fonte, "carga.fonte"), coletado_em: texto(c.coletado_em, "carga.coletado_em") };
    }),
    execucoes: (Array.isArray(s.execucoes) ? s.execucoes : []).map((bruta) => {
      const e = objeto(bruta, "saude.execucao");
      return {
        fonte: texto(e.fonte, "execucao.fonte"),
        ultima_execucao: texto(e.ultima_execucao, "execucao.ultima_execucao"),
        acao: texto(e.acao, "execucao.acao"),
      };
    }),
  };
}
