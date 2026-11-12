import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FalhaDeConsulta } from "@/api/cliente";
import { usePostosProximos, type Centro } from "@/api/consultas";
import { distanciaBr } from "@/lib/formato";
import { MENSAGENS, mensagemDeFalha } from "@/lib/mensagens";
import { cores } from "@/tema/tokens";
import { Botao } from "@/ui/Botao";
import { CartaoPosto } from "@/ui/CartaoPosto";
import { Chip } from "@/ui/Controles";
import { EsqueletoLista, EstadoMensagem } from "@/ui/Estados";
import { Icone } from "@/ui/Icone";
import { Aviso } from "@/ui/Superficies";
import { BarraTopo, Corpo, Tela } from "@/ui/Tela";
import { Texto } from "@/ui/Texto";

const RAIOS_KM = [2, 5, 10, 25];

/**
 * A coordenada enviada à API é arredondada a duas casas (cerca de 1 km), como
 * no portal: basta para ordenar postos por distância e evita mandar a posição
 * exata do usuário. Ela vive só no estado desta tela — sai da memória quando a
 * tela é desmontada e nunca é gravada (ver `podeGravar`).
 */
function aproximar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

type Etapa = "convite" | "pedindo" | "negada" | "falhou";

export default function PertoDeMim() {
  const margens = useSafeAreaInsets();
  const [centro, setCentro] = useState<Centro | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("convite");
  const [raioKm, setRaioKm] = useState(5);

  const proximos = usePostosProximos(centro, raioKm * 1000);

  /** Só é chamada por toque do usuário: a permissão nunca é pedida ao abrir. */
  async function usarLocalizacao() {
    setEtapa("pedindo");
    try {
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (!permissao.granted) {
        setEtapa("negada");
        return;
      }
      const posicao = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCentro({ latitude: aproximar(posicao.coords.latitude), longitude: aproximar(posicao.coords.longitude) });
    } catch {
      setEtapa("falhou");
    }
  }

  if (centro === null) {
    return (
      <Tela>
        <BarraTopo titulo="Perto de mim" voltar={false} />
        <Corpo contentContainerStyle={{ padding: 24, gap: 16 }}>
          <View style={{ alignItems: "flex-start" }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: cores.azulClaro,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icone nome="alvo" tamanho={30} cor={cores.petroleo} />
            </View>
          </View>
          <Texto variante="titulo1" accessibilityRole="header">
            {MENSAGENS.localizacao.titulo}
          </Texto>
          <Texto variante="corpo" style={{ fontSize: 16 }}>
            {MENSAGENS.localizacao.corpo}
          </Texto>
          <View style={{ gap: 12 }}>
            {MENSAGENS.localizacao.pontos.map((ponto) => (
              <View key={ponto} style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ marginTop: 2 }}>
                  <Icone nome="marca" cor={cores.petroleo3} />
                </View>
                <Texto variante="corpo" style={{ flex: 1 }}>
                  {ponto}
                </Texto>
              </View>
            ))}
          </View>

          {etapa === "negada" ? <Aviso>{MENSAGENS.localizacao.negada}</Aviso> : null}
          {etapa === "falhou" ? <Aviso>{MENSAGENS.localizacao.falhou}</Aviso> : null}

          <View style={{ gap: 10, marginTop: 8 }}>
            <Texto variante="pequeno" cor={cores.tintaSuave} centro>
              {MENSAGENS.localizacao.antes}
            </Texto>
            <Botao
              rotulo={etapa === "pedindo" ? "Obtendo localização…" : "Usar minha localização"}
              icone="alvo"
              disabled={etapa === "pedindo"}
              onPress={() => void usarLocalizacao()}
            />
            <Botao rotulo="Escolher estado e cidade" variante="secundario" onPress={() => router.navigate("/")} />
          </View>
        </Corpo>
      </Tela>
    );
  }

  const itens = proximos.data?.itens ?? [];
  const falha = proximos.error instanceof FalhaDeConsulta ? proximos.error : null;

  const cabecalho = (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }} accessibilityLabel="Distância máxima">
        {RAIOS_KM.map((km) => (
          <Chip key={km} rotulo={`Até ${km} km`} ativo={km === raioKm} onPress={() => setRaioKm(km)} />
        ))}
      </View>
      {proximos.data ? (
        <Texto variante="pequeno" cor={cores.tintaSuave} accessibilityLiveRegion="polite">
          {itens.length} {itens.length === 1 ? "posto" : "postos"} com posição conhecida · do mais próximo ao mais distante
        </Texto>
      ) : null}
      {proximos.data?.truncado ? <Aviso>{MENSAGENS.proximos.truncado}</Aviso> : null}
    </View>
  );

  return (
    <Tela>
      <BarraTopo
        titulo="Perto de mim"
        subtitulo="Posição aproximada, cerca de 1 km"
        voltar={false}
      />
      {proximos.isPending ? (
        <View style={{ padding: 16, gap: 12 }}>
          {cabecalho}
          <EsqueletoLista mensagem={MENSAGENS.carregando} />
        </View>
      ) : proximos.isError ? (
        <EstadoMensagem
          icone={falha?.motivo === "sem_conexao" ? "semConexao" : "info"}
          titulo={mensagemDeFalha(falha?.motivo ?? "indisponivel").titulo}
          corpo={mensagemDeFalha(falha?.motivo ?? "indisponivel").corpo}
          alerta
        >
          <Botao rotulo="Tentar novamente" icone="recarregar" onPress={() => void proximos.refetch()} />
        </EstadoMensagem>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(ponto) => ponto.posto_id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 + margens.bottom }}
          ListHeaderComponent={cabecalho}
          ListEmptyComponent={
            <EstadoMensagem
              icone="mapa"
              titulo={MENSAGENS.proximos.vazio.titulo}
              corpo={MENSAGENS.proximos.vazio.corpo}
            />
          }
          renderItem={({ item }) => (
            <CartaoPosto
              posto={item}
              complemento={[
                distanciaBr(item.distancia_m),
                item.fonte === "GEO-ANP" ? MENSAGENS.proximos.posicaoAnp : MENSAGENS.proximos.posicaoEstimada,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          )}
        />
      )}
    </Tela>
  );
}
