import { View } from "react-native";

import { abrirFora, origemDoSite } from "@/lib/links";
import { FONTES_DO_APP, MENSAGENS } from "@/lib/mensagens";
import { AVISO_INTERPRETACAO } from "@/lib/politica";
import { cores } from "@/tema/tokens";
import { Etiqueta } from "@/ui/Etiqueta";
import { Icone } from "@/ui/Icone";
import { Aviso, Cartao, LinhaNavegacao } from "@/ui/Superficies";
import { BarraTopo, Corpo, Tela } from "@/ui/Tela";
import { Texto } from "@/ui/Texto";

export default function SobreOsDados() {
  return (
    <Tela>
      <BarraTopo titulo="Sobre os dados" />
      <Corpo>
        <Texto variante="titulo2" accessibilityRole="header">
          De onde vêm as informações
        </Texto>
        <Texto variante="corpo" style={{ fontSize: 14 }}>
          O app não cria registros sobre os postos: ele reúne publicações oficiais e mostra a origem de cada uma.
        </Texto>

        <Cartao style={{ paddingVertical: 4, gap: 0 }}>
          {FONTES_DO_APP.map((fonte, indice) => (
            <View
              key={fonte.sigla}
              style={[{ paddingVertical: 9, gap: 4 }, indice > 0 ? { borderTopWidth: 1, borderTopColor: cores.linha } : null]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Texto variante="corpoForte" style={{ flex: 1 }}>
                  {fonte.sigla}
                </Texto>
                <Etiqueta>{fonte.status}</Etiqueta>
              </View>
              <Texto variante="pequeno" cor={cores.tintaSuave}>
                {fonte.descricao}
              </Texto>
            </View>
          ))}
        </Cartao>

        <Texto variante="rotulo" accessibilityRole="header">
          O que este app não faz
        </Texto>
        <Cartao>
          {MENSAGENS.naoFaz.map((item) => (
            <View key={item} style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ marginTop: 2 }}>
                <Icone nome="fechar" cor={cores.tintaSuave} />
              </View>
              <Texto variante="corpo" style={{ flex: 1, fontSize: 14 }}>
                {item}
              </Texto>
            </View>
          ))}
        </Cartao>

        <Aviso>{AVISO_INTERPRETACAO}</Aviso>

        <Cartao style={{ paddingVertical: 2, gap: 0 }}>
          <LinhaNavegacao
            titulo="Metodologia completa no portal"
            iconeDireita="externo"
            onPress={() => void abrirFora(`${origemDoSite()}/sobre`)}
            ultima
          />
        </Cartao>
      </Corpo>
    </Tela>
  );
}
