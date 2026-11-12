import { StyleSheet, View } from "react-native";

import { FalhaDeConsulta } from "@/api/cliente";
import type { ContextoRegional, Fato, ItemContextoRegional, MediaRegional } from "@/api/tipos";
import { dataBr, nomeFonte, nomeProduto, nomeProprio, precoBr, semanaBr, unidadeCurta } from "@/lib/formato";
import { MENSAGENS, mensagemDeFalha } from "@/lib/mensagens";
import { cores, fontes } from "@/tema/tokens";
import { Carregando } from "@/ui/Estados";
import { Etiqueta } from "@/ui/Etiqueta";
import { Aviso, CabecalhoSecao, Cartao, Divisor } from "@/ui/Superficies";
import { Texto } from "@/ui/Texto";

/**
 * Piso de cobertura para a média ser lida como referência firme. Mesmo valor
 * do portal (`COBERTURA_MINIMA` em `web/src/lib/regiao.ts`); enquanto a API não
 * devolver esse juízo pronto (item do roadmap), os dois andam juntos.
 */
const AMOSTRA_PEQUENA = 5;

function LinhaMedia({ media }: { media: MediaRegional }) {
  const onde = media.escopo === "municipio" ? `Média em ${nomeProprio(media.nome)}` : `Média no estado (${media.uf})`;
  const cobertura = `${media.amostras} ${media.amostras === 1 ? "posto" : "postos"} na semana`;
  return (
    <View style={estilos.media} accessible accessibilityLabel={`${onde}: ${precoBr(media.media)}, com base em ${cobertura}`}>
      <View style={{ flex: 1 }}>
        <Texto variante="corpo" style={{ fontSize: 14 }}>
          {onde}
        </Texto>
        <Texto variante="pequeno" cor={cores.tintaSuave} style={{ fontSize: 12 }}>
          {cobertura}
        </Texto>
      </View>
      <Texto variante="mono" style={{ fontFamily: fontes.monoForte }}>
        {precoBr(media.media)}
      </Texto>
    </View>
  );
}

function CartaoPreco({ item }: { item: ItemContextoRegional }) {
  const menorAmostra = item.medias.reduce((menor, media) => Math.min(menor, media.amostras), Infinity);
  return (
    <Cartao>
      <View style={estilos.topoPreco}>
        <View style={{ flex: 1 }}>
          <Texto variante="destaque" accessibilityRole="header">
            {nomeProduto(item.produto)}
          </Texto>
          <Texto variante="fonte">
            {nomeFonte(item.fonte)} · {semanaBr(item.semana_inicio, item.semana_fim)}
          </Texto>
        </View>
        <Texto variante="numero" accessibilityLabel={`${precoBr(item.preco_posto)} ${item.unidade ?? ""}`}>
          {precoBr(item.preco_posto)}
          <Texto variante="pequeno" cor={cores.tintaSuave}>
            {" "}
            {unidadeCurta(item.unidade)}
          </Texto>
        </Texto>
      </View>
      {item.medias.length > 0 ? (
        <>
          <Divisor />
          <View style={{ gap: 8 }}>
            {item.medias.map((media) => (
              <LinhaMedia key={media.escopo} media={media} />
            ))}
          </View>
          {menorAmostra < AMOSTRA_PEQUENA ? (
            <Texto variante="pequeno" cor={cores.tintaSuave}>
              {MENSAGENS.precos.amostraPequena(menorAmostra)}
            </Texto>
          ) : null}
        </>
      ) : null}
    </Cartao>
  );
}

export function SecaoPrecos({
  contexto,
  carregando,
  erro,
  fatos,
}: {
  contexto: ContextoRegional | undefined;
  carregando: boolean;
  erro: unknown;
  /** Fatos `preco` do histórico da ficha: texto factual vindo da API. */
  fatos: Fato[];
}) {
  const precosAnteriores = fatos.filter((fato) => fato.tipo === "preco");

  return (
    <View style={{ gap: 12 }}>
      <CabecalhoSecao titulo="Preços observados na pesquisa" etiqueta="ANP · preços" />
      <Texto variante="pequeno" cor={cores.tintaSuave}>
        {MENSAGENS.precos.explicacao}
      </Texto>

      {contexto === undefined && carregando ? <Carregando mensagem={MENSAGENS.carregando} /> : null}

      {contexto === undefined && !carregando && erro ? (
        <Aviso>
          {mensagemDeFalha(erro instanceof FalhaDeConsulta ? erro.motivo : "indisponivel").corpo}
        </Aviso>
      ) : null}

      {contexto?.itens.map((item) => <CartaoPreco key={item.produto} item={item} />)}

      {contexto && contexto.itens.length === 0 ? (
        <Cartao tipo="vazio">
          <Etiqueta tipo="vazia">{MENSAGENS.precos.semPreco.etiqueta}</Etiqueta>
          <Texto variante="corpo" style={{ fontSize: 14 }}>
            {MENSAGENS.precos.semPreco.corpo}
          </Texto>
        </Cartao>
      ) : null}

      {contexto && contexto.itens.length > 0 ? <Aviso>{MENSAGENS.precos.avisoRegional}</Aviso> : null}

      {precosAnteriores.length > 0 ? (
        <View style={{ gap: 8 }}>
          <Texto variante="rotulo" accessibilityRole="header">
            Observações registradas no histórico
          </Texto>
          <Cartao style={{ paddingVertical: 4, gap: 0 }}>
            {precosAnteriores.map((fato, indice) => (
              <View
                key={`${fato.data_validade}-${indice}`}
                style={[estilos.fato, indice > 0 ? { borderTopWidth: 1, borderTopColor: cores.linha } : null]}
              >
                <Texto variante="corpo" style={{ fontSize: 14 }}>
                  {fato.descricao}
                </Texto>
                <Texto variante="fonte">
                  {nomeFonte(fato.fonte)} · {dataBr(fato.data_validade)}
                </Texto>
              </View>
            ))}
          </Cartao>
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  topoPreco: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  media: { flexDirection: "row", alignItems: "center", gap: 8 },
  fato: { paddingVertical: 10, gap: 2 },
});
