import { router } from "expo-router";
import { View } from "react-native";

import { MENSAGENS } from "@/lib/mensagens";
import { cores } from "@/tema/tokens";
import { Botao } from "@/ui/Botao";
import { Chave } from "@/ui/Controles";
import { Etiqueta } from "@/ui/Etiqueta";
import { Aviso, Cartao, Divisor } from "@/ui/Superficies";
import { BarraTopo, Corpo, Tela } from "@/ui/Tela";
import { Texto } from "@/ui/Texto";

/**
 * Tipos de aviso previstos no mockup (tela 16). Ficam visíveis e DESLIGADOS:
 * avisar exige serviço de notificações no backend (registro de aparelho,
 * detecção de publicação nova e envio), que ainda não existe. O app não finge
 * o recurso guardando interruptores que nada fariam.
 */
const TIPOS_DE_AVISO = [
  { rotulo: "Novos ensaios de qualidade", descricao: "Quando a ANP publicar resultados do PMQC" },
  { rotulo: "Novo preço observado", descricao: "Quando a pesquisa semanal passar pelo posto" },
  { rotulo: "Mudança no cadastro", descricao: "Bandeira, razão social ou situação na ANP" },
];

export default function Alertas() {
  return (
    <Tela>
      <BarraTopo titulo="Alertas" voltar={false} />
      <Corpo>
        <Aviso>{MENSAGENS.alertas.explicacao}</Aviso>

        <Cartao tipo="vazio">
          <Etiqueta tipo="vazia">Em construção</Etiqueta>
          <Texto variante="destaque" cor={cores.petroleo} accessibilityRole="header">
            {MENSAGENS.alertas.emBreve.titulo}
          </Texto>
          <Texto variante="corpo" style={{ fontSize: 14 }}>
            {MENSAGENS.alertas.emBreve.corpo}
          </Texto>
        </Cartao>

        <Texto variante="rotulo" accessibilityRole="header">
          O que será possível acompanhar
        </Texto>
        <Cartao style={{ paddingVertical: 2, gap: 0 }}>
          {TIPOS_DE_AVISO.map((tipo, indice) => (
            <View key={tipo.rotulo}>
              {indice > 0 ? <Divisor /> : null}
              <Chave
                rotulo={tipo.rotulo}
                descricao={tipo.descricao}
                valor={false}
                desabilitada
                direita={<Etiqueta tipo="vazia">Indisponível</Etiqueta>}
              />
            </View>
          ))}
        </Cartao>

        <Botao rotulo="Ver meus favoritos" variante="secundario" onPress={() => router.navigate("/favoritos")} />
      </Corpo>
    </Tela>
  );
}
