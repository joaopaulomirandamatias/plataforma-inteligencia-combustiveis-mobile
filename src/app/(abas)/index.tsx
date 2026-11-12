import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BUSCA_MINIMA } from "@/api/cliente";
import { useSaude } from "@/api/consultas";
import { useLoja } from "@/armazenamento/loja";
import { lojaPreferencias, lojaRecentes } from "@/armazenamento/usuario";
import { dataBr, nomeFonte, nomeProprio } from "@/lib/formato";
import { MENSAGENS } from "@/lib/mensagens";
import { cores, raio } from "@/tema/tokens";
import { Botao } from "@/ui/Botao";
import { localDoPosto } from "@/ui/CartaoPosto";
import { Campo } from "@/ui/Controles";
import { Icone } from "@/ui/Icone";
import { SeletorUf } from "@/ui/SeletorUf";
import { Cartao, LinhaNavegacao } from "@/ui/Superficies";
import { Texto } from "@/ui/Texto";

/** Fontes cujo frescor interessa ao consumidor, na ordem da ficha. */
const FONTES_NO_INICIO = ["F01", "F02", "F03"];

export default function Inicio() {
  const margens = useSafeAreaInsets();
  const preferencias = useLoja(lojaPreferencias);
  const recentes = useLoja(lojaRecentes).itens;
  const saude = useSaude();

  const [termo, setTermo] = useState("");
  const [uf, setUf] = useState(preferencias.uf);
  const [municipio, setMunicipio] = useState(preferencias.municipio);
  const [erro, setErro] = useState<string | null>(null);

  function buscar() {
    const q = termo.trim();
    if (q.length > 0 && q.length < BUSCA_MINIMA) {
      setErro(MENSAGENS.buscaCurta(BUSCA_MINIMA));
      return;
    }
    if (q.length === 0 && !uf) {
      setErro(MENSAGENS.buscaSemRecorte);
      return;
    }
    setErro(null);
    lojaPreferencias.definir((atual) => ({ ...atual, uf, municipio: municipio.trim() }));
    router.push({ pathname: "/postos", params: { q, uf, municipio: municipio.trim() } });
  }

  const cargas = (saude.data?.cargas ?? []).filter((carga) => FONTES_NO_INICIO.includes(carga.fonte));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cores.papel }}
      contentContainerStyle={{ paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[estilos.topo, { paddingTop: margens.top + 20 }]}>
        <View style={estilos.marca}>
          <View style={estilos.selo}>
            <Icone nome="gota" cor={cores.petroleo} />
          </View>
          <View>
            <Texto variante="corpoForte" cor={cores.branco}>
              Combustível em Dia
            </Texto>
            <Texto variante="pequeno" cor={cores.sobrePetroleoSuave}>
              consulta pública
            </Texto>
          </View>
        </View>
        <Texto variante="titulo1" cor={cores.branco} accessibilityRole="header" style={{ marginTop: 16 }}>
          Consulte um posto nos dados oficiais
        </Texto>

        <View style={{ gap: 10, marginTop: 16 }} accessibilityRole="search">
          <Campo
            rotulo="Nome do posto ou CNPJ"
            corRotulo={cores.sobrePetroleoSuave}
            icone="busca"
            placeholder="Ex.: Posto Exemplo ou 00.000.000/0001-00"
            value={termo}
            onChangeText={(novo) => {
              setTermo(novo);
              if (erro) setErro(null);
            }}
            onSubmitEditing={buscar}
            returnKeyType="search"
            autoCorrect={false}
            erro={erro}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <SeletorUf valor={uf} aoMudar={setUf} corRotulo={cores.sobrePetroleoSuave} />
            <Campo
              rotulo="Cidade (opcional)"
              corRotulo={cores.sobrePetroleoSuave}
              placeholder="Como no cadastro da ANP"
              value={municipio}
              onChangeText={setMunicipio}
              onSubmitEditing={buscar}
              returnKeyType="search"
              autoCorrect={false}
              estilo={{ flex: 1 }}
            />
          </View>
          <Botao rotulo="Buscar postos" onPress={buscar} estilo={{ marginTop: 4 }} />
        </View>
      </View>

      <View style={estilos.corpo}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Postos perto de mim. Pede sua localização só neste momento"
          onPress={() => router.push("/mapa")}
          style={({ pressed }) => [estilos.atalho, pressed ? { opacity: 0.75 } : null]}
        >
          <View style={estilos.atalhoIcone}>
            <Icone nome="alvo" cor={cores.petroleo} />
          </View>
          <View style={{ flex: 1 }}>
            <Texto variante="corpoForte">Postos perto de mim</Texto>
            <Texto variante="pequeno" cor={cores.tintaSuave}>
              Pede sua localização só neste momento
            </Texto>
          </View>
          <Icone nome="avancar" cor={cores.tintaSuave} />
        </Pressable>

        {recentes.length > 0 ? (
          <View style={{ gap: 6 }}>
            <View style={estilos.cabecalho}>
              <Texto variante="rotulo" accessibilityRole="header">
                Consultas recentes
              </Texto>
              <Texto variante="pequeno" cor={cores.tintaSuave} style={{ fontSize: 12 }}>
                ficam só neste aparelho
              </Texto>
            </View>
            <Cartao style={{ paddingVertical: 0, gap: 0 }}>
              {recentes.map((posto, indice) => (
                <LinhaNavegacao
                  key={posto.posto_id}
                  icone="relogio"
                  titulo={nomeProprio(posto.razao_social) || "Nome não informado na fonte"}
                  subtitulo={localDoPosto(posto)}
                  ultima={indice === recentes.length - 1}
                  onPress={() => router.push(`/postos/${encodeURIComponent(posto.posto_id)}`)}
                />
              ))}
            </Cartao>
          </View>
        ) : null}

        <View style={{ gap: 6 }}>
          <View style={estilos.cabecalho}>
            <Texto variante="rotulo" accessibilityRole="header" style={{ flex: 1 }}>
              Última leitura de cada fonte
            </Texto>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push("/sobre")}
              hitSlop={12}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Texto variante="pequenoForte" cor={cores.petroleo3} style={{ textDecorationLine: "underline" }}>
                Sobre os dados
              </Texto>
            </Pressable>
          </View>
          <Cartao style={{ marginTop: -6 }}>
            {cargas.length > 0 ? (
              cargas.map((carga) => (
                <View key={carga.fonte} style={estilos.frescor}>
                  <Texto variante="corpoMedio" style={{ fontSize: 14 }}>
                    {nomeFonte(carga.fonte)}
                  </Texto>
                  <Texto variante="fonte">lida em {dataBr(carga.coletado_em)}</Texto>
                </View>
              ))
            ) : (
              <Texto variante="pequeno" cor={cores.tintaSuave}>
                {saude.isPending ? MENSAGENS.carregando : "Datas de leitura indisponíveis no momento."}
              </Texto>
            )}
          </Cartao>
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  topo: { backgroundColor: cores.petroleo, paddingHorizontal: 16, paddingBottom: 20 },
  marca: { flexDirection: "row", alignItems: "center", gap: 10 },
  selo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: cores.ambar,
    alignItems: "center",
    justifyContent: "center",
  },
  corpo: { padding: 16, gap: 14 },
  atalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    padding: 14,
    borderRadius: raio.cartao,
    borderWidth: 1,
    borderColor: cores.linha,
    backgroundColor: cores.branco,
  },
  atalhoIcone: {
    width: 40,
    height: 40,
    borderRadius: raio.controle,
    backgroundColor: cores.azulClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  cabecalho: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  frescor: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
});
