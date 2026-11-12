import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";

import { cores, raio, TOQUE } from "@/tema/tokens";
import { Etiqueta, type TipoEtiqueta } from "@/ui/Etiqueta";
import { Icone, type NomeIcone } from "@/ui/Icone";
import { Texto } from "@/ui/Texto";

export type TipoCartao = "padrao" | "declarado" | "promocao" | "vazio";

const estiloCartao: Record<TipoCartao, ViewStyle> = {
  padrao: { backgroundColor: cores.branco, borderWidth: 1, borderColor: cores.linha },
  /** Tudo que o posto declarou vive num cartão tracejado, igual à etiqueta. */
  declarado: { backgroundColor: cores.branco, borderWidth: 1.5, borderColor: cores.petroleo3, borderStyle: "dashed" },
  promocao: { backgroundColor: cores.ambarClaro, borderWidth: 1, borderColor: cores.ambarBorda },
  vazio: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: cores.borda, borderStyle: "dashed" },
};

export function Cartao({
  tipo = "padrao",
  semPreenchimento,
  style,
  ...resto
}: ViewProps & { tipo?: TipoCartao; semPreenchimento?: boolean }) {
  return (
    <View
      {...resto}
      style={[estilos.cartao, estiloCartao[tipo], semPreenchimento ? { padding: 0 } : null, style]}
    />
  );
}

/** Aviso contextual. Não é rodapé jurídico: fica junto do dado que qualifica. */
export function Aviso({ children, icone = "info" }: { children: ReactNode; icone?: NomeIcone }) {
  return (
    <View style={estilos.aviso} accessibilityRole="text">
      <View style={{ marginTop: 1 }}>
        <Icone nome={icone} cor={cores.petroleo3} />
      </View>
      <Texto variante="pequeno" style={{ flex: 1 }}>
        {children}
      </Texto>
    </View>
  );
}

export function Divisor() {
  return <View style={estilos.divisor} />;
}

/** Cabeçalho de seção: rótulo em caixa alta + etiqueta de procedência à direita. */
export function CabecalhoSecao({
  titulo,
  etiqueta,
  tipoEtiqueta = "oficial",
}: {
  titulo: string;
  etiqueta?: string;
  tipoEtiqueta?: TipoEtiqueta;
}) {
  return (
    <View style={estilos.cabecalho}>
      <Texto variante="rotulo" accessibilityRole="header" style={{ flex: 1 }}>
        {titulo}
      </Texto>
      {etiqueta ? <Etiqueta tipo={tipoEtiqueta}>{etiqueta}</Etiqueta> : null}
    </View>
  );
}

/** Linha de lista navegável, com 48 pt de altura mínima e seta à direita. */
export function LinhaNavegacao({
  titulo,
  subtitulo,
  fonte,
  icone,
  iconeDireita = "avancar",
  ultima,
  onPress,
  rotuloAcessivel,
}: {
  titulo: string;
  subtitulo?: string;
  fonte?: string;
  icone?: NomeIcone;
  iconeDireita?: NomeIcone | null;
  ultima?: boolean;
  onPress?: () => void;
  rotuloAcessivel?: string;
}) {
  const conteudo = (
    <>
      {icone ? <Icone nome={icone} cor={cores.tintaSuave} /> : null}
      <View style={{ flex: 1, gap: 1 }}>
        <Texto variante="corpoForte">{titulo}</Texto>
        {subtitulo ? (
          <Texto variante="pequeno" cor={cores.tintaSuave}>
            {subtitulo}
          </Texto>
        ) : null}
        {fonte ? <Texto variante="fonte">{fonte}</Texto> : null}
      </View>
      {onPress && iconeDireita ? <Icone nome={iconeDireita} cor={cores.tintaSuave} /> : null}
    </>
  );
  const estilo = [estilos.linha, ultima ? null : estilos.linhaBorda];
  if (!onPress) return <View style={estilo}>{conteudo}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      onPress={onPress}
      style={({ pressed }) => [...estilo, pressed ? { opacity: 0.7 } : null]}
    >
      {conteudo}
    </Pressable>
  );
}

/** Par rótulo/valor do cadastro. */
export function ParChaveValor({ chave, children }: { chave: string; children: ReactNode }) {
  return (
    <View style={estilos.par}>
      <Texto variante="pequeno" cor={cores.tintaSuave} style={estilos.parChave}>
        {chave}
      </Texto>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { borderRadius: raio.cartao, padding: 14, gap: 10 },
  aviso: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: raio.controle,
    backgroundColor: cores.azulClaro,
  },
  divisor: { height: 1, backgroundColor: cores.linha },
  cabecalho: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 24 },
  linha: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: TOQUE + 8, paddingVertical: 10 },
  linhaBorda: { borderBottomWidth: 1, borderBottomColor: cores.linha },
  par: { flexDirection: "row", gap: 12 },
  parChave: { width: 112 },
});
