/**
 * Respostas de amostra NA FORMA DO FIO, montadas a partir do `openapi.yaml`.
 *
 * Elas carregam de propósito os campos de auditoria que a API devolve
 * (`localizador`, hashes, ids de evidência e de carga): é com eles presentes
 * que os testes de borda provam que nada disso atravessa para o app.
 *
 * Nomes, CNPJ e valores são fictícios.
 */

export const LOCALIZADOR = "pmqc-2026-05.csv@sha256:aaaabbbbccccdddd:42";
export const HASH = "a".repeat(64);

export function ensaioDoFio(sobrescrever: Record<string, unknown> = {}) {
  return {
    ensaio: "Massa específica a 20 °C",
    resultado: "748,2",
    unidade: "kg/m³",
    conforme: true,
    classificacao: "conforme",
    fonte: "F02",
    data_coleta: "2026-05-18",
    ...sobrescrever,
  };
}

export function agrupamentoDoFio(sobrescrever: Record<string, unknown> = {}) {
  return {
    data_coleta: "2026-05-18",
    produto: "GASOLINA C COMUM",
    grupo_produto: "GASOLINA",
    fonte: "F02",
    contagens: { conforme: 2, nao_conforme: 1, nao_classificado: 1 },
    ensaios: [
      ensaioDoFio(),
      ensaioDoFio({ ensaio: "Destilação · 50% evaporado", resultado: "71,5", unidade: "°C" }),
      ensaioDoFio({ ensaio: "Teor de etanol anidro", resultado: "34", unidade: "% volume", conforme: false, classificacao: "não conforme" }),
      ensaioDoFio({ ensaio: "Aspecto", resultado: "Límpido", unidade: null, conforme: null, classificacao: "não classificado" }),
    ],
    ...sobrescrever,
  };
}

export function postoDoFio(sobrescrever: Record<string, unknown> = {}) {
  return {
    posto_id: "304d2b1e-e655-5f50-8db9-b8445179ce25",
    versao_snapshot: "cargas/F01:72,F02:74,F03:55",
    as_of: "2026-11-10T12:00:00Z",
    razao_social: "POSTO EXEMPLO AVENIDA LTDA",
    cnpj: "00000000000100",
    bandeira: "BANDEIRA BRANCA",
    endereco: "AVENIDA EXEMPLO, 1000",
    municipio: "SAO PAULO",
    uf: "SP",
    cadastro_desde: "2019-03-12T00:00:00Z",
    cargas: [
      { fonte: "F01", carga_id: 72, coletado_em: "2026-11-10T09:12:00Z" },
      { fonte: "F02", carga_id: 74, coletado_em: "2026-10-20T17:40:00Z" },
      { fonte: "F03", carga_id: 55, coletado_em: "2026-11-08T12:05:00Z" },
    ],
    fatos_recentes: [
      {
        tipo: "preco",
        data_validade: "2026-11-03",
        descricao: "Preço de GASOLINA COMUM pesquisado em 2026-11-03: 5,890 R$ / litro — fonte F03.",
        fonte: "F03",
        localizador: LOCALIZADOR,
      },
      {
        tipo: "cadastro",
        data_validade: "2026-11-10",
        descricao: "Cadastro de revendedor vigente conforme coleta em 2026-11-10 — fonte F01; bandeira registrada: BANDEIRA BRANCA.",
        fonte: "F01",
        localizador: LOCALIZADOR,
      },
    ],
    qualidade_combustivel: {
      identidade_agrupamento: "derivada",
      limite: 8,
      truncado: true,
      agrupamentos: [
        agrupamentoDoFio(),
        agrupamentoDoFio({
          data_coleta: "2025-09-02",
          produto: "ETANOL HIDRATADO",
          grupo_produto: "ETANOL",
          contagens: { conforme: 1, nao_conforme: 0, nao_classificado: 0 },
          ensaios: [ensaioDoFio({ ensaio: "Teor alcoólico", resultado: "93,1", unidade: "% massa", data_coleta: "2025-09-02" })],
        }),
      ],
    },
    ...sobrescrever,
  };
}

export function paginaDoFio(sobrescrever: Record<string, unknown> = {}) {
  return {
    itens: [
      { posto_id: "posto-1", razao_social: "POSTO EXEMPLO AVENIDA LTDA", bandeira: "BANDEIRA BRANCA", municipio: "SAO PAULO", uf: "SP" },
      { posto_id: "posto-2", razao_social: "REDE EXEMPLO NORTE COMBUSTIVEIS LTDA", bandeira: "BANDEIRA A", municipio: "SAO PAULO", uf: "SP" },
    ],
    proximo_cursor: "cursor-opaco",
    as_of: "2026-11-10T12:00:00Z",
    busca: "EXEMPLO",
    ...sobrescrever,
  };
}

export function contextoDoFio(sobrescrever: Record<string, unknown> = {}) {
  return {
    posto_id: "304d2b1e-e655-5f50-8db9-b8445179ce25",
    as_of: "2026-11-10T12:00:00Z",
    itens: [
      {
        produto: "GASOLINA COMUM",
        preco_posto: 5.89,
        unidade: "R$ / litro",
        semana_inicio: "2026-11-01",
        semana_fim: "2026-11-08",
        fonte: "F03",
        localizador: LOCALIZADOR,
        medias: [
          { escopo: "municipio", nome: "SAO PAULO", uf: "SP", media: 5.9412, amostras: 212 },
          { escopo: "uf", nome: "SP", uf: "SP", media: 5.9903, amostras: 3480 },
        ],
      },
    ],
    ...sobrescrever,
  };
}

export function mapaDoFio(sobrescrever: Record<string, unknown> = {}) {
  return {
    itens: [
      {
        evidencia_id: 9001,
        posto_id: "posto-1",
        razao_social: "POSTO EXEMPLO AVENIDA LTDA",
        bandeira: "BANDEIRA BRANCA",
        municipio: "SAO PAULO",
        uf: "SP",
        latitude: -23.55,
        longitude: -46.63,
        distancia_m: 348.7,
        provedor: "anp",
        versao_provedor: "2026-11",
        resultado_chave: null,
        resultado_sha256: HASH,
        coletado_em: "2026-11-10T09:12:00Z",
        fonte: "GEO-ANP",
        localizador: LOCALIZADOR,
      },
    ],
    truncado: false,
    modo: "raio",
    limite: 200,
    as_of: "2026-11-10T12:00:00Z",
    ...sobrescrever,
  };
}

export function saudeDoFio() {
  return {
    versao: "1.2.3",
    estado: "pronto",
    versao_snapshot: "cargas/F01:72,F02:74,F03:55",
    contagens: { cadastro: 48406, pmqc: 193043, preco: 150354, atendimento: 0 },
    cargas: [
      { fonte: "F01", carga_id: 72, coletado_em: "2026-11-10T09:12:00Z", cargas: 72, linhas_carregadas: 48406 },
      { fonte: "F03", carga_id: 55, coletado_em: "2026-11-08T12:05:00Z", cargas: 55, linhas_carregadas: 150354 },
    ],
    execucoes: [{ fonte: "F03", ultima_execucao: "2026-11-11T06:00:00Z", acao: "em dia" }],
  };
}

/** Termos que nunca podem aparecer em nada que o app carrega ou grava. */
export const VESTIGIOS_DE_AUDITORIA = [
  "localizador",
  "sha256",
  LOCALIZADOR,
  HASH,
  "evidencia_id",
  "carga_id",
  "provedor",
  "resultado_chave",
];
