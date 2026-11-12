/**
 * Movimento do app.
 *
 * Pouco e com função: mostrar que algo chegou (entrada), que algo está sendo
 * buscado (pulso do esqueleto) e que um toque teve efeito (estrela do
 * favorito). Nada gira, quica ou se repete para enfeitar.
 *
 * Quem liga "reduzir movimento" no aparelho não vê deslocamento nem pulso: o
 * conteúdo simplesmente aparece. A preferência é lida uma vez e acompanhada
 * enquanto o app está aberto.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, type StyleProp, type ViewStyle } from "react-native";

// O driver nativo de animação não existe no navegador.
const DRIVER_NATIVO = Platform.OS !== "web";

let movimentoReduzido = false;

try {
  void AccessibilityInfo.isReduceMotionEnabled()
    .then((ligado) => {
      movimentoReduzido = ligado;
    })
    .catch(() => undefined);
  AccessibilityInfo.addEventListener("reduceMotionChanged", (ligado) => {
    movimentoReduzido = ligado;
  });
} catch {
  // Plataforma sem a API de acessibilidade: segue com movimento normal.
}

export function movimentoEstaReduzido(): boolean {
  return movimentoReduzido;
}

/** Passo do escalonamento de listas, e teto para a lista longa não demorar. */
const PASSO_MS = 45;
const MAXIMO_ESCALONADO = 8;

export function atrasoDoItem(indice: number): number {
  return Math.min(indice, MAXIMO_ESCALONADO) * PASSO_MS;
}

/**
 * Entrada suave: o bloco sobe 10 pt e aparece em 240 ms. Trocar a `key` do
 * componente refaz a entrada (é como as abas da ficha anunciam a troca).
 */
export function Entrada({
  children,
  atraso = 0,
  style,
}: {
  children: ReactNode;
  atraso?: number;
  style?: StyleProp<ViewStyle>;
}) {
  // `useState` com inicializador: o valor animado nasce uma vez e não é lido de um ref durante a renderização.
  const [progresso] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const reduzido = movimentoEstaReduzido();
    const animacao = Animated.timing(progresso, {
      toValue: 1,
      duration: reduzido ? 0 : 240,
      delay: reduzido ? 0 : atraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: DRIVER_NATIVO,
    });
    animacao.start();
    return () => animacao.stop();
  }, [progresso, atraso]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progresso,
          transform: [
            {
              translateY: progresso.interpolate({
                inputRange: [0, 1],
                outputRange: [movimentoEstaReduzido() ? 0 : 10, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Pulso lento dos blocos de esqueleto enquanto a consulta não voltou. */
export function Pulso({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const [opacidade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (movimentoEstaReduzido()) return undefined;
    const ciclo = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 0.45, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: DRIVER_NATIVO }),
        Animated.timing(opacidade, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: DRIVER_NATIVO }),
      ]),
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [opacidade]);

  return <Animated.View style={[style, { opacity: opacidade }]}>{children}</Animated.View>;
}

/**
 * Resposta a um toque que mudou um estado: o conteúdo cresce e volta uma vez
 * quando `gatilho` muda. Não anima na primeira renderização.
 */
export function Destaque({ children, gatilho }: { children: ReactNode; gatilho: unknown }) {
  const [escala] = useState(() => new Animated.Value(1));
  const primeira = useRef(true);

  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return undefined;
    }
    if (movimentoEstaReduzido()) return undefined;
    const animacao = Animated.sequence([
      Animated.timing(escala, { toValue: 1.3, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: DRIVER_NATIVO }),
      Animated.spring(escala, { toValue: 1, friction: 5, tension: 140, useNativeDriver: DRIVER_NATIVO }),
    ]);
    animacao.start();
    return () => animacao.stop();
  }, [escala, gatilho]);

  return <Animated.View style={{ transform: [{ scale: escala }] }}>{children}</Animated.View>;
}
