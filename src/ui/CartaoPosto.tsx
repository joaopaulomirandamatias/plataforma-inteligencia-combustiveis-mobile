import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { nomeProprio } from "@/lib/formato";
import { cores } from "@/tema/tokens";
import { Etiqueta } from "@/ui/Etiqueta";
import { Cartao } from "@/ui/Superficies";
import { Texto } from "@/ui/Texto";

export interface PostoListado {
  posto_id: string;
  razao_social: string | null;
  bandeira?: string | null;
  municipio: string | null;
  uf: string | null;
}

export function localDoPosto(posto: Pick<PostoListado, "municipio" | "uf">): string {
  const cidade = nomeProprio(posto.municipio);
  return [cidade, posto.uf].filter(Boolean).join("/") || "Local não informado na fonte";
}

/**
 * Cartão de posto para listas. Mostra só o que a coleção da API devolve:
 * nome, bandeira e município. Sem preço, sem contagem e sem cor — uma lista
 * com números lado a lado seria lida como ranking.
 */
export function CartaoPosto({
  posto,
  complemento,
  rodape,
}: {
  posto: PostoListado;
  /** Linha extra sob o local (distância, data em que foi salvo). */
  complemento?: string | null;
  rodape?: ReactNode;
}) {
  const nome = nomeProprio(posto.razao_social) || "Nome não informado na fonte";
  return (
    <Cartao>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${nome}, ${localDoPosto(posto)}. Abrir ficha`}
        onPress={() => router.push(`/postos/${encodeURIComponent(posto.posto_id)}`)}
        style={({ pressed }) => [{ gap: 6, minHeight: 44 }, pressed ? { opacity: 0.7 } : null]}
      >
        <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
          <View style={{ flex: 1, gap: 1 }}>
            <Texto variante="destaque" accessibilityRole="header">
              {nome}
            </Texto>
            <Texto variante="pequeno" cor={cores.tintaSuave}>
              {localDoPosto(posto)}
            </Texto>
            {complemento ? <Texto variante="fonte">{complemento}</Texto> : null}
          </View>
          {posto.bandeira ? <Etiqueta>{nomeProprio(posto.bandeira)}</Etiqueta> : null}
        </View>
      </Pressable>
      {rodape}
    </Cartao>
  );
}
