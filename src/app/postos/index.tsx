import { router, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FalhaDeConsulta } from "@/api/cliente";
import { buscaValida, usePostos } from "@/api/consultas";
import { nomeProprio } from "@/lib/formato";
import { MENSAGENS, mensagemDeFalha } from "@/lib/mensagens";
import { cores } from "@/tema/tokens";
import { Botao } from "@/ui/Botao";
import { CartaoPosto } from "@/ui/CartaoPosto";
import { Carregando, EsqueletoLista, EstadoMensagem } from "@/ui/Estados";
import { BarraTopo, Tela } from "@/ui/Tela";
import { Texto } from "@/ui/Texto";

function parametro(valor: string | string[] | undefined): string {
  return (Array.isArray(valor) ? valor[0] : valor)?.trim() ?? "";
}

export default function Resultados() {
  const margens = useSafeAreaInsets();
  const bruto = useLocalSearchParams<{ q?: string; uf?: string; municipio?: string }>();
  const q = parametro(bruto.q);
  const uf = parametro(bruto.uf).toUpperCase();
  const municipio = parametro(bruto.municipio);

  const consulta = usePostos({ q, uf, municipio });
  const paginas = consulta.data?.pages ?? [];
  const postos = paginas.flatMap((pagina) => pagina.itens);

  const titulo = q ? `“${q}”` : [nomeProprio(municipio), uf].filter(Boolean).join(" · ") || "Postos";
  const subtitulo = q ? [nomeProprio(municipio), uf].filter(Boolean).join(" · ") || "Todo o país" : "Cadastro vigente na ANP";

  /**
   * Contrato antifalha-silenciosa: se pedimos busca textual e a API não ecoou
   * o termo em `busca`, a lista NÃO é resultado da busca. Mostrar a lista
   * inteira como se fosse seria a pior resposta possível.
   */
  const buscaNaoAplicada = q.length > 0 && paginas.length > 0 && paginas[0]?.busca === null;

  let conteudo;
  if (!buscaValida({ q, uf, municipio })) {
    conteudo = (
      <EstadoMensagem icone="busca" titulo="Busca incompleta" corpo={MENSAGENS.buscaSemRecorte}>
        <Botao rotulo="Voltar para a busca" onPress={() => router.replace("/")} />
      </EstadoMensagem>
    );
  } else if (consulta.isPending) {
    conteudo = (
      <View style={{ padding: 16 }}>
        <EsqueletoLista mensagem={MENSAGENS.carregando} />
      </View>
    );
  } else if (consulta.isError && postos.length === 0) {
    const falha = consulta.error instanceof FalhaDeConsulta ? consulta.error : null;
    const mensagem =
      falha?.codigo === "busca_curta"
        ? { titulo: "Busca muito curta", corpo: MENSAGENS.buscaCurta(3) }
        : mensagemDeFalha(falha?.motivo ?? "indisponivel");
    conteudo = (
      <EstadoMensagem
        icone={falha?.motivo === "sem_conexao" ? "semConexao" : "info"}
        titulo={mensagem.titulo}
        corpo={mensagem.corpo}
        alerta
      >
        <Botao rotulo="Tentar novamente" icone="recarregar" onPress={() => void consulta.refetch()} />
        <Botao rotulo="Ver favoritos guardados" variante="secundario" onPress={() => router.replace("/favoritos")} />
      </EstadoMensagem>
    );
  } else if (buscaNaoAplicada) {
    conteudo = (
      <EstadoMensagem icone="info" titulo={MENSAGENS.buscaNaoAplicada.titulo} corpo={MENSAGENS.buscaNaoAplicada.corpo} alerta>
        <Botao rotulo="Tentar novamente" icone="recarregar" onPress={() => void consulta.refetch()} />
        <Botao rotulo="Voltar para a busca" variante="secundario" onPress={() => router.replace("/")} />
      </EstadoMensagem>
    );
  } else if (postos.length === 0) {
    conteudo = (
      <EstadoMensagem
        icone="busca"
        titulo={MENSAGENS.semResultados.titulo}
        corpo={MENSAGENS.semResultados.corpo}
        detalhe={MENSAGENS.semResultados.detalhe}
      >
        <Botao rotulo="Corrigir a busca" onPress={() => router.replace("/")} />
        {uf && q ? (
          <Botao
            rotulo={`Ver todos os postos de ${nomeProprio(municipio) || uf}`}
            variante="secundario"
            onPress={() => router.replace({ pathname: "/postos", params: { uf, municipio } })}
          />
        ) : null}
      </EstadoMensagem>
    );
  } else {
    conteudo = (
      <FlatList
        data={postos}
        keyExtractor={(posto) => posto.posto_id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 + margens.bottom }}
        renderItem={({ item }) => <CartaoPosto posto={item} />}
        ListHeaderComponent={
          <Texto variante="pequeno" cor={cores.tintaSuave} accessibilityLiveRegion="polite">
            {postos.length} {postos.length === 1 ? "posto exibido" : "postos exibidos"}
            {consulta.hasNextPage ? " · há mais abaixo" : ""}
          </Texto>
        }
        ListFooterComponent={
          consulta.isFetchingNextPage ? (
            <Carregando mensagem={MENSAGENS.carregando} />
          ) : consulta.hasNextPage ? (
            <Botao rotulo="Ver mais postos" variante="secundario" onPress={() => void consulta.fetchNextPage()} />
          ) : (
            <Texto variante="pequeno" cor={cores.tintaSuave} centro>
              Fim da lista. A lista não tem ordem por preço nem por resultado de ensaio.
            </Texto>
          )
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (consulta.hasNextPage && !consulta.isFetchingNextPage) void consulta.fetchNextPage();
        }}
      />
    );
  }

  return (
    <Tela>
      <BarraTopo titulo={titulo} subtitulo={subtitulo} />
      {conteudo}
    </Tela>
  );
}
