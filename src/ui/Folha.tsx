import type { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cores, raio } from "@/tema/tokens";
import { BotaoIcone } from "@/ui/Botao";
import { Texto } from "@/ui/Texto";

/**
 * Folha inferior modal. Fecha pelo botão, pelo véu e pelo "voltar" do sistema;
 * o leitor de tela fica restrito ao conteúdo dela enquanto está aberta.
 */
export function Folha({
  visivel,
  titulo,
  aoFechar,
  children,
}: {
  visivel: boolean;
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
}) {
  const margens = useSafeAreaInsets();
  return (
    <Modal visible={visivel} animationType="slide" transparent onRequestClose={aoFechar}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable
          style={estilos.veu}
          onPress={aoFechar}
          accessibilityRole="button"
          accessibilityLabel={`Fechar ${titulo}`}
        />
        <View style={[estilos.folha, { paddingBottom: margens.bottom + 16 }]} accessibilityViewIsModal>
          <View style={estilos.puxador} />
          <View style={estilos.cabecalho}>
            <Texto variante="titulo2" accessibilityRole="header" style={{ flex: 1 }}>
              {titulo}
            </Texto>
            <BotaoIcone rotuloAcessivel="Fechar" icone="fechar" cor={cores.petroleo} onPress={aoFechar} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14 }}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Opção de escolha única dentro de uma folha, com 48 pt de altura mínima. */
export function OpcaoUnica({
  titulo,
  descricao,
  marcada,
  aoEscolher,
}: {
  titulo: string;
  descricao?: string;
  marcada: boolean;
  aoEscolher: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: marcada }}
      accessibilityLabel={descricao ? `${titulo}. ${descricao}` : titulo}
      onPress={aoEscolher}
      style={estilos.opcao}
    >
      <View style={[estilos.radio, marcada ? { borderColor: cores.petroleo } : null]}>
        {marcada ? <View style={estilos.radioMiolo} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Texto variante="corpoForte">{titulo}</Texto>
        {descricao ? (
          <Texto variante="pequeno" cor={cores.tintaSuave}>
            {descricao}
          </Texto>
        ) : null}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  veu: { flex: 1, backgroundColor: "rgba(12,39,51,0.55)" },
  folha: {
    maxHeight: "88%",
    backgroundColor: cores.branco,
    borderTopLeftRadius: raio.folha,
    borderTopRightRadius: raio.folha,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 6,
  },
  puxador: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: cores.linha },
  cabecalho: { flexDirection: "row", alignItems: "center" },
  opcao: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingVertical: 6 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: cores.borda,
    alignItems: "center",
    justifyContent: "center",
  },
  radioMiolo: { width: 12, height: 12, borderRadius: 6, backgroundColor: cores.petroleo },
});
