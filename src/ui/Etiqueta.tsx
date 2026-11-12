import { StyleSheet, View } from "react-native";

import type { ClassificacaoPMQC } from "@/api/tipos";
import { cores, raio } from "@/tema/tokens";
import { Icone, type NomeIcone } from "@/ui/Icone";
import { Texto } from "@/ui/Texto";

/**
 * Etiqueta de procedência — a linguagem central do app.
 *
 * - `oficial`: fundo cheio + escudo. Publicado por órgão público.
 * - `declarado`: contorno tracejado + lápis. Informado pelo próprio posto.
 * - `promocao`: fundo âmbar + megafone. Publicidade do posto.
 * - `neutra`: atributo sem juízo (bandeira, contagem).
 * - `vazia`: ausência de dado. Tracejado cinza, nunca um número.
 *
 * As três primeiras diferem em forma, ícone e luminosidade — não só em cor.
 */
export type TipoEtiqueta = "oficial" | "declarado" | "promocao" | "neutra" | "vazia";

const aparencia: Record<
  TipoEtiqueta,
  { fundo: string; tinta: string; borda?: string; tracejada?: boolean; icone?: NomeIcone }
> = {
  oficial: { fundo: cores.petroleo, tinta: cores.branco, icone: "escudo" },
  declarado: { fundo: cores.branco, tinta: cores.petroleo3, borda: cores.petroleo3, tracejada: true, icone: "lapis" },
  promocao: { fundo: cores.ambar, tinta: cores.petroleo, icone: "megafone" },
  neutra: { fundo: cores.areia, tinta: cores.tinta },
  vazia: { fundo: "transparent", tinta: cores.tintaSuave, borda: cores.borda, tracejada: true },
};

export function Etiqueta({ tipo = "neutra", children }: { tipo?: TipoEtiqueta; children: string }) {
  const a = aparencia[tipo];
  return (
    <View
      style={[
        estilos.etiqueta,
        { backgroundColor: a.fundo },
        a.borda ? { borderWidth: a.tracejada ? 1.5 : 1, borderColor: a.borda } : null,
        a.tracejada ? { borderStyle: "dashed" } : null,
      ]}
    >
      {a.icone ? <Icone nome={a.icone} tamanho={14} cor={a.tinta} /> : null}
      <Texto variante="pequenoForte" cor={a.tinta} style={estilos.textoEtiqueta} numberOfLines={1}>
        {children}
      </Texto>
    </View>
  );
}

/**
 * Classificação publicada pela fonte para UM ensaio. Vale para o ensaio, nunca
 * para o posto. Rótulo + ícone + diferença de luminosidade; sem semáforo.
 */
const aparenciaClassificacao: Record<
  ClassificacaoPMQC,
  { fundo: string; tinta: string; borda?: string; tracejada?: boolean; icone?: NomeIcone }
> = {
  conforme: { fundo: cores.azulClaro, tinta: cores.petroleo, icone: "marca" },
  "não conforme": { fundo: cores.ambarClaro, tinta: cores.ambarEscuro, borda: cores.ambarBorda, icone: "diferente" },
  "não classificado": { fundo: cores.branco, tinta: cores.tintaSuave, borda: cores.borda, tracejada: true },
};

export function Classificacao({
  classificacao,
  contagem,
}: {
  classificacao: ClassificacaoPMQC;
  /** Quando presente, vira "9 conforme"; ausente, só o rótulo. */
  contagem?: number;
}) {
  const a = aparenciaClassificacao[classificacao];
  return (
    <View
      style={[
        estilos.classificacao,
        { backgroundColor: a.fundo },
        a.borda ? { borderWidth: 1, borderColor: a.borda } : null,
        a.tracejada ? { borderStyle: "dashed" } : null,
      ]}
    >
      {a.icone ? <Icone nome={a.icone} tamanho={14} cor={a.tinta} /> : null}
      <Texto variante="pequenoForte" cor={a.tinta} style={estilos.textoEtiqueta}>
        {contagem === undefined ? classificacao : `${contagem} ${classificacao}`}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  etiqueta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: raio.etiqueta,
    maxWidth: "100%",
  },
  classificacao: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: raio.pilula,
  },
  textoEtiqueta: { fontSize: 12, lineHeight: 16, flexShrink: 1 },
});
