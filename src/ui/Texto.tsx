import { Text, type TextProps, type TextStyle } from "react-native";

import { cores, fontes } from "@/tema/tokens";

/**
 * Variações tipográficas do app. Nada abaixo de 11,5 pt — inclusive datas e
 * linhas de fonte, que no portal chegavam a 9,5 px.
 */
const variantes = {
  titulo1: { fontFamily: fontes.titulo, fontSize: 30, lineHeight: 34 },
  titulo2: { fontFamily: fontes.titulo, fontSize: 24, lineHeight: 28 },
  titulo3: { fontFamily: fontes.titulo, fontSize: 20, lineHeight: 24 },
  corpo: { fontFamily: fontes.corpo, fontSize: 15, lineHeight: 22 },
  corpoMedio: { fontFamily: fontes.corpoMedio, fontSize: 15, lineHeight: 22 },
  corpoForte: { fontFamily: fontes.corpoForte, fontSize: 15, lineHeight: 22 },
  destaque: { fontFamily: fontes.corpoForte, fontSize: 16, lineHeight: 21 },
  pequeno: { fontFamily: fontes.corpo, fontSize: 13, lineHeight: 19 },
  pequenoForte: { fontFamily: fontes.corpoForte, fontSize: 13, lineHeight: 19 },
  rotulo: {
    fontFamily: fontes.corpoForte,
    fontSize: 11.5,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  /** Linha de fonte: órgão · conjunto · data, sempre monoespaçada. */
  fonte: { fontFamily: fontes.mono, fontSize: 11.5, lineHeight: 16 },
  mono: { fontFamily: fontes.mono, fontSize: 14, lineHeight: 20 },
  numero: { fontFamily: fontes.titulo, fontSize: 30, lineHeight: 34 },
} satisfies Record<string, TextStyle>;

export type VarianteTexto = keyof typeof variantes;

const corPadrao: Partial<Record<VarianteTexto, string>> = {
  rotulo: cores.tintaSuave,
  fonte: cores.tintaSuave,
  titulo1: cores.petroleo,
  titulo2: cores.petroleo,
  titulo3: cores.petroleo,
  numero: cores.petroleo,
};

export interface TextoProps extends TextProps {
  variante?: VarianteTexto;
  cor?: string;
  centro?: boolean;
}

export function Texto({ variante = "corpo", cor, centro, style, ...resto }: TextoProps) {
  return (
    <Text
      {...resto}
      style={[
        variantes[variante],
        { color: cor ?? corPadrao[variante] ?? cores.tinta },
        centro ? { textAlign: "center" } : null,
        style,
      ]}
    />
  );
}
