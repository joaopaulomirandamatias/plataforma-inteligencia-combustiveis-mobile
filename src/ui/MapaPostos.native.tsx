/**
 * Mapa de postos — Android e iOS (react-native-maps).
 *
 * Regras de produto que o desenho precisa respeitar:
 *
 * - **Marcador sem juízo.** Todos os postos têm a mesma cor. O que muda é a
 *   ORIGEM da posição: cheio = coordenada publicada pela ANP (GEO-ANP);
 *   contorno tracejado = posição estimada pelo endereço (GEO-01). Nada no
 *   marcador fala de preço ou de resultado de ensaio.
 * - **Posição do usuário aproximada.** O mapa NÃO liga `showsUserLocation`. O
 *   que aparece é um círculo do raio consultado em volta do centro já
 *   arredondado a cerca de 1 km — o mesmo valor que foi à API.
 * - **O app não filtra nem calcula.** Os pontos são os que a API devolveu para
 *   o raio; arrastar o mapa só oferece consultar de novo a partir dali.
 */
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, type Region } from "react-native-maps";

import { nomeProprio } from "@/lib/formato";
import { cores } from "@/tema/tokens";

import type { MapaPostosProps } from "./MapaPostos";

export type { MapaPostosProps } from "./MapaPostos";

/**
 * No iOS o mapa é o do sistema e não pede chave. No Android o SDK do Google
 * FECHA o app se não houver chave no build; por isso o mapa só é oferecido
 * quando a chave está configurada em `app.json` — ou dentro do Expo Go, que
 * traz a própria.
 */
export const MAPA_DISPONIVEL: boolean =
  Platform.OS === "ios" ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Boolean(Constants.expoConfig?.android?.config?.googleMaps?.apiKey);

const METROS_POR_GRAU = 111_320;

function regiaoDoRaio(centro: MapaPostosProps["centro"], raioMetros: number): Region {
  // 2,4 × raio: o círculo consultado cabe inteiro, com uma margem em volta.
  const latitudeDelta = (raioMetros * 2.4) / METROS_POR_GRAU;
  const longitudeDelta = latitudeDelta / Math.max(Math.cos((centro.latitude * Math.PI) / 180), 0.1);
  return { ...centro, latitudeDelta, longitudeDelta };
}

function Marcador({ estimada, selecionado }: { estimada: boolean; selecionado: boolean }) {
  return (
    <View style={estilos.alvo}>
      <View
        style={[
          estilos.marcador,
          estimada ? estilos.marcadorEstimado : null,
          selecionado ? estilos.marcadorSelecionado : null,
        ]}
      />
    </View>
  );
}

export function MapaPostos({ centro, raioMetros, pontos, selecionado, aoSelecionar, aoMoverCentro }: MapaPostosProps) {
  const regiao = useMemo(() => regiaoDoRaio(centro, raioMetros), [centro, raioMetros]);

  function aoParar(nova: Region) {
    // Só oferece "buscar nesta área" quando o centro saiu do círculo consultado.
    const dLat = (nova.latitude - centro.latitude) * METROS_POR_GRAU;
    const dLon = (nova.longitude - centro.longitude) * METROS_POR_GRAU * Math.cos((centro.latitude * Math.PI) / 180);
    const afastamento = Math.sqrt(dLat * dLat + dLon * dLon);
    aoMoverCentro(afastamento > raioMetros / 2 ? { latitude: nova.latitude, longitude: nova.longitude } : null);
  }

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      // `key` refaz o enquadramento quando a consulta muda de centro ou raio.
      key={`${centro.latitude},${centro.longitude},${raioMetros}`}
      initialRegion={regiao}
      onRegionChangeComplete={aoParar}
      onPress={() => aoSelecionar(null)}
      showsUserLocation={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
      accessibilityLabel="Mapa dos postos com posição conhecida no raio consultado"
    >
      <Circle
        center={centro}
        radius={raioMetros}
        strokeColor={cores.petroleo3}
        strokeWidth={1.5}
        fillColor="rgba(29,76,99,0.08)"
        lineDashPattern={[6, 6]}
      />
      {pontos.map((ponto) => {
        const estimada = ponto.fonte === "GEO-01";
        const marcado = ponto.posto_id === selecionado;
        return (
          <Marker
            key={ponto.posto_id}
            coordinate={{ latitude: ponto.latitude, longitude: ponto.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={(evento) => {
              evento.stopPropagation();
              aoSelecionar(ponto.posto_id);
            }}
            // O desenho do marcador só muda quando a seleção muda.
            tracksViewChanges={marcado}
            accessibilityLabel={`${nomeProprio(ponto.razao_social) || "Posto"}. ${
              estimada ? "Posição estimada pelo endereço" : "Posição publicada pela ANP"
            }${marcado ? ". Selecionado" : ""}`}
          >
            <Marcador estimada={estimada} selecionado={marcado} />
          </Marker>
        );
      })}
    </MapView>
  );
}

const estilos = StyleSheet.create({
  // Área de toque de 44 pt em volta de um marcador de 26 pt.
  alvo: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  marcador: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: cores.petroleo,
    borderWidth: 3,
    borderColor: cores.branco,
  },
  marcadorEstimado: { backgroundColor: cores.branco, borderColor: cores.petroleo, borderStyle: "dashed" },
  marcadorSelecionado: { width: 34, height: 34, borderRadius: 17, borderWidth: 4, borderColor: cores.ambar },
});
