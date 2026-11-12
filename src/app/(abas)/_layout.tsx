import { Redirect } from "expo-router";
import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLoja } from "@/armazenamento/loja";
import { lojaPreferencias } from "@/armazenamento/usuario";
import { cores } from "@/tema/tokens";
import { Icone, type NomeIcone } from "@/ui/Icone";
import { Texto } from "@/ui/Texto";

const ABAS: Record<string, { rotulo: string; icone: NomeIcone }> = {
  index: { rotulo: "Início", icone: "inicio" },
  mapa: { rotulo: "Perto", icone: "mapa" },
  favoritos: { rotulo: "Favoritos", icone: "estrela" },
  alertas: { rotulo: "Alertas", icone: "sino" },
  conta: { rotulo: "Conta", icone: "pessoa" },
};

/**
 * Barra de abas própria, igual à do mockup: a aba ativa é marcada por cor E
 * por um traço âmbar no topo (não só por cor), e cada aba tem 56 pt de altura.
 */
function BarraDeAbas({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const margens = useSafeAreaInsets();
  return (
    <View style={[estilos.barra, { paddingBottom: margens.bottom }]} accessibilityRole="tablist">
      {state.routes.map((rota, indice) => {
        const aba = ABAS[rota.name];
        if (!aba) return null;
        const ativa = state.index === indice;
        const cor = ativa ? cores.petroleo : cores.tintaSuave;
        return (
          <Pressable
            key={rota.key}
            accessibilityRole="tab"
            accessibilityLabel={aba.rotulo}
            accessibilityState={{ selected: ativa }}
            onPress={() => {
              // Mesmo protocolo da barra padrão do expo-router 58: emite o
              // toque (uma tela pode cancelá-lo) e só então troca de aba.
              const evento = emitter.emit({ type: "tabPress", target: rota.key, canPreventDefault: true });
              if (!ativa && !evento.defaultPrevented) navigateToTab(rota.key);
            }}
            style={[estilos.aba, ativa ? estilos.abaAtiva : null]}
          >
            <Icone nome={aba.icone} cor={cor} />
            <Texto variante="pequenoForte" cor={cor} style={estilos.rotulo} numberOfLines={1}>
              {aba.rotulo}
            </Texto>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Abas() {
  const { viuBoasVindas } = useLoja(lojaPreferencias);
  if (!viuBoasVindas) return <Redirect href="/boas-vindas" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BarraDeAbas {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="mapa" />
      <Tabs.Screen name="favoritos" />
      <Tabs.Screen name="alertas" />
      <Tabs.Screen name="conta" />
    </Tabs>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: "row",
    backgroundColor: cores.branco,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  aba: {
    flex: 1,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderTopWidth: 3,
    borderTopColor: "transparent",
  },
  abaAtiva: { borderTopColor: cores.ambar },
  rotulo: { fontSize: 11.5, lineHeight: 15 },
});
