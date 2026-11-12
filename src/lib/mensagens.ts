/**
 * Toda a cópia do app que não é rótulo de um controle específico.
 *
 * Centralizada pelo mesmo motivo do portal: texto fora do alcance do teste de
 * léxico é exatamente onde a política de linguagem vaza. `lexico.test.ts`
 * varre este arquivo inteiro.
 */
import type { MotivoFalha } from "@/api/cliente";

export const MENSAGENS = {
  carregando: "Consultando os dados públicos…",

  buscaCurta: (minimo: number) => `Digite ao menos ${minimo} caracteres do nome ou do CNPJ.`,
  buscaSemRecorte: "Digite um nome ou CNPJ, ou escolha ao menos o estado.",

  semResultados: {
    titulo: "Nenhum posto encontrado",
    corpo: "Confira a grafia do nome ou do CNPJ, ou tente buscar apenas por estado e cidade.",
    detalhe:
      "O cadastro usado é o de revendedores autorizados publicado pela ANP. Um posto que " +
      "não aparece aqui pode ter outro nome no cadastro.",
  },

  buscaNaoAplicada: {
    titulo: "Busca por nome indisponível agora",
    corpo:
      "A consulta não confirmou que pesquisou pelo termo digitado. Para não mostrar uma " +
      "lista sem relação com o que você escreveu, preferimos avisar. Tente de novo ou " +
      "busque por estado e cidade.",
  },

  indisponivel: {
    titulo: "Consulta indisponível no momento",
    corpo:
      "Não conseguimos consultar a base agora. Isso costuma ser temporário — tente " +
      "novamente em alguns minutos.",
  },

  semConexao: {
    titulo: "Sem conexão",
    corpo: "O aparelho está sem internet. As fichas dos seus favoritos continuam disponíveis.",
  },

  postoNaoEncontrado: {
    titulo: "Posto não encontrado",
    corpo:
      "Não há cadastro vigente para este endereço na relação de revendedores autorizados " +
      "da ANP. O link pode estar desatualizado, ou o cadastro pode ter deixado de constar " +
      "na publicação mais recente.",
  },

  copiaGuardada: (quando: string) => `Cópia salva em ${quando} · pode estar desatualizada`,

  semQualidade: {
    etiqueta: "Sem resultado público vinculado neste período",
    titulo: "Não há ensaios de qualidade publicados e ligados a este posto.",
    corpo:
      "Isso não significa que o posto foi aprovado nem que não houve coleta fora da " +
      "cobertura exibida.",
    motivos: [
      "O programa da ANP coleta amostras em parte dos postos a cada período.",
      "Uma coleta antiga pode estar ligada a outro CNPJ que operava no mesmo endereço.",
      "A publicação mais recente pode ainda não ter sido lida pela plataforma.",
    ],
  },

  avisoAmostragem:
    "O PMQC usa amostragem dirigida: estes resultados descrevem ensaios publicados e não " +
    "medem, sozinhos, a prevalência de problemas no estabelecimento. Um resultado conforme " +
    "não assegura a qualidade futura ou de todo o estoque.",

  avisoAgrupamento:
    "Cada grupo reúne ensaios publicados com a mesma data, produto e ponto de coleta. A " +
    "fonte não identifica a amostra física, então um grupo não prova que todos os ensaios " +
    "vieram da mesma amostra.",

  recorteTruncado: (limite: number) =>
    `Há grupos mais antigos fora desta ficha (limite de ${limite}).`,
  recorteCompleto: "Todos os grupos publicados e vinculados estão nesta ficha.",

  precos: {
    explicacao:
      "Valor visto pelo pesquisador da ANP no dia da coleta. Não é o preço de agora na bomba.",
    semPreco: {
      etiqueta: "Sem preço observado",
      corpo:
        "A pesquisa semanal da ANP cobre só parte dos postos. Não ter preço aqui não quer " +
        "dizer que o posto não vendeu: quer dizer que ele não foi pesquisado.",
    },
    avisoRegional:
      "A média da região é uma referência, não uma recomendação. Preços variam por " +
      "serviço, forma de pagamento e dia.",
    amostraPequena: (postos: number) =>
      `Média com base em ${postos} ${postos === 1 ? "posto" : "postos"}: comparação apenas indicativa.`,
  },

  semAtos: {
    titulo: "Sem dado público vinculado no período",
    detalhe: "Não significa ausência de fiscalização",
  },

  semHistorico:
    "Não há outros registros públicos nesta ficha. Ausência de registro não significa " +
    "ausência de atividade: as pesquisas da ANP têm cobertura parcial.",

  frescor:
    "“Lido pela plataforma” é quando soubemos do dado. A data do fato em si — coleta, " +
    "pesquisa ou publicação — aparece junto de cada informação, nas outras abas.",

  doPosto: {
    aviso:
      "Tudo nesta aba é informado pelo próprio posto. Não vem de órgão público e não é " +
      "verificado pela plataforma.",
    emBreve:
      "Horário, serviços, formas de pagamento e preço informado pelo posto aparecerão aqui " +
      "quando a publicação governada da plataforma de gestão estiver ligada à API pública.",
  },

  localizacao: {
    titulo: "Mostrar os postos perto de você?",
    corpo: "Sua localização serve só para centralizar o mapa e ordenar a lista por distância.",
    pontos: [
      "Usada apenas enquanto o app está aberto.",
      "Não é guardada nem ligada a uma conta.",
      "Você pode desligar quando quiser nos ajustes do aparelho.",
    ],
    antes: "Ao continuar, o aparelho pede a sua confirmação.",
    negada:
      "A localização está desligada para este app. Você pode ligar nos ajustes do aparelho " +
      "ou buscar por estado e cidade.",
    falhou: "Não foi possível obter a localização agora. Tente de novo ou busque por cidade.",
  },

  proximos: {
    truncado:
      "Há mais postos nesta área do que cabem na lista. Os mais próximos aparecem primeiro.",
    vazio: {
      titulo: "Nenhum posto com posição conhecida por perto",
      corpo:
        "Não há postos com coordenada disponível neste raio. Tente aumentar a distância ou " +
        "buscar por cidade.",
    },
    posicaoEstimada: "Posição estimada pelo endereço",
    posicaoAnp: "Posição publicada pela ANP",
  },

  favoritos: {
    vazio: {
      titulo: "Nenhum favorito ainda",
      corpo:
        "Toque na estrela de uma ficha para guardá-la aqui. Os favoritos ficam neste " +
        "aparelho e abrem mesmo sem internet.",
    },
    rodape: "Favoritos ficam só neste aparelho. Sem conta, nada é enviado.",
  },

  alertas: {
    explicacao:
      "Um alerta avisa que uma fonte publicou algo novo sobre um posto favorito. Ele não " +
      "indica problema.",
    emBreve: {
      titulo: "Avisos ainda não disponíveis",
      corpo:
        "Para avisar você, a plataforma precisa de um serviço de notificações que ainda " +
        "está em construção. Enquanto isso, as novidades aparecem ao abrir a ficha de um " +
        "favorito.",
    },
  },

  conta: {
    semConta: "Você está usando sem conta",
    semContaCorpo:
      "Consultar não exige cadastro. Quando existir, a conta servirá só para levar " +
      "favoritos e avisos para outro aparelho.",
    apagar: "Apagar favoritos, consultas recentes e fichas guardadas",
    apagado: "Dados deste aparelho apagados.",
  },

  naoFaz: [
    "Não dá nota, selo ou posição em ranking a nenhum posto.",
    "Não trata ausência de registro como aprovação.",
    "Não recebe reclamações. Para isso, use os canais oficiais.",
  ],

  boasVindas: {
    titulo: "O que os dados oficiais registram sobre o posto",
    pontos: [
      {
        titulo: "Fato, fonte e data",
        corpo: "Cada informação mostra de onde veio e quando foi registrada.",
      },
      {
        titulo: "Oficial e declarado, sempre separados",
        corpo: "O que um órgão publicou não se mistura com o que o posto informou.",
      },
      {
        titulo: "Sem nota e sem ranking",
        corpo: "O app não avalia nem classifica postos. A apuração é dos órgãos reguladores.",
      },
    ],
    rodape: "Não é preciso criar conta para consultar.",
  },
} as const;

/** Fontes exibidas em "Sobre os dados" — mesma redação da home do portal. */
export const FONTES_DO_APP = [
  { sigla: "ANP · cadastro", descricao: "Revendedores autorizados, razão social, CNPJ, bandeira e endereço.", status: "fonte oficial" },
  { sigla: "ANP · PMQC", descricao: "Amostras e ensaios do monitoramento da qualidade dos combustíveis.", status: "dados datados" },
  { sigla: "ANP · preços", descricao: "Valores observados na pesquisa semanal, quando houver coleta.", status: "cobertura parcial" },
  { sigla: "ANP · GEO", descricao: "Coordenadas publicadas para localizar os postos no mapa.", status: "origem visível" },
  { sigla: "Senacon · Sindec", descricao: "Atendimentos registrados pelos Procons, vinculados por CNPJ exato.", status: "contexto oficial" },
] as const;

export function mensagemDeFalha(motivo: MotivoFalha): { titulo: string; corpo: string } {
  if (motivo === "sem_conexao") return MENSAGENS.semConexao;
  if (motivo === "nao_encontrado") return MENSAGENS.postoNaoEncontrado;
  return MENSAGENS.indisponivel;
}

/** Todo texto deste arquivo, achatado — é o que o teste de léxico varre. */
export function todosOsTextos(): string[] {
  const saida: string[] = [];
  const visitar = (valor: unknown): void => {
    if (typeof valor === "string") saida.push(valor);
    else if (typeof valor === "function") saida.push(String((valor as (n: never) => string)(3 as never)));
    else if (Array.isArray(valor)) valor.forEach(visitar);
    else if (valor && typeof valor === "object") Object.values(valor).forEach(visitar);
  };
  visitar(MENSAGENS);
  visitar(FONTES_DO_APP);
  return saida;
}
