import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { usePosto } from "@/api/consultas";
import { cnpjBr, nomeProprio } from "@/lib/formato";
import { abrirFora } from "@/lib/links";
import { MENSAGENS } from "@/lib/mensagens";
import { cores, fontes, raio, TOQUE } from "@/tema/tokens";
import { Botao } from "@/ui/Botao";
import { Icone } from "@/ui/Icone";
import { Cartao } from "@/ui/Superficies";
import { BarraTopo, Corpo, Tela } from "@/ui/Tela";
import { Texto } from "@/ui/Texto";

/**
 * Canais oficiais. O app não recebe reclamação (fora do escopo do produto):
 * ele só aponta o caminho e, quando aberto a partir de uma ficha, deixa os
 * dados PÚBLICOS do posto prontos para colar. Nada do usuário é enviado.
 *
 * Só há telefone onde ele foi conferido em fonte oficial. Os contatos por
 * estado dependem de conteúdo servido pela plataforma (backlog APP-10).
 */
export default function CanaisOficiais() {
  const { posto: postoId } = useLocalSearchParams<{ posto?: string }>();
  // Lê do cache quando a ficha já foi aberta; não é uma consulta nova de propósito.
  const posto = usePosto(typeof postoId === "string" && postoId ? postoId : undefined).data;
  const [copiado, setCopiado] = useState(false);

  const dadosDoPosto = posto
    ? [
        nomeProprio(posto.razao_social),
        posto.cnpj ? `CNPJ ${cnpjBr(posto.cnpj)}` : null,
        [nomeProprio(posto.endereco), nomeProprio(posto.municipio), posto.uf].filter(Boolean).join(", "),
      ]
        .filter(Boolean)
        .join("\n")
    : null;

  return (
    <Tela>
      <BarraTopo titulo="Canais oficiais" />
      <Corpo>
        <Texto variante="corpo" style={{ fontSize: 14 }}>
          {MENSAGENS.canais.intro}
        </Texto>

        <Cartao style={{ paddingVertical: 4, gap: 0 }}>
          {MENSAGENS.canais.itens.map((canal, indice) => {
            const conteudo = (
              <>
                <View style={{ flex: 1, gap: 1 }}>
                  <Texto variante="corpoForte">{canal.orgao}</Texto>
                  <Texto variante="pequeno" cor={cores.tintaSuave}>
                    {canal.assunto}
                  </Texto>
                  {canal.telefone ? (
                    <Texto style={{ fontFamily: fontes.monoForte, fontSize: 15, color: cores.petroleo3 }}>
                      {canal.telefone}
                    </Texto>
                  ) : null}
                </View>
                {canal.telefone ? <Icone nome="telefone" cor={cores.petroleo3} /> : null}
              </>
            );
            const estilo = [
              { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, minHeight: TOQUE + 8, paddingVertical: 11 },
              indice > 0 ? { borderTopWidth: 1, borderTopColor: cores.linha } : null,
            ];
            return canal.telefone ? (
              <Pressable
                key={canal.orgao}
                accessibilityRole="link"
                accessibilityLabel={`${canal.orgao}. ${canal.assunto}. Ligar para ${canal.telefone}`}
                onPress={() => void abrirFora(`tel:${(canal.telefone as string).replace(/\D/g, "")}`)}
                style={estilo}
              >
                {conteudo}
              </Pressable>
            ) : (
              <View key={canal.orgao} style={estilo}>
                {conteudo}
              </View>
            );
          })}
        </Cartao>
        <Texto variante="pequeno" cor={cores.tintaSuave}>
          {MENSAGENS.canais.pendente}
        </Texto>

        <Cartao>
          <Texto variante="rotulo" accessibilityRole="header">
            Tenha em mãos
          </Texto>
          <Texto variante="corpo" style={{ fontSize: 14 }}>
            {MENSAGENS.canais.tenhaEmMaos}
          </Texto>
          {dadosDoPosto ? (
            <>
              <View style={{ padding: 12, borderRadius: raio.controle, backgroundColor: cores.papel }}>
                <Texto selectable style={{ fontFamily: fontes.mono, fontSize: 13, lineHeight: 19, color: cores.tinta }}>
                  {dadosDoPosto}
                </Texto>
              </View>
              <Botao
                rotulo={copiado ? "Dados do posto copiados" : "Copiar dados do posto"}
                icone={copiado ? "marca" : "copiar"}
                variante="secundario"
                compacto
                onPress={() => void Clipboard.setStringAsync(dadosDoPosto).then(setCopiado)}
              />
              <Texto variante="pequeno" cor={cores.tintaSuave}>
                {MENSAGENS.canais.copia}
              </Texto>
            </>
          ) : null}
        </Cartao>
      </Corpo>
    </Tela>
  );
}
