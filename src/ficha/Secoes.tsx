import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import type { ContextoRegional, Fato, Posto } from "@/api/tipos";
import {
  cnpjBr,
  dataBr,
  instanteBr,
  nomeFonte,
  nomeProprio,
  SECAO_DA_FONTE,
  semanaBr,
} from "@/lib/formato";
import { abrirFora, linkDaFicha, linkDeRota } from "@/lib/links";
import { MENSAGENS } from "@/lib/mensagens";
import { AVISO_INTERPRETACAO } from "@/lib/politica";
import { cores } from "@/tema/tokens";
import { Botao, BotaoIcone } from "@/ui/Botao";
import { Etiqueta } from "@/ui/Etiqueta";
import { Aviso, CabecalhoSecao, Cartao, LinhaNavegacao, ParChaveValor } from "@/ui/Superficies";
import { Texto } from "@/ui/Texto";

export type AbaFicha = "resumo" | "qualidade" | "precos" | "cadastro" | "posto" | "fontes";

/* -------------------------------------------------------------------------- */
/* Resumo                                                                      */
/* -------------------------------------------------------------------------- */

export function SecaoResumo({
  posto,
  contexto,
  irPara,
}: {
  posto: Posto;
  contexto: ContextoRegional | undefined;
  irPara: (aba: AbaFicha) => void;
}) {
  const agrupamentos = posto.qualidade_combustivel.agrupamentos;
  // A API devolve os agrupamentos do mais recente para o mais antigo.
  const ultimaColeta = agrupamentos[0]?.data_coleta;
  const precoRecente = contexto?.itens[0];
  const atos = posto.fatos_recentes.filter((fato) => fato.tipo === "autuacao" || fato.tipo === "aferição");

  return (
    <View style={{ gap: 12 }}>
      <CabecalhoSecao titulo="Resumo factual" etiqueta="Fontes oficiais" />

      <Cartao style={{ paddingVertical: 2, gap: 0 }}>
        <LinhaNavegacao
          titulo="Qualidade do combustível"
          subtitulo={
            ultimaColeta ? `Última coleta publicada em ${dataBr(ultimaColeta)}` : MENSAGENS.semQualidade.etiqueta
          }
          fonte={
            ultimaColeta
              ? `ANP · PMQC · ${agrupamentos.length} ${agrupamentos.length === 1 ? "grupo exibido" : "grupos exibidos"}`
              : "Não significa aprovação"
          }
          onPress={() => irPara("qualidade")}
        />
        <LinhaNavegacao
          titulo="Preços observados"
          subtitulo={
            precoRecente
              ? `Última pesquisa neste posto: ${semanaBr(precoRecente.semana_inicio, precoRecente.semana_fim)}`
              : contexto
                ? MENSAGENS.precos.semPreco.etiqueta
                : "Abra a aba para consultar"
          }
          fonte={precoRecente ? "ANP · Levantamento de Preços" : contexto ? "A pesquisa cobre só parte dos postos" : undefined}
          onPress={() => irPara("precos")}
        />
        <LinhaNavegacao
          titulo="Fiscalizações e atos oficiais"
          subtitulo={
            atos.length > 0
              ? `${atos.length} ${atos.length === 1 ? "registro público" : "registros públicos"} nesta ficha`
              : MENSAGENS.semAtos.titulo
          }
          fonte={atos.length > 0 ? undefined : MENSAGENS.semAtos.detalhe}
          ultima
        />
      </Cartao>

      {atos.length > 0 ? <ListaDeFatos titulo="Registros oficiais" fatos={atos} /> : null}

      <Aviso>{AVISO_INTERPRETACAO}</Aviso>

      <Cartao style={{ paddingVertical: 2, gap: 0 }}>
        <LinhaNavegacao
          titulo="Canais oficiais"
          subtitulo="Onde registrar reclamação ou pedir fiscalização"
          onPress={() => router.push({ pathname: "/guia/canais", params: { posto: posto.posto_id } })}
          ultima
        />
      </Cartao>
    </View>
  );
}

function ListaDeFatos({ titulo, fatos }: { titulo: string; fatos: Fato[] }) {
  return (
    <View style={{ gap: 8 }}>
      <Texto variante="rotulo" accessibilityRole="header">
        {titulo}
      </Texto>
      <Cartao style={{ paddingVertical: 4, gap: 0 }}>
        {fatos.map((fato, indice) => (
          <View
            key={`${fato.tipo}-${fato.data_validade}-${indice}`}
            style={[{ paddingVertical: 10, gap: 2 }, indice > 0 ? { borderTopWidth: 1, borderTopColor: cores.linha } : null]}
          >
            <Texto variante="corpo" style={{ fontSize: 14 }}>
              {fato.descricao}
            </Texto>
            <Texto variante="fonte">
              {nomeFonte(fato.fonte)} · {dataBr(fato.data_validade)}
            </Texto>
          </View>
        ))}
      </Cartao>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Cadastro                                                                    */
/* -------------------------------------------------------------------------- */

export function SecaoCadastro({ posto }: { posto: Posto }) {
  const [copiado, setCopiado] = useState(false);
  const enderecoCompleto = [posto.endereco, posto.municipio, posto.uf].filter(Boolean).join(", ");
  const atendimentos = posto.fatos_recentes.filter((fato) => fato.tipo === "atendimento");
  const cadastro = posto.fatos_recentes.filter((fato) => fato.tipo === "cadastro");

  async function copiarCnpj() {
    if (!posto.cnpj) return;
    setCopiado(await Clipboard.setStringAsync(cnpjBr(posto.cnpj)));
  }

  return (
    <View style={{ gap: 12 }}>
      <CabecalhoSecao titulo="Cadastro do revendedor" etiqueta="ANP · cadastro" />
      <Cartao>
        <ParChaveValor chave="Razão social">
          <Texto variante="corpoMedio">{nomeProprio(posto.razao_social) || "Não informada na fonte"}</Texto>
        </ParChaveValor>
        <ParChaveValor chave="CNPJ">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Texto variante="mono" style={{ flex: 1 }}>
              {cnpjBr(posto.cnpj)}
            </Texto>
            {posto.cnpj ? (
              <BotaoIcone
                rotuloAcessivel="Copiar CNPJ"
                icone={copiado ? "marca" : "copiar"}
                cor={cores.petroleo}
                contorno
                onPress={() => void copiarCnpj()}
                estilo={{ marginVertical: -8 }}
              />
            ) : null}
          </View>
          {copiado ? (
            <Texto variante="pequeno" cor={cores.tintaSuave} accessibilityLiveRegion="polite">
              CNPJ copiado
            </Texto>
          ) : null}
        </ParChaveValor>
        <ParChaveValor chave="Bandeira">
          <Texto variante="corpoMedio">{nomeProprio(posto.bandeira) || "Sem bandeira declarada"}</Texto>
        </ParChaveValor>
        <ParChaveValor chave="Endereço">
          <Texto variante="corpoMedio">
            {nomeProprio(posto.endereco) || "Não informado na fonte"}
            {posto.municipio ? `\n${nomeProprio(posto.municipio)}${posto.uf ? `/${posto.uf}` : ""}` : ""}
          </Texto>
        </ParChaveValor>
        <ParChaveValor chave="No cadastro desde">
          <Texto variante="mono">{dataBr(posto.cadastro_desde)}</Texto>
        </ParChaveValor>
        <Texto variante="fonte">Fonte: ANP — cadastro de revendedores varejistas</Texto>
      </Cartao>

      {enderecoCompleto ? (
        <Botao
          rotulo="Abrir rota no app de mapas"
          icone="rota"
          variante="secundario"
          onPress={() => void abrirFora(linkDeRota({ endereco: enderecoCompleto }))}
        />
      ) : null}
      <Texto variante="pequeno" cor={cores.tintaSuave}>
        A rota usa o endereço do cadastro. Só o destino é enviado ao app de mapas.
      </Texto>

      {cadastro.length > 0 ? <ListaDeFatos titulo="Atualizações de cadastro" fatos={cadastro} /> : null}
      {atendimentos.length > 0 ? <ListaDeFatos titulo="Atendimentos em Procons" fatos={atendimentos} /> : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Do posto (declarado)                                                        */
/* -------------------------------------------------------------------------- */

export function SecaoDoPosto() {
  return (
    <View style={{ gap: 12 }}>
      <CabecalhoSecao titulo="Informado pelo posto" etiqueta="Declarado" tipoEtiqueta="declarado" />
      <Aviso icone="lapis">{MENSAGENS.doPosto.aviso}</Aviso>
      <Cartao tipo="declarado">
        <Etiqueta tipo="vazia">Nada publicado pelo posto ainda</Etiqueta>
        <Texto variante="corpo" style={{ fontSize: 14 }}>
          {MENSAGENS.doPosto.emBreve}
        </Texto>
      </Cartao>
      <LinhaNavegacao
        titulo="Sou responsável por este posto"
        subtitulo="Saiba como pedir correção ou publicar informações"
        onPress={() => router.push("/sobre")}
        ultima
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Fontes e metodologia                                                        */
/* -------------------------------------------------------------------------- */

export function SecaoFontes({ posto, salvoEm }: { posto: Posto; salvoEm: number }) {
  const [copiado, setCopiado] = useState(false);

  async function copiarLinkPermanente() {
    setCopiado(await Clipboard.setStringAsync(linkDaFicha(posto.posto_id, posto.as_of)));
  }

  return (
    <View style={{ gap: 12 }}>
      <Texto variante="rotulo" accessibilityRole="header">
        De onde veio cada parte desta ficha
      </Texto>

      <Cartao style={{ paddingVertical: 4, gap: 0 }}>
        {posto.cargas.length === 0 ? (
          <Texto variante="pequeno" cor={cores.tintaSuave} style={{ paddingVertical: 10 }}>
            A resposta não trouxe a data de leitura das fontes.
          </Texto>
        ) : null}
        {posto.cargas.map((carga, indice) => (
          <View
            key={carga.fonte}
            style={[{ paddingVertical: 10, gap: 4 }, indice > 0 ? { borderTopWidth: 1, borderTopColor: cores.linha } : null]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Texto variante="corpoForte" style={{ flex: 1 }}>
                {nomeFonte(carga.fonte)}
              </Texto>
              {SECAO_DA_FONTE[carga.fonte] ? <Etiqueta>{SECAO_DA_FONTE[carga.fonte] as string}</Etiqueta> : null}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              <Texto variante="pequeno" cor={cores.tintaSuave}>
                Lido pela plataforma
              </Texto>
              <Texto variante="fonte" cor={cores.tinta}>
                {instanteBr(carga.coletado_em)}
              </Texto>
            </View>
          </View>
        ))}
      </Cartao>

      <Texto variante="pequeno" cor={cores.tintaSuave}>
        {MENSAGENS.frescor}
      </Texto>

      <Cartao>
        <Texto variante="rotulo" accessibilityRole="header">
          Versão desta visão
        </Texto>
        <ParChaveValor chave="Dados até">
          <Texto variante="mono" style={{ fontSize: 13 }}>
            {instanteBr(posto.as_of)}
          </Texto>
        </ParChaveValor>
        <ParChaveValor chave="Neste aparelho">
          <Texto variante="mono" style={{ fontSize: 13 }}>
            consultado em {instanteBr(new Date(salvoEm).toISOString())}
          </Texto>
        </ParChaveValor>
        <Botao
          rotulo={copiado ? "Link copiado" : "Copiar link permanente desta versão"}
          icone={copiado ? "marca" : "copiar"}
          variante="secundario"
          compacto
          onPress={() => void copiarLinkPermanente()}
        />
        <Texto variante="pequeno" cor={cores.tintaSuave}>
          O link permanente abre sempre os dados conhecidos nesta mesma data.
        </Texto>
      </Cartao>

      <Cartao style={{ paddingVertical: 2, gap: 0 }}>
        <LinhaNavegacao titulo="Como os dados são reunidos" onPress={() => router.push("/sobre")} />
        <LinhaNavegacao
          titulo="Ver esta ficha no portal"
          iconeDireita="externo"
          onPress={() => void abrirFora(linkDaFicha(posto.posto_id))}
          ultima
        />
      </Cartao>
    </View>
  );
}
