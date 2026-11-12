import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { AgrupamentoPMQC, EnsaioPMQC, QualidadeCombustivel } from "@/api/tipos";
import { dataBr, nomeFonte, nomeProduto } from "@/lib/formato";
import { MENSAGENS } from "@/lib/mensagens";
import { contarEnsaios, resumirQualidade } from "@/lib/qualidade";
import { cores, TOQUE } from "@/tema/tokens";
import { Classificacao, Etiqueta } from "@/ui/Etiqueta";
import { Icone } from "@/ui/Icone";
import { Entrada } from "@/ui/Movimento";
import { Aviso, CabecalhoSecao, Cartao, Divisor, LinhaNavegacao } from "@/ui/Superficies";
import { Texto } from "@/ui/Texto";

function Indicador({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <View style={{ flex: 1 }} accessible accessibilityLabel={`${valor} ${rotulo}`}>
      <Texto variante="numero">{valor}</Texto>
      <Texto variante="pequeno" cor={cores.tintaSuave}>
        {rotulo}
      </Texto>
    </View>
  );
}

function LinhaEnsaio({ ensaio }: { ensaio: EnsaioPMQC }) {
  const resultado = ensaio.resultado
    ? `${ensaio.resultado}${ensaio.unidade ? ` ${ensaio.unidade}` : ""}`
    : "resultado não informado";
  return (
    <View
      style={estilos.ensaio}
      accessible
      accessibilityLabel={`${ensaio.ensaio}: ${resultado}, ${ensaio.classificacao}. Fonte ${nomeFonte(ensaio.fonte)}, coleta em ${dataBr(ensaio.data_coleta)}`}
    >
      <View style={estilos.linhaEntre}>
        <Texto variante="corpoMedio" style={{ flex: 1, fontSize: 14 }}>
          {ensaio.ensaio}
        </Texto>
        <Classificacao classificacao={ensaio.classificacao} />
      </View>
      {/* Resultado em linha própria: os textos reais da fonte são longos
          ("Límpido e isento de impurezas") e não cabem ao lado da procedência. */}
      <Texto variante="mono" style={{ fontSize: 13 }}>
        {resultado}
        {ensaio.resultado && !ensaio.unidade ? " · unidade não informada" : ""}
      </Texto>
      {/* Fonte e data repetidas em cada ensaio de propósito: o detalhe
          precisa continuar autocontido quando lido isoladamente. */}
      <Texto variante="fonte">
        {nomeFonte(ensaio.fonte)} · {dataBr(ensaio.data_coleta)}
      </Texto>
    </View>
  );
}

function CartaoAgrupamento({ agrupamento, abertoDeInicio }: { agrupamento: AgrupamentoPMQC; abertoDeInicio: boolean }) {
  const [aberto, setAberto] = useState(abertoDeInicio);
  const contagens = contarEnsaios(agrupamento.ensaios);
  const total = agrupamento.ensaios.length;
  const rotuloEnsaios = `${total} ${total === 1 ? "ensaio" : "ensaios"}`;

  return (
    <Cartao>
      <View style={[estilos.linhaEntre, { alignItems: "flex-start" }]}>
        <View style={{ flex: 1 }}>
          <Texto variante="destaque" accessibilityRole="header">
            {nomeProduto(agrupamento.produto)}
          </Texto>
          <Texto variante="fonte">
            Coleta em {dataBr(agrupamento.data_coleta)} · {nomeFonte(agrupamento.fonte)}
          </Texto>
        </View>
        <Etiqueta>{rotuloEnsaios}</Etiqueta>
      </View>

      <View style={estilos.fileira}>
        {contagens.conforme > 0 ? <Classificacao classificacao="conforme" contagem={contagens.conforme} /> : null}
        {contagens.nao_conforme > 0 ? (
          <Classificacao classificacao="não conforme" contagem={contagens.nao_conforme} />
        ) : null}
        {contagens.nao_classificado > 0 ? (
          <Classificacao classificacao="não classificado" contagem={contagens.nao_classificado} />
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        accessibilityLabel={`${aberto ? "Ocultar" : "Mostrar"} os ${rotuloEnsaios} de ${nomeProduto(agrupamento.produto)}, coleta em ${dataBr(agrupamento.data_coleta)}`}
        onPress={() => setAberto((atual) => !atual)}
        style={estilos.revelar}
      >
        <Texto variante="pequenoForte" cor={cores.petroleo3} style={{ fontSize: 14 }}>
          {aberto ? "Ocultar" : "Mostrar"} os {rotuloEnsaios}
        </Texto>
        <Icone nome={aberto ? "acima" : "abaixo"} cor={cores.petroleo3} />
      </Pressable>

      {aberto ? (
        <Entrada style={{ marginTop: -10 }}>
          {agrupamento.ensaios.map((ensaio, indice) => (
            // Chave montada só com dado que já está na tela (política de
            // linguagem: `key` nunca leva dado de auditoria).
            <LinhaEnsaio key={`${ensaio.ensaio}-${indice}`} ensaio={ensaio} />
          ))}
        </Entrada>
      ) : null}
    </Cartao>
  );
}

export function SecaoQualidade({ qualidade }: { qualidade: QualidadeCombustivel }) {
  const resumo = resumirQualidade(qualidade);

  if (resumo.agrupamentos === 0) {
    return (
      <View style={{ gap: 12 }}>
        <CabecalhoSecao titulo="Ensaios publicados nesta ficha" etiqueta="ANP · PMQC" />
        <Cartao tipo="vazio" style={{ paddingVertical: 20 }}>
          <Etiqueta tipo="vazia">{MENSAGENS.semQualidade.etiqueta}</Etiqueta>
          <Texto variante="destaque" cor={cores.petroleo}>
            {MENSAGENS.semQualidade.titulo}
          </Texto>
          <Texto variante="corpo" style={{ fontSize: 14 }}>
            {MENSAGENS.semQualidade.corpo}
          </Texto>
        </Cartao>
        <Cartao>
          <Texto variante="rotulo" accessibilityRole="header">
            Por que isso acontece
          </Texto>
          {MENSAGENS.semQualidade.motivos.map((motivo, indice) => (
            <View key={motivo} style={{ flexDirection: "row", gap: 10 }}>
              <Texto variante="mono" cor={cores.petroleo3}>
                {indice + 1}
              </Texto>
              <Texto variante="corpo" style={{ flex: 1, fontSize: 14 }}>
                {motivo}
              </Texto>
            </View>
          ))}
        </Cartao>
        <Cartao style={{ paddingVertical: 2, gap: 0 }}>
          <LinhaNavegacao
            titulo="Como ler um resultado"
            subtitulo="O que cada classificação diz e o que ela não diz"
            onPress={() => router.push("/guia/qualidade")}
            ultima
          />
        </Cartao>
      </View>
    );
  }

  const periodo = resumo.periodo;
  return (
    <View style={{ gap: 12 }}>
      <CabecalhoSecao titulo="Ensaios publicados nesta ficha" etiqueta="ANP · PMQC" />

      <Cartao>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Indicador valor={resumo.agrupamentos} rotulo={resumo.agrupamentos === 1 ? "grupo de ensaios" : "grupos de ensaios"} />
          <Indicador valor={resumo.ensaios} rotulo={resumo.ensaios === 1 ? "ensaio" : "ensaios"} />
          <Indicador valor={resumo.produtos.length} rotulo={resumo.produtos.length === 1 ? "produto" : "produtos"} />
        </View>
        <Divisor />
        {/* Três números separados, sempre. O app não calcula percentual. */}
        <View style={estilos.fileira} accessibilityLabel="Resultados por classificação publicada pela fonte">
          <Classificacao classificacao="conforme" contagem={resumo.contagens.conforme} />
          <Classificacao classificacao="não conforme" contagem={resumo.contagens.nao_conforme} />
          <Classificacao classificacao="não classificado" contagem={resumo.contagens.nao_classificado} />
        </View>
        <Texto variante="pequeno">
          {periodo && periodo.inicio !== periodo.fim
            ? `Coletas de ${dataBr(periodo.inicio)} a ${dataBr(periodo.fim)}. `
            : periodo
              ? `Coleta em ${dataBr(periodo.inicio)}. `
              : ""}
          {resumo.truncado ? MENSAGENS.recorteTruncado(resumo.limite) : MENSAGENS.recorteCompleto}
        </Texto>
      </Cartao>

      {qualidade.agrupamentos.map((agrupamento, indice) => (
        <CartaoAgrupamento
          key={`${agrupamento.data_coleta}-${agrupamento.produto}-${indice}`}
          agrupamento={agrupamento}
          abertoDeInicio={indice === 0}
        />
      ))}

      <Aviso>{MENSAGENS.avisoAmostragem}</Aviso>
      <Cartao style={{ paddingVertical: 2, gap: 0 }}>
        <LinhaNavegacao
          titulo="Como ler um resultado"
          subtitulo="O que cada classificação diz e o que ela não diz"
          onPress={() => router.push("/guia/qualidade")}
          ultima
        />
      </Cartao>
    </View>
  );
}

const estilos = StyleSheet.create({
  linhaEntre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  fileira: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  revelar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: TOQUE,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  ensaio: { paddingVertical: 9, gap: 4, borderTopWidth: 1, borderTopColor: cores.linha },
});
