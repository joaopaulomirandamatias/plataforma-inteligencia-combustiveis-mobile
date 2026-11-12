import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cores, raio, TOQUE } from "@/tema/tokens";
import { BotaoIcone } from "@/ui/Botao";
import { Icone } from "@/ui/Icone";
import { Texto } from "@/ui/Texto";

export const UFS = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"], ["BA", "Bahia"],
  ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"], ["GO", "Goiás"],
  ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"], ["MG", "Minas Gerais"],
  ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"], ["PE", "Pernambuco"], ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"], ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"], ["SP", "São Paulo"],
  ["SE", "Sergipe"], ["TO", "Tocantins"],
] as const;

export function SeletorUf({
  valor,
  aoMudar,
  corRotulo,
}: {
  valor: string;
  aoMudar: (uf: string) => void;
  corRotulo?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const margens = useSafeAreaInsets();
  const escolher = (uf: string) => {
    aoMudar(uf);
    setAberto(false);
  };

  return (
    <View style={{ gap: 6, width: 104 }}>
      <Texto variante="pequenoForte" cor={corRotulo ?? cores.tinta}>
        Estado
      </Texto>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={valor ? `Estado: ${valor}. Trocar` : "Escolher estado"}
        onPress={() => setAberto(true)}
        style={estilos.campo}
      >
        <Texto variante="corpoMedio" cor={valor ? cores.tinta : cores.tintaSuave} style={{ fontSize: 16 }}>
          {valor || "Todos"}
        </Texto>
        <Icone nome="abaixo" tamanho={16} cor={cores.tintaSuave} />
      </Pressable>

      <Modal visible={aberto} animationType="slide" transparent onRequestClose={() => setAberto(false)}>
        <Pressable style={estilos.veu} onPress={() => setAberto(false)} accessibilityLabel="Fechar" />
        <View style={[estilos.folha, { paddingBottom: margens.bottom + 8 }]} accessibilityViewIsModal>
          <View style={estilos.cabecalho}>
            <Texto variante="titulo2" accessibilityRole="header" style={{ flex: 1 }}>
              Estado
            </Texto>
            <BotaoIcone rotuloAcessivel="Fechar" icone="fechar" cor={cores.petroleo} onPress={() => setAberto(false)} />
          </View>
          <FlatList
            data={[["", "Todos os estados"] as const, ...UFS]}
            keyExtractor={([sigla]) => sigla || "todos"}
            renderItem={({ item: [sigla, nome] }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: sigla === valor }}
                onPress={() => escolher(sigla)}
                style={estilos.opcao}
              >
                <Texto variante={sigla === valor ? "corpoForte" : "corpo"} style={{ flex: 1 }}>
                  {nome}
                </Texto>
                {sigla ? <Texto variante="mono" cor={cores.tintaSuave}>{sigla}</Texto> : null}
                {sigla === valor ? <Icone nome="marca" cor={cores.petroleo} /> : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raio.controle,
    backgroundColor: cores.branco,
  },
  veu: { flex: 1, backgroundColor: "rgba(12,39,51,0.55)" },
  folha: {
    maxHeight: "75%",
    backgroundColor: cores.branco,
    borderTopLeftRadius: raio.folha,
    borderTopRightRadius: raio.folha,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cabecalho: { flexDirection: "row", alignItems: "center" },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: TOQUE + 4,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
});
