import Svg, { Circle, Path, Rect } from "react-native-svg";

import { cores } from "@/tema/tokens";

/**
 * Conjunto próprio de ícones de traço, em grade 20×20 — os mesmos do mockup.
 * Decorativos por padrão: o rótulo acessível fica no controle que os contém.
 */
const desenhos = {
  inicio: <Path d="M3 9.5L10 3l7 6.5V17h-4.5v-5h-5v5H3z" />,
  mapa: (
    <>
      <Path d="M10 18s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" />
      <Circle cx={10} cy={8} r={2.2} />
    </>
  ),
  estrela: <Path d="M10 2.5l2.3 4.8 5.2.7-3.8 3.6.9 5.2L10 14.3l-4.6 2.5.9-5.2L2.5 8l5.2-.7z" />,
  sino: (
    <>
      <Path d="M5 14V9a5 5 0 0110 0v5l1.5 2h-13z" />
      <Path d="M8.5 17.5a1.5 1.5 0 003 0" />
    </>
  ),
  pessoa: (
    <>
      <Circle cx={10} cy={7} r={3.2} />
      <Path d="M3.5 17c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" />
    </>
  ),
  busca: (
    <>
      <Circle cx={9} cy={9} r={6} />
      <Path d="M14 14l4 4" />
    </>
  ),
  voltar: <Path d="M12 4l-6 6 6 6" />,
  avancar: <Path d="M8 4l6 6-6 6" />,
  abaixo: <Path d="M4 8l6 6 6-6" />,
  acima: <Path d="M4 12l6-6 6 6" />,
  fechar: <Path d="M5 5l10 10M15 5L5 15" />,
  mais: <Path d="M10 4v12M4 10h12" />,
  marca: <Path d="M4 10.5l4 4 8-9" />,
  info: (
    <>
      <Circle cx={10} cy={10} r={7.5} />
      <Path d="M10 9v5M10 6.2v.3" />
    </>
  ),
  escudo: <Path d="M10 2l6 2.5v5c0 4-2.6 6.9-6 8.5-3.4-1.6-6-4.5-6-8.5v-5z" />,
  lapis: <Path d="M4 16l1-4 8.5-8.5 3 3L8 15z" />,
  megafone: (
    <>
      <Path d="M3 8v4h3l6 4V4L6 8z" />
      <Path d="M15 7.5a4 4 0 010 5" />
    </>
  ),
  diferente: <Path d="M5 8h10M5 12h10M13 4L7 16" />,
  alvo: (
    <>
      <Circle cx={10} cy={10} r={5.5} />
      <Path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3" />
    </>
  ),
  relogio: (
    <>
      <Circle cx={10} cy={10} r={7.5} />
      <Path d="M10 5.5V10l3 2" />
    </>
  ),
  compartilhar: <Path d="M10 3v10M6 6.5L10 3l4 3.5M4 11v6h12v-6" />,
  rota: <Path d="M17 3L3 9l6 2 2 6z" />,
  filtro: <Path d="M3 5h14M6 10h8M8.5 15h3" />,
  copiar: (
    <>
      <Rect x={7} y={7} width={10} height={10} rx={2} />
      <Path d="M13 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" />
    </>
  ),
  externo: <Path d="M8 4H4v12h12v-4M11 3h6v6M17 3l-8 8" />,
  semConexao: (
    <>
      <Path d="M5.5 15a3.5 3.5 0 01.6-7 4.5 4.5 0 018.6 1.2A3 3 0 0114.5 15z" />
      <Path d="M3 3l14 14" />
    </>
  ),
  recarregar: <Path d="M16.5 10a6.5 6.5 0 11-2-4.7M16.5 3v3.5H13" />,
  gota: <Path d="M10 2.5c3 3.6 5 6.2 5 9a5 5 0 01-10 0c0-2.8 2-5.4 5-9z" />,
  telefone: (
    <Path d="M5 3h3l1.5 4-2 1.5a9 9 0 004 4l1.5-2 4 1.5v3a1.5 1.5 0 01-1.5 1.5A12.5 12.5 0 013.5 4.5 1.5 1.5 0 015 3z" />
  ),
  proveta: (
    <>
      <Path d="M7 2.5h6M8 2.5v5L4 15a2 2 0 001.8 2.5h8.4A2 2 0 0016 15l-4-7.5v-5" />
      <Path d="M6.5 12h7" />
    </>
  ),
  medida: (
    <>
      <Path d="M5 5h10l-1 12H6z" />
      <Path d="M4 5h12M8 2.5h4V5" />
    </>
  ),
} as const;

export type NomeIcone = keyof typeof desenhos;

export interface IconeProps {
  nome: NomeIcone;
  tamanho?: number;
  cor?: string;
  /** Preenche a forma (estrela de favorito marcado). */
  preenchimento?: string;
}

export function Icone({ nome, tamanho = 20, cor = cores.tinta, preenchimento = "none" }: IconeProps) {
  return (
    <Svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 20 20"
      fill={preenchimento}
      stroke={cor}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {desenhos[nome]}
    </Svg>
  );
}
