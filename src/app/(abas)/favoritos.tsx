import { router } from "expo-router";
import { FlatList, View } from "react-native";

import { useLoja } from "@/armazenamento/loja";
import { alternarFavorito, lojaFavoritos } from "@/armazenamento/usuario";
import { dataBr, nomeProprio } from "@/lib/formato";
import { MENSAGENS } from "@/lib/mensagens";
import { cores } from "@/tema/tokens";
import { Botao, BotaoIcone } from "@/ui/Botao";
import { CartaoPosto } from "@/ui/CartaoPosto";
import { EstadoMensagem } from "@/ui/Estados";
import { BarraTopo, Tela } from "@/ui/Tela";
import { Texto } from "@/ui/Texto";

export default function Favoritos() {
  const favoritos = useLoja(lojaFavoritos).itens;

  return (
    <Tela>
      <BarraTopo
        titulo="Favoritos"
        voltar={false}
        acoes={<BotaoIcone rotuloAcessivel="Buscar posto para adicionar" icone="mais" onPress={() => router.navigate("/")} />}
      />
      {favoritos.length === 0 ? (
        <EstadoMensagem icone="estrela" titulo={MENSAGENS.favoritos.vazio.titulo} corpo={MENSAGENS.favoritos.vazio.corpo}>
          <Botao rotulo="Buscar um posto" onPress={() => router.navigate("/")} />
        </EstadoMensagem>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(posto) => posto.posto_id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
          ListHeaderComponent={
            <Texto variante="pequeno" cor={cores.tintaSuave}>
              {favoritos.length} {favoritos.length === 1 ? "posto salvo" : "postos salvos"} neste aparelho · abrem sem
              internet
            </Texto>
          }
          ListFooterComponent={
            <Texto variante="pequeno" cor={cores.tintaSuave} centro style={{ marginTop: 6 }}>
              {MENSAGENS.favoritos.rodape}
            </Texto>
          }
          renderItem={({ item }) => (
            <CartaoPosto
              posto={item}
              complemento={`salvo em ${dataBr(item.quando)}`}
              rodape={
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Texto variante="pequeno" cor={cores.tintaSuave} style={{ flex: 1 }}>
                    Avisos indisponíveis por enquanto
                  </Texto>
                  <BotaoIcone
                    rotuloAcessivel={`Remover ${nomeProprio(item.razao_social)} dos favoritos`}
                    icone="estrela"
                    cor={cores.petroleo}
                    preenchimento={cores.ambar}
                    onPress={() => alternarFavorito(item)}
                  />
                </View>
              }
            />
          )}
        />
      )}
    </Tela>
  );
}
