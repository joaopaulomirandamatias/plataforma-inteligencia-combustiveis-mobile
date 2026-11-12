import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { lojaPreferencias } from "@/armazenamento/usuario";
import { MENSAGENS } from "@/lib/mensagens";
import { cores, fontes, raio } from "@/tema/tokens";
import { Botao } from "@/ui/Botao";
import { Icone } from "@/ui/Icone";
import { Entrada } from "@/ui/Movimento";
import { Texto } from "@/ui/Texto";

function concluir(destino: "/" | "/sobre") {
  lojaPreferencias.definir((atual) => ({ ...atual, viuBoasVindas: true }));
  router.replace("/");
  if (destino === "/sobre") router.push("/sobre");
}

export default function BoasVindas() {
  const margens = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cores.petroleo }}
      contentContainerStyle={[estilos.conteudo, { paddingTop: margens.top + 28, paddingBottom: margens.bottom + 24 }]}
    >
      <View style={estilos.marca}>
        <View style={estilos.selo}>
          <Icone nome="gota" tamanho={24} cor={cores.petroleo} />
        </View>
        <View>
          <Texto variante="destaque" cor={cores.branco}>
            Combustível em Dia
          </Texto>
          <Texto variante="pequeno" cor={cores.sobrePetroleoSuave}>
            consulta pública
          </Texto>
        </View>
      </View>

      {/* Os dois cartões antecipam a linguagem de procedência usada no app. */}
      <Entrada atraso={80} style={{ gap: 8, marginTop: 32 }}>
      <View style={{ gap: 8 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[estilos.amostra, estilos.amostraOficial]}>
          <View style={[estilos.etiqueta, { backgroundColor: cores.branco }]}>
            <Icone nome="escudo" tamanho={14} cor={cores.petroleo} />
            <Texto variante="pequenoForte" cor={cores.petroleo} style={estilos.textoEtiqueta}>
              Fonte oficial
            </Texto>
          </View>
          <Texto variante="corpoForte" cor={cores.branco} style={{ fontSize: 14 }}>
            Ensaio de massa específica
          </Texto>
          <Texto variante="fonte" cor={cores.sobrePetroleoSuave}>
            ANP · PMQC · data da coleta
          </Texto>
        </View>
        <View style={[estilos.amostra, estilos.amostraDeclarada]}>
          <View style={[estilos.etiqueta, estilos.etiquetaTracejada]}>
            <Icone nome="lapis" tamanho={14} cor={cores.branco} />
            <Texto variante="pequenoForte" cor={cores.branco} style={estilos.textoEtiqueta}>
              Declarado pelo posto
            </Texto>
          </View>
          <Texto variante="corpoForte" cor={cores.branco} style={{ fontSize: 14 }}>
            Horário de funcionamento
          </Texto>
          <Texto variante="fonte" cor={cores.sobrePetroleoSuave}>
            informado pelo posto · com data
          </Texto>
        </View>
      </View>

      </Entrada>

      <Entrada atraso={200}>
        <Texto style={estilos.titulo} accessibilityRole="header">
          {MENSAGENS.boasVindas.titulo}
        </Texto>
      </Entrada>

      <Entrada atraso={320} style={{ gap: 16, marginTop: 22 }}>
        {MENSAGENS.boasVindas.pontos.map((ponto) => (
          <View key={ponto.titulo} style={estilos.ponto}>
            <View style={{ marginTop: 2 }}>
              <Icone nome="marca" cor={cores.ambar} />
            </View>
            <View style={{ flex: 1 }}>
              <Texto variante="corpoForte" cor={cores.branco}>
                {ponto.titulo}
              </Texto>
              <Texto variante="pequeno" cor={cores.sobrePetroleoSuave} style={{ fontSize: 14 }}>
                {ponto.corpo}
              </Texto>
            </View>
          </View>
        ))}
      </Entrada>

      <Entrada atraso={440} style={{ gap: 8, marginTop: 32 }}>
        <Botao rotulo="Começar a consultar" onPress={() => concluir("/")} />
        <Botao
          rotulo="Como os dados são reunidos"
          variante="texto"
          onPress={() => concluir("/sobre")}
          estilo={{ backgroundColor: "transparent" }}
        />
        <Texto variante="pequeno" cor={cores.sobrePetroleoSuave} centro>
          {MENSAGENS.boasVindas.rodape}
        </Texto>
      </Entrada>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingHorizontal: 24, flexGrow: 1 },
  marca: { flexDirection: "row", alignItems: "center", gap: 10 },
  selo: {
    width: 44,
    height: 44,
    borderRadius: raio.controle,
    backgroundColor: cores.ambar,
    alignItems: "center",
    justifyContent: "center",
  },
  amostra: { borderRadius: raio.cartao, padding: 12, gap: 4, backgroundColor: cores.petroleo2 },
  amostraOficial: { borderWidth: 1, borderColor: cores.petroleoLinha, marginRight: 48 },
  amostraDeclarada: { borderWidth: 1.5, borderColor: "#6f9ab0", borderStyle: "dashed", marginLeft: 48 },
  etiqueta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: raio.etiqueta,
    marginBottom: 4,
  },
  etiquetaTracejada: { borderWidth: 1.5, borderColor: cores.sobrePetroleoSuave, borderStyle: "dashed" },
  textoEtiqueta: { fontSize: 12, lineHeight: 16 },
  titulo: { fontFamily: fontes.titulo, fontSize: 36, lineHeight: 40, color: cores.branco, marginTop: 28 },
  ponto: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
});
