import { Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from "react-native";

import { cores, raio, TOQUE } from "@/tema/tokens";
import { Icone, type NomeIcone } from "@/ui/Icone";
import { Texto } from "@/ui/Texto";

export type VarianteBotao = "primario" | "secundario" | "escuro" | "texto";

export interface BotaoProps extends Omit<PressableProps, "children" | "style"> {
  rotulo: string;
  variante?: VarianteBotao;
  icone?: NomeIcone;
  iconeDepois?: NomeIcone;
  /** 44 pt de altura em vez de 48, para fileiras de ações. */
  compacto?: boolean;
  estilo?: ViewStyle;
}

const fundo: Record<VarianteBotao, string> = {
  primario: cores.ambar,
  secundario: cores.branco,
  escuro: cores.petroleo,
  texto: "transparent",
};

const tinta: Record<VarianteBotao, string> = {
  primario: cores.petroleo,
  secundario: cores.petroleo,
  escuro: cores.branco,
  texto: cores.petroleo3,
};

export function Botao({
  rotulo,
  variante = "primario",
  icone,
  iconeDepois,
  compacto,
  estilo,
  disabled,
  ...resto
}: BotaoProps) {
  const cor = disabled ? cores.tintaSuave : tinta[variante];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...resto}
      style={({ pressed }) => [
        estilos.base,
        { backgroundColor: disabled ? cores.areia : fundo[variante], minHeight: compacto ? TOQUE : 48 },
        variante === "secundario" && !disabled ? estilos.contorno : null,
        pressed ? estilos.pressionado : null,
        estilo,
      ]}
    >
      {icone ? <Icone nome={icone} cor={cor} /> : null}
      <Texto
        variante={compacto ? "pequenoForte" : "destaque"}
        cor={cor}
        style={variante === "texto" ? estilos.sublinhado : null}
      >
        {rotulo}
      </Texto>
      {iconeDepois ? <Icone nome={iconeDepois} cor={cor} /> : null}
    </Pressable>
  );
}

export interface BotaoIconeProps extends Omit<PressableProps, "children" | "style"> {
  /** Obrigatório: botão só de ícone não tem texto visível. */
  rotuloAcessivel: string;
  icone: NomeIcone;
  cor?: string;
  preenchimento?: string;
  contorno?: boolean;
  estilo?: ViewStyle;
}

export function BotaoIcone({
  rotuloAcessivel,
  icone,
  cor = cores.branco,
  preenchimento,
  contorno,
  estilo,
  ...resto
}: BotaoIconeProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      hitSlop={4}
      {...resto}
      style={({ pressed }) => [
        estilos.icone,
        contorno ? estilos.iconeContorno : null,
        pressed ? estilos.pressionado : null,
        estilo,
      ]}
    >
      <View>
        <Icone nome={icone} cor={cor} preenchimento={preenchimento} />
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: raio.controle,
  },
  contorno: { borderWidth: 1.5, borderColor: cores.petroleo },
  pressionado: { opacity: 0.75 },
  sublinhado: { textDecorationLine: "underline" },
  icone: {
    width: TOQUE,
    height: TOQUE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: raio.controle,
  },
  iconeContorno: { borderWidth: 1.5, borderColor: cores.borda, backgroundColor: cores.branco },
});
