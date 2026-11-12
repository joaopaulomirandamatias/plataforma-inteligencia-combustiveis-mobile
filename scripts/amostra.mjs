/**
 * Respostas de AMOSTRA para a prévia web, na forma do `openapi.yaml`.
 *
 * Servem para ver as telas quando a API real não é alcançável. Nomes, CNPJ,
 * valores e datas são fictícios — nada aqui é registro de posto real.
 */

const AGORA = "2026-11-10T12:00:00Z";

const ensaio = (o = {}) => ({
  ensaio: "Massa específica a 20 °C",
  resultado: "748,2",
  unidade: "kg/m³",
  conforme: true,
  classificacao: "conforme",
  fonte: "F02",
  data_coleta: "2026-05-18",
  ...o,
});

const POSTOS = [
  { posto_id: "amostra-avenida", razao_social: "POSTO EXEMPLO AVENIDA LTDA", bandeira: "BANDEIRA BRANCA", endereco: "AVENIDA EXEMPLO, 1000", municipio: "SAO PAULO", uf: "SP", lat: -23.552, lon: -46.634, geo: "GEO-ANP" },
  { posto_id: "amostra-sul", razao_social: "COMERCIO DE COMBUSTIVEIS EXEMPLO SUL LTDA", bandeira: "BANDEIRA A", endereco: "RUA DAS AMOSTRAS, 45", municipio: "SAO PAULO", uf: "SP", lat: -23.561, lon: -46.641, geo: "GEO-ANP" },
  { posto_id: "amostra-praca", razao_social: "POSTO MODELO DA PRACA LTDA", bandeira: null, endereco: "PRACA MODELO, 12", municipio: "SAO PAULO", uf: "SP", lat: -23.547, lon: -46.628, geo: "GEO-01" },
  { posto_id: "amostra-norte", razao_social: "REDE EXEMPLO NORTE COMBUSTIVEIS LTDA", bandeira: "BANDEIRA A", endereco: "AVENIDA DO MODELO, 3200", municipio: "SAO PAULO", uf: "SP", lat: -23.538, lon: -46.622, geo: "GEO-ANP" },
  { posto_id: "amostra-campinas", razao_social: "AUTO POSTO MODELO DO CENTRO LTDA", bandeira: "BANDEIRA B", endereco: "RUA MODELO, 250", municipio: "CAMPINAS", uf: "SP", lat: -22.905, lon: -47.06, geo: "GEO-ANP" },
  { posto_id: "amostra-rio", razao_social: "POSTO EXEMPLO DA ORLA LTDA", bandeira: "BANDEIRA B", endereco: "AVENIDA DA AMOSTRA, 800", municipio: "RIO DE JANEIRO", uf: "RJ", lat: -22.97, lon: -43.18, geo: "GEO-ANP" },
];

const QUALIDADE_CHEIA = {
  identidade_agrupamento: "derivada",
  limite: 8,
  truncado: true,
  agrupamentos: [
    {
      data_coleta: "2026-05-18",
      produto: "GASOLINA C COMUM",
      grupo_produto: "GASOLINA",
      fonte: "F02",
      contagens: { conforme: 3, nao_conforme: 1, nao_classificado: 1 },
      ensaios: [
        ensaio(),
        ensaio({ ensaio: "Teor de etanol anidro", resultado: "34", unidade: "% volume", conforme: false, classificacao: "não conforme" }),
        ensaio({ ensaio: "Destilação · 50% evaporado", resultado: "71,5", unidade: "°C" }),
        ensaio({ ensaio: "Destilação · ponto final", resultado: "198,0", unidade: "°C" }),
        ensaio({ ensaio: "Aspecto", resultado: "Límpido", unidade: null, conforme: null, classificacao: "não classificado" }),
      ],
    },
    {
      data_coleta: "2026-05-18",
      produto: "ETANOL HIDRATADO",
      grupo_produto: "ETANOL",
      fonte: "F02",
      contagens: { conforme: 3, nao_conforme: 0, nao_classificado: 0 },
      ensaios: [
        ensaio({ ensaio: "Teor alcoólico", resultado: "93,1", unidade: "% massa" }),
        ensaio({ ensaio: "Massa específica a 20 °C", resultado: "809,4", unidade: "kg/m³" }),
        ensaio({ ensaio: "Condutividade elétrica", resultado: "210", unidade: "µS/m" }),
      ],
    },
    {
      data_coleta: "2025-09-02",
      produto: "OLEO DIESEL S10",
      grupo_produto: "DIESEL",
      fonte: "F02",
      contagens: { conforme: 2, nao_conforme: 0, nao_classificado: 0 },
      ensaios: [
        ensaio({ ensaio: "Ponto de fulgor", resultado: "52,0", unidade: "°C", data_coleta: "2025-09-02" }),
        ensaio({ ensaio: "Teor de biodiesel", resultado: "14,8", unidade: "% volume", data_coleta: "2025-09-02" }),
      ],
    },
  ],
};

const QUALIDADE_VAZIA = { identidade_agrupamento: "derivada", limite: 8, truncado: false, agrupamentos: [] };

function ficha(posto, asOf) {
  const semDados = posto.posto_id === "amostra-praca";
  return {
    posto_id: posto.posto_id,
    versao_snapshot: "amostra/F01:1,F02:1,F03:1",
    as_of: asOf ?? AGORA,
    razao_social: posto.razao_social,
    cnpj: "00000000000100",
    bandeira: posto.bandeira ?? undefined,
    endereco: posto.endereco,
    municipio: posto.municipio,
    uf: posto.uf,
    cadastro_desde: "2019-03-12T00:00:00Z",
    cargas: [
      { fonte: "F01", carga_id: 1, coletado_em: "2026-11-10T09:12:00Z" },
      { fonte: "F02", carga_id: 1, coletado_em: "2026-10-20T17:40:00Z" },
      { fonte: "F03", carga_id: 1, coletado_em: "2026-11-08T12:05:00Z" },
    ],
    fatos_recentes: semDados
      ? []
      : [
          { tipo: "preco", data_validade: "2026-11-03", descricao: "Preço de GASOLINA COMUM pesquisado em 2026-11-03: 5,890 R$ / litro — fonte F03.", fonte: "F03", localizador: "amostra" },
          { tipo: "preco", data_validade: "2026-10-20", descricao: "Preço de GASOLINA COMUM pesquisado em 2026-10-20: 5,920 R$ / litro — fonte F03.", fonte: "F03", localizador: "amostra" },
          { tipo: "cadastro", data_validade: "2026-11-10", descricao: `Cadastro de revendedor vigente conforme coleta em 2026-11-10 — fonte F01; bandeira registrada: ${posto.bandeira ?? "não declarada"}.`, fonte: "F01", localizador: "amostra" },
        ],
    qualidade_combustivel: semDados ? QUALIDADE_VAZIA : QUALIDADE_CHEIA,
  };
}

function contexto(posto, asOf) {
  const semPreco = posto.posto_id === "amostra-praca" || posto.posto_id === "amostra-sul";
  return {
    posto_id: posto.posto_id,
    as_of: asOf ?? AGORA,
    itens: semPreco
      ? []
      : [
          {
            produto: "GASOLINA COMUM",
            preco_posto: 5.89,
            unidade: "R$ / litro",
            semana_inicio: "2026-11-01",
            semana_fim: "2026-11-08",
            fonte: "F03",
            localizador: "amostra",
            medias: [
              { escopo: "municipio", nome: posto.municipio, uf: posto.uf, media: 5.941, amostras: 212 },
              { escopo: "uf", nome: posto.uf, uf: posto.uf, media: 5.99, amostras: 3480 },
            ],
          },
          {
            produto: "ETANOL HIDRATADO",
            preco_posto: 3.79,
            unidade: "R$ / litro",
            semana_inicio: "2026-11-01",
            semana_fim: "2026-11-08",
            fonte: "F03",
            localizador: "amostra",
            medias: [{ escopo: "municipio", nome: posto.municipio, uf: posto.uf, media: 3.84, amostras: 3 }],
          },
        ],
  };
}

const semAcento = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

function distanciaMetros(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

/** Devolve `{ status, corpo }` para um caminho da API, ou `null` se não for rota conhecida. */
export function responderAmostra(caminho, parametros) {
  const asOf = parametros.get("as_of");

  if (caminho === "/saude") {
    return {
      status: 200,
      corpo: {
        versao: "amostra",
        estado: "pronto",
        versao_snapshot: "amostra/F01:1,F02:1,F03:1",
        contagens: { cadastro: POSTOS.length, pmqc: 10, preco: 4, atendimento: 0 },
        cargas: [
          { fonte: "F01", carga_id: 1, coletado_em: "2026-11-10T09:12:00Z", cargas: 1, linhas_carregadas: POSTOS.length },
          { fonte: "F02", carga_id: 1, coletado_em: "2026-10-20T17:40:00Z", cargas: 1, linhas_carregadas: 10 },
          { fonte: "F03", carga_id: 1, coletado_em: "2026-11-08T12:05:00Z", cargas: 1, linhas_carregadas: 4 },
        ],
        execucoes: [],
      },
    };
  }

  if (caminho === "/v1/postos") {
    const q = parametros.get("q");
    if (q && q.trim().length < 3) return { status: 422, corpo: { codigo: "busca_curta", status: 422 } };
    const uf = parametros.get("uf")?.toUpperCase();
    const municipio = parametros.get("municipio");
    const termo = q ? semAcento(q).replace(/[.\-/]/g, "") : null;
    const itens = POSTOS.filter(
      (p) =>
        (!uf || p.uf === uf) &&
        (!municipio || p.municipio === semAcento(municipio)) &&
        (!termo || semAcento(p.razao_social).includes(termo) || "00000000000100".includes(termo)),
    ).map(({ posto_id, razao_social, bandeira, municipio: m, uf: u }) => ({ posto_id, razao_social, bandeira: bandeira ?? undefined, municipio: m, uf: u }));
    return { status: 200, corpo: { itens, proximo_cursor: null, as_of: asOf ?? AGORA, busca: q ? semAcento(q) : null } };
  }

  if (caminho === "/v1/postos/mapa") {
    const lat = Number(parametros.get("lat"));
    const lon = Number(parametros.get("lon"));
    const raio = Number(parametros.get("raio_m"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !(raio > 0)) return { status: 422, corpo: { codigo: "filtro_geo_invalido", status: 422 } };
    // A amostra finge que os quatro postos de São Paulo estão perto de onde o usuário estiver.
    const centroDaAmostra = { lat: -23.55, lon: -46.633 };
    const itens = POSTOS.slice(0, 4)
      .map((p, i) => {
        const deslocado = { lat: lat + (p.lat - centroDaAmostra.lat), lon: lon + (p.lon - centroDaAmostra.lon) };
        return {
          evidencia_id: 9000 + i,
          posto_id: p.posto_id,
          razao_social: p.razao_social,
          bandeira: p.bandeira,
          municipio: p.municipio,
          uf: p.uf,
          latitude: deslocado.lat,
          longitude: deslocado.lon,
          distancia_m: distanciaMetros({ lat, lon }, deslocado),
          provedor: "amostra",
          versao_provedor: "1",
          resultado_chave: null,
          resultado_sha256: "a".repeat(64),
          coletado_em: "2026-11-10T09:12:00Z",
          fonte: p.geo,
          localizador: "amostra",
        };
      })
      .filter((ponto) => ponto.distancia_m <= raio);
    return { status: 200, corpo: { itens, truncado: false, modo: "raio", limite: 200, as_of: AGORA } };
  }

  const partes = /^\/v1\/postos\/([^/]+)(\/contexto-regional)?$/.exec(caminho);
  if (partes) {
    const posto = POSTOS.find((p) => p.posto_id === decodeURIComponent(partes[1]));
    // Antes de 2026 a base da amostra "ainda não existia": exercita o piso de transação.
    if (!posto || (asOf && asOf < "2026-01-01")) return { status: 404, corpo: { codigo: "posto_nao_encontrado", status: 404 } };
    return { status: 200, corpo: partes[2] ? contexto(posto, asOf) : ficha(posto, asOf) };
  }

  return null;
}
