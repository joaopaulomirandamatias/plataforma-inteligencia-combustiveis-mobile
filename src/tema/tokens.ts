/**
 * Tokens visuais do app.
 *
 * Mesma identidade do portal público (`globals.css`) e do console de gestão
 * (`design-tokens.css`): petróleo, âmbar, Saira. Os valores que diferem do
 * portal diferem de propósito, por contraste:
 *
 * - `borda` (#84929B) passa de 3:1 sobre branco — o portal usa #BFCBD2 (1,66:1);
 * - `ambarEscuro` (#7D4E00) passa de 4,5:1 sobre `ambarClaro`;
 * - `tintaSuave` (#55646E) passa de 4,5:1 sobre `papel`.
 *
 * Não existe verde/vermelho para qualificar posto. `erro` é reservado a falha
 * do próprio app e a ação destrutiva (ADR-005 e `mockup-e-workspaces.md` §4).
 */
export const cores = {
  petroleo: "#0c2733",
  petroleo2: "#14384a",
  petroleo3: "#1d4c63",
  petroleoLinha: "#2c5a70",
  ambar: "#f2a614",
  ambarEscuro: "#7d4e00",
  ambarClaro: "#fdf0d2",
  ambarBorda: "#d9b458",
  papel: "#f6f4ee",
  areia: "#ece8dd",
  branco: "#ffffff",
  tinta: "#22303a",
  tintaSuave: "#55646e",
  linha: "#dfdbd0",
  borda: "#84929b",
  azulClaro: "#e8f0f5",
  sobrePetroleoSuave: "#b9cad3",
  erro: "#a3342c",
} as const;

export const espaco = { xxs: 4, xs: 6, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;

export const raio = { etiqueta: 6, controle: 10, cartao: 12, folha: 20, pilula: 999 } as const;

/** Alvo mínimo de toque: 44 pt em todo controle. */
export const TOQUE = 44;

/**
 * Nomes de família exatamente como `expo-font` os registra em `_layout.tsx`.
 * Em React Native o peso vem da família carregada, não de `fontWeight`.
 */
export const fontes = {
  corpo: "Saira_400Regular",
  corpoMedio: "Saira_500Medium",
  corpoForte: "Saira_600SemiBold",
  titulo: "SairaCondensed_700Bold",
  mono: "IBMPlexMono_500Medium",
  monoForte: "IBMPlexMono_600SemiBold",
} as const;

export const sombraFlutuante = {
  shadowColor: cores.petroleo,
  shadowOpacity: 0.25,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
} as const;
