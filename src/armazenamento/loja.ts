/**
 * Loja pequena e persistida no aparelho (AsyncStorage).
 *
 * Guarda só o que é DO USUÁRIO e não existe no servidor: favoritos, consultas
 * recentes e preferências. Não há conta nem sincronização — quando houver, a
 * fonte de verdade passa a ser o serviço de conta (ver roadmap), e esta loja
 * vira cache dele.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

export interface Loja<T extends object> {
  /** Resolve quando o conteúdo gravado terminou de ser lido. */
  pronta: Promise<void>;
  ler(): T;
  foiCarregada(): boolean;
  definir(atualizar: (atual: T) => T): void;
  redefinir(): Promise<void>;
  assinar(ouvinte: () => void): () => void;
}

export function criarLoja<T extends object>(chave: string, inicial: T): Loja<T> {
  let estado = inicial;
  let carregada = false;
  const ouvintes = new Set<() => void>();
  const avisar = () => ouvintes.forEach((ouvinte) => ouvinte());

  const pronta = AsyncStorage.getItem(chave)
    .then((bruto) => {
      if (!bruto) return;
      const gravado: unknown = JSON.parse(bruto);
      if (gravado && typeof gravado === "object" && !Array.isArray(gravado)) {
        // Mescla sobre o inicial: campo novo de uma versão posterior do app
        // ganha o valor padrão em vez de `undefined`.
        estado = { ...inicial, ...(gravado as Partial<T>) };
      }
    })
    .catch(() => {
      // Conteúdo ilegível ou armazenamento indisponível: segue com o inicial.
    })
    .finally(() => {
      carregada = true;
      avisar();
    });

  return {
    pronta,
    ler: () => estado,
    foiCarregada: () => carregada,
    definir(atualizar) {
      estado = atualizar(estado);
      avisar();
      AsyncStorage.setItem(chave, JSON.stringify(estado)).catch(() => undefined);
    },
    async redefinir() {
      estado = inicial;
      avisar();
      await AsyncStorage.removeItem(chave).catch(() => undefined);
    },
    assinar(ouvinte) {
      ouvintes.add(ouvinte);
      return () => {
        ouvintes.delete(ouvinte);
      };
    },
  };
}

/** Lê o estado inteiro da loja. Selecione campos no componente. */
export function useLoja<T extends object>(loja: Loja<T>): T {
  return useSyncExternalStore(loja.assinar, loja.ler, loja.ler);
}

export function useLojaCarregada<T extends object>(loja: Loja<T>): boolean {
  return useSyncExternalStore(loja.assinar, loja.foiCarregada, loja.foiCarregada);
}
