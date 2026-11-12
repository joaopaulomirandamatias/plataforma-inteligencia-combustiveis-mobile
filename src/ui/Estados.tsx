import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { cores, raio } from "@/tema/tokens";
import { Icone, type NomeIcone } from "@/ui/Icone";
import { Entrada, Pulso } from "@/ui/Movimento";
import { Cartao } from "@/ui/Superficies";
import { Texto } from "@/ui/Texto";

/** Estado de página inteira: vazio, erro, indisponível. Sempre com saída. */
export function EstadoMensagem({
  icone,
  titulo,
  corpo,
  detalhe,
  alerta,
  children,
}: {
  icone: NomeIcone;
  titulo: string;
  corpo: string;
  detalhe?: string;
  /** Erro do app: anunciado de imediato pelo leitor de tela. */
  alerta?: boolean;
  children?: ReactNode;
}) {
  return (
    <Entrada style={estilos.estado}>
      <View style={estilos.selo}>
        <Icone nome={icone} tamanho={30} cor={cores.petroleo} />
      </View>
      <Texto variante="titulo2" accessibilityRole={alerta ? "alert" : "header"}>
        {titulo}
      </Texto>
      <Texto variante="corpo" style={{ fontSize: 16, lineHeight: 23 }}>
        {corpo}
      </Texto>
      {detalhe ? (
        <Texto variante="pequeno" cor={cores.tintaSuave}>
          {detalhe}
        </Texto>
      ) : null}
      {children ? <View style={{ gap: 8, marginTop: 8 }}>{children}</View> : null}
    </Entrada>
  );
}

export function Carregando({ mensagem }: { mensagem: string }) {
  return (
    <View style={estilos.carregando} accessibilityRole="progressbar" accessibilityLabel={mensagem}>
      <ActivityIndicator color={cores.petroleo} />
      <Texto variante="corpoForte" cor={cores.petroleo}>
        {mensagem}
      </Texto>
    </View>
  );
}

function Osso({ largura, altura = 14 }: { largura: `${number}%` | number; altura?: number }) {
  return <View style={[estilos.osso, { width: largura, height: altura }]} />;
}

/** Esqueleto de cartão de posto, no lugar de um spinner de página inteira. */
export function EsqueletoCartao() {
  return (
    <Cartao accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Pulso style={{ gap: 10 }}>
        <Osso largura="72%" altura={18} />
        <Osso largura="54%" />
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Osso largura={140} altura={24} />
          <Osso largura={104} altura={24} />
        </View>
      </Pulso>
    </Cartao>
  );
}

export function EsqueletoLista({ mensagem, itens = 4 }: { mensagem: string; itens?: number }) {
  return (
    <View style={{ gap: 10 }}>
      <Carregando mensagem={mensagem} />
      {Array.from({ length: itens }, (_, i) => (
        <EsqueletoCartao key={i} />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  estado: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24, gap: 14 },
  selo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: cores.areia,
    alignItems: "center",
    justifyContent: "center",
  },
  carregando: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44 },
  osso: { backgroundColor: cores.areia, borderRadius: raio.etiqueta },
});
