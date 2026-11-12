import { router } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cores } from "@/tema/tokens";
import { BotaoIcone } from "@/ui/Botao";
import { Texto } from "@/ui/Texto";

/**
 * Barra superior petróleo. O botão voltar aparece quando há para onde voltar;
 * quando a tela foi aberta por link direto, ele leva ao Início.
 */
export function BarraTopo({
  titulo,
  subtitulo,
  voltar = true,
  acoes,
}: {
  titulo: string;
  subtitulo?: string;
  voltar?: boolean;
  acoes?: ReactNode;
}) {
  const margens = useSafeAreaInsets();
  return (
    <View style={[estilos.topo, { paddingTop: margens.top + 6 }]}>
      {voltar ? (
        <BotaoIcone
          rotuloAcessivel="Voltar"
          icone="voltar"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        />
      ) : (
        <View style={{ width: 8 }} />
      )}
      <View style={{ flex: 1 }}>
        <Texto variante="titulo3" cor={cores.branco} accessibilityRole="header" numberOfLines={1}>
          {titulo}
        </Texto>
        {subtitulo ? (
          <Texto variante="fonte" cor={cores.sobrePetroleoSuave} numberOfLines={1}>
            {subtitulo}
          </Texto>
        ) : null}
      </View>
      {acoes}
    </View>
  );
}

/** Corpo rolável padrão: fundo papel, 16 pt de margem, 12 pt entre blocos. */
export function Corpo({ children, contentContainerStyle, ...resto }: ScrollViewProps) {
  const margens = useSafeAreaInsets();
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      {...resto}
      style={estilos.rolagem}
      contentContainerStyle={[estilos.corpo, { paddingBottom: 24 + margens.bottom }, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  );
}

export function Tela({ children }: { children: ReactNode }) {
  return <View style={estilos.tela}>{children}</View>;
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.papel },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 56,
    paddingHorizontal: 8,
    paddingBottom: 6,
    backgroundColor: cores.petroleo,
  },
  rolagem: { flex: 1, backgroundColor: cores.papel },
  corpo: { padding: 16, gap: 12 },
});
