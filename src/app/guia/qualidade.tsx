import { View } from "react-native";

import type { ClassificacaoPMQC } from "@/api/tipos";
import { MENSAGENS } from "@/lib/mensagens";
import { Classificacao } from "@/ui/Etiqueta";
import { Aviso, Cartao } from "@/ui/Superficies";
import { BarraTopo, Corpo, Tela } from "@/ui/Tela";
import { Texto } from "@/ui/Texto";

/**
 * Explicador de leitura de um resultado de ensaio. Só o que decorre do próprio
 * contrato da ficha (triestado, agrupamento derivado, recorte limitado).
 * Especificações, limites e números do programa ficam fora daqui até virem da
 * plataforma com a referência de cada um (backlog APP-10).
 */
export default function EntendaAQualidade() {
  return (
    <Tela>
      <BarraTopo titulo="Entenda a qualidade" />
      <Corpo>
        <Texto variante="titulo2" accessibilityRole="header">
          {MENSAGENS.entenda.titulo}
        </Texto>

        <Cartao>
          <Texto variante="rotulo" accessibilityRole="header">
            O que é um ensaio
          </Texto>
          <Texto variante="corpo" style={{ fontSize: 14 }}>
            {MENSAGENS.entenda.pmqc}
          </Texto>
        </Cartao>

        <Cartao>
          <Texto variante="rotulo" accessibilityRole="header">
            O que cada classificação diz
          </Texto>
          {MENSAGENS.entenda.leitura.map((item) => (
            <View key={item.classificacao} style={{ gap: 4 }}>
              <Classificacao classificacao={item.classificacao as ClassificacaoPMQC} />
              <Texto variante="corpo" style={{ fontSize: 14 }}>
                {item.texto}
              </Texto>
            </View>
          ))}
        </Cartao>

        <Cartao>
          <Texto variante="rotulo" accessibilityRole="header">
            Grupos de ensaios
          </Texto>
          <Texto variante="corpo" style={{ fontSize: 14 }}>
            {MENSAGENS.avisoAgrupamento}
          </Texto>
        </Cartao>

        <Cartao>
          <Texto variante="rotulo" accessibilityRole="header">
            Por que não há percentual
          </Texto>
          <Texto variante="corpo" style={{ fontSize: 14 }}>
            {MENSAGENS.entenda.numeros}
          </Texto>
        </Cartao>

        <Aviso>{MENSAGENS.entenda.ausencia}</Aviso>
        <Aviso>{MENSAGENS.avisoAmostragem}</Aviso>
      </Corpo>
    </Tela>
  );
}
