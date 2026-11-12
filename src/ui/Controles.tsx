import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { cores, fontes, raio, TOQUE } from "@/tema/tokens";
import { Icone, type NomeIcone } from "@/ui/Icone";
import { Texto } from "@/ui/Texto";

/** Campo de texto com rótulo VISÍVEL acima — placeholder não é rótulo. */
export function Campo({
  rotulo,
  corRotulo,
  icone,
  erro,
  ajuda,
  estilo,
  ...resto
}: TextInputProps & {
  rotulo: string;
  corRotulo?: string;
  icone?: NomeIcone;
  erro?: string | null;
  ajuda?: string;
  estilo?: ViewStyle;
}) {
  return (
    <View style={[{ gap: 6 }, estilo]}>
      <Texto variante="pequenoForte" cor={corRotulo ?? cores.tinta}>
        {rotulo}
      </Texto>
      <View style={[estilos.campo, erro ? { borderColor: cores.erro, borderWidth: 2 } : null]}>
        {icone ? <Icone nome={icone} cor={cores.tintaSuave} /> : null}
        <TextInput
          accessibilityLabel={rotulo}
          placeholderTextColor={cores.tintaSuave}
          {...resto}
          style={estilos.entrada}
        />
      </View>
      {erro ? (
        <Texto variante="pequenoForte" cor={corRotulo ? cores.ambar : cores.erro} accessibilityRole="alert">
          {erro}
        </Texto>
      ) : ajuda ? (
        <Texto variante="pequeno" cor={corRotulo ?? cores.tintaSuave}>
          {ajuda}
        </Texto>
      ) : null}
    </View>
  );
}

export function Chip({
  rotulo,
  ativo,
  onPress,
}: {
  rotulo: string;
  ativo?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!ativo }}
      onPress={onPress}
      style={({ pressed }) => [estilos.chip, ativo ? estilos.chipAtivo : null, pressed ? { opacity: 0.75 } : null]}
    >
      <Texto variante="corpoMedio" cor={ativo ? cores.branco : cores.tinta} style={{ fontSize: 14 }}>
        {rotulo}
      </Texto>
    </Pressable>
  );
}

/** Interruptor com alvo de 44 pt. O estado também muda a posição, não só a cor. */
export function Chave({
  rotulo,
  descricao,
  valor,
  aoMudar,
  desabilitada,
  direita,
}: {
  rotulo: string;
  descricao?: string;
  valor: boolean;
  aoMudar?: (novo: boolean) => void;
  desabilitada?: boolean;
  /** Substitui o interruptor (ex.: etiqueta "Indisponível"). */
  direita?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={rotulo}
      accessibilityHint={descricao}
      accessibilityState={{ checked: valor, disabled: !!desabilitada }}
      disabled={desabilitada || !aoMudar}
      onPress={() => aoMudar?.(!valor)}
      style={estilos.linhaChave}
    >
      <View style={{ flex: 1, gap: 1 }}>
        <Texto variante="corpoForte" cor={desabilitada ? cores.tintaSuave : cores.tinta}>
          {rotulo}
        </Texto>
        {descricao ? (
          <Texto variante="pequeno" cor={cores.tintaSuave}>
            {descricao}
          </Texto>
        ) : null}
      </View>
      {direita ?? (
        <View style={[estilos.trilho, valor ? estilos.trilhoLigado : null]}>
          <View style={[estilos.pino, valor ? estilos.pinoLigado : null]} />
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  campo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raio.controle,
    backgroundColor: cores.branco,
  },
  entrada: {
    flex: 1,
    minHeight: TOQUE,
    fontFamily: fontes.corpo,
    fontSize: 16,
    color: cores.tinta,
    paddingVertical: 0,
  },
  chip: {
    minHeight: TOQUE,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: raio.pilula,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  chipAtivo: { backgroundColor: cores.petroleo, borderColor: cores.petroleo },
  linhaChave: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: TOQUE + 8, paddingVertical: 10 },
  trilho: {
    width: 52,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
    padding: 3,
    justifyContent: "center",
  },
  trilhoLigado: { backgroundColor: cores.petroleo, borderColor: cores.petroleo },
  pino: { width: 22, height: 22, borderRadius: 11, backgroundColor: cores.borda },
  pinoLigado: { backgroundColor: cores.ambar, alignSelf: "flex-end" },
});
