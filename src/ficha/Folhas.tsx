import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Platform, Share, View } from "react-native";

import { asOfDoDia, formatarDataBr, interpretarDataBr, mascararData, mesesAtras, mesmoDia } from "@/lib/datas";
import { dataBr } from "@/lib/formato";
import { linkDaFicha } from "@/lib/links";
import { MENSAGENS } from "@/lib/mensagens";
import { cores, fontes, raio } from "@/tema/tokens";
import { Botao } from "@/ui/Botao";
import { Campo, Chip } from "@/ui/Controles";
import { Folha, OpcaoUnica } from "@/ui/Folha";
import { Aviso } from "@/ui/Superficies";
import { Texto } from "@/ui/Texto";

/* -------------------------------------------------------------------------- */
/* Ver a ficha em outra data                                                   */
/* -------------------------------------------------------------------------- */

const ATALHOS = [
  { rotulo: "1 mês atrás", meses: 1 },
  { rotulo: "6 meses atrás", meses: 6 },
  { rotulo: "1 ano atrás", meses: 12 },
];

export function FolhaOutraData({
  visivel,
  aoFechar,
  aoEscolher,
}: {
  visivel: boolean;
  aoFechar: () => void;
  /** `null` = voltar para a visão atual. */
  aoEscolher: (asOf: string | null) => void;
}) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function aplicar() {
    const dia = interpretarDataBr(texto);
    if (!dia) {
      setErro(MENSAGENS.outraData.invalida);
      return;
    }
    const agora = new Date();
    if (dia.getTime() > agora.getTime()) {
      setErro(MENSAGENS.outraData.futura);
      return;
    }
    setErro(null);
    aoEscolher(mesmoDia(dia, agora) ? null : asOfDoDia(dia));
  }

  return (
    <Folha visivel={visivel} titulo="Ver a ficha em outra data" aoFechar={aoFechar}>
      <Texto variante="corpo" style={{ fontSize: 14 }}>
        {MENSAGENS.outraData.explicacao}
      </Texto>
      <Campo
        rotulo="Data (dia/mês/ano)"
        placeholder="dd/mm/aaaa"
        value={texto}
        onChangeText={(novo) => {
          setTexto(mascararData(novo));
          if (erro) setErro(null);
        }}
        onSubmitEditing={aplicar}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={10}
        erro={erro}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }} accessibilityLabel="Atalhos de data">
        {ATALHOS.map((atalho) => {
          const valor = formatarDataBr(mesesAtras(atalho.meses, new Date()));
          return (
            <Chip
              key={atalho.rotulo}
              rotulo={atalho.rotulo}
              ativo={texto === valor}
              onPress={() => {
                setTexto(valor);
                setErro(null);
              }}
            />
          );
        })}
      </View>
      <Aviso>{MENSAGENS.outraData.aviso}</Aviso>
      <Botao rotulo={interpretarDataBr(texto) ? `Ver a ficha em ${texto}` : "Ver a ficha nesta data"} onPress={aplicar} />
      <Botao rotulo="Voltar para a visão atual" variante="texto" onPress={() => aoEscolher(null)} />
    </Folha>
  );
}

/* -------------------------------------------------------------------------- */
/* Compartilhar                                                                */
/* -------------------------------------------------------------------------- */

export function FolhaCompartilhar({
  visivel,
  aoFechar,
  postoId,
  nome,
  local,
  asOf,
}: {
  visivel: boolean;
  aoFechar: () => void;
  postoId: string;
  nome: string;
  local: string;
  /** Instante da visão em tela, como a API devolveu. */
  asOf: string;
}) {
  const [fixo, setFixo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const url = linkDaFicha(postoId, fixo ? asOf : null);

  async function copiar() {
    setCopiado(await Clipboard.setStringAsync(url));
  }

  async function enviar() {
    try {
      await Share.share(Platform.OS === "ios" ? { url, message: nome } : { message: `${nome}\n${url}` });
    } catch {
      // Cancelado ou indisponível (navegador sem a API de compartilhar):
      // o link continua à vista e copiável.
    }
  }

  return (
    <Folha visivel={visivel} titulo="Compartilhar esta ficha" aoFechar={aoFechar}>
      <View style={{ borderRadius: raio.cartao, overflow: "hidden", borderWidth: 1, borderColor: cores.linha }}>
        <View style={{ backgroundColor: cores.petroleo, padding: 14, gap: 2 }}>
          <Texto variante="pequenoForte" cor={cores.ambar} style={{ fontSize: 12 }}>
            Combustível em Dia · consulta pública
          </Texto>
          <Texto variante="titulo3" cor={cores.branco}>
            {nome}
          </Texto>
          <Texto variante="pequeno" cor={cores.sobrePetroleoSuave}>
            Dados públicos com data e fonte · {local}
          </Texto>
        </View>
      </View>

      <View accessibilityRole="radiogroup" accessibilityLabel="O que o link abre">
        <Texto variante="rotulo">O que o link abre</Texto>
        <OpcaoUnica
          titulo="A ficha sempre atualizada"
          descricao="Quem abrir vê os dados mais recentes"
          marcada={!fixo}
          aoEscolher={() => {
            setFixo(false);
            setCopiado(false);
          }}
        />
        <OpcaoUnica
          titulo="Exatamente o que vejo agora"
          descricao={`Fixa os dados conhecidos em ${dataBr(asOf)}`}
          marcada={fixo}
          aoEscolher={() => {
            setFixo(true);
            setCopiado(false);
          }}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Texto variante="rotulo">Link</Texto>
        <View
          style={{ borderWidth: 1.5, borderColor: cores.borda, borderRadius: raio.controle, padding: 12 }}
          accessible
          accessibilityLabel={`Link: ${url}`}
        >
          <Texto selectable style={{ fontFamily: fontes.mono, fontSize: 13, lineHeight: 18, color: cores.tinta }}>
            {url}
          </Texto>
        </View>
      </View>

      <Texto variante="pequeno" cor={cores.tintaSuave}>
        {MENSAGENS.compartilhar.privacidade}
      </Texto>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Botao
          rotulo={copiado ? "Link copiado" : "Copiar link"}
          icone={copiado ? "marca" : "copiar"}
          variante="secundario"
          onPress={() => void copiar()}
          estilo={{ flex: 1 }}
        />
        <Botao rotulo="Enviar" icone="compartilhar" onPress={() => void enviar()} estilo={{ flex: 1 }} />
      </View>
    </Folha>
  );
}
