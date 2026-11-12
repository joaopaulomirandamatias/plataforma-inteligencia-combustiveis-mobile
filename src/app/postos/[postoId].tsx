import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { FalhaDeConsulta } from "@/api/cliente";
import { useContextoRegional, usePosto } from "@/api/consultas";
import { useLoja } from "@/armazenamento/loja";
import { alternarFavorito, ehFavorito, lojaFavoritos, registrarVisita } from "@/armazenamento/usuario";
import { SecaoPrecos } from "@/ficha/SecaoPrecos";
import { SecaoQualidade } from "@/ficha/SecaoQualidade";
import { FolhaCompartilhar, FolhaOutraData } from "@/ficha/Folhas";
import { SecaoCadastro, SecaoDoPosto, SecaoFontes, SecaoResumo, type AbaFicha } from "@/ficha/Secoes";
import { cnpjBr, dataBr, instanteBr, nomeProprio } from "@/lib/formato";
import { MENSAGENS, mensagemDeFalha } from "@/lib/mensagens";
import { cores, TOQUE } from "@/tema/tokens";
import { Botao, BotaoIcone } from "@/ui/Botao";
import { EsqueletoLista, EstadoMensagem } from "@/ui/Estados";
import { Icone } from "@/ui/Icone";
import { BarraTopo, Corpo, Tela } from "@/ui/Tela";
import { Texto } from "@/ui/Texto";

const ABAS: { id: AbaFicha; rotulo: string }[] = [
  { id: "resumo", rotulo: "Resumo" },
  { id: "qualidade", rotulo: "Qualidade" },
  { id: "precos", rotulo: "Preços" },
  { id: "cadastro", rotulo: "Cadastro" },
  { id: "posto", rotulo: "Do posto" },
  { id: "fontes", rotulo: "Fontes" },
];

function parametro(valor: string | string[] | undefined): string | undefined {
  const unico = Array.isArray(valor) ? valor[0] : valor;
  return unico?.trim() || undefined;
}

export default function Ficha() {
  const bruto = useLocalSearchParams<{ postoId: string; as_of?: string }>();
  const postoId = parametro(bruto.postoId);
  const asOf = parametro(bruto.as_of) ?? null;

  const [aba, setAba] = useState<AbaFicha>("resumo");
  const [folha, setFolha] = useState<"data" | "compartilhar" | null>(null);
  const ficha = usePosto(postoId, asOf);
  const contexto = useContextoRegional(postoId, asOf);
  const favoritos = useLoja(lojaFavoritos).itens;

  const posto = ficha.data;

  // Registra a visita uma vez por posto aberto, para "Consultas recentes".
  const idCarregado = posto?.posto_id;
  useEffect(() => {
    if (posto && idCarregado) registrarVisita(posto);
    // `posto` muda de identidade a cada revalidação; a visita é por id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCarregado]);

  if (!postoId) {
    return (
      <Tela>
        <BarraTopo titulo="Ficha do posto" />
        <EstadoMensagem icone="info" titulo={MENSAGENS.postoNaoEncontrado.titulo} corpo={MENSAGENS.postoNaoEncontrado.corpo}>
          <Botao rotulo="Nova consulta" onPress={() => router.replace("/")} />
        </EstadoMensagem>
      </Tela>
    );
  }

  /** Troca a data da visão sem empilhar telas: voltar sai da ficha, não da data. */
  function verEm(novoAsOf: string | null) {
    setFolha(null);
    router.replace(
      novoAsOf
        ? { pathname: "/postos/[postoId]", params: { postoId: postoId as string, as_of: novoAsOf } }
        : { pathname: "/postos/[postoId]", params: { postoId: postoId as string } },
    );
  }

  if (!posto) {
    const falha = ficha.error instanceof FalhaDeConsulta ? ficha.error : null;
    // Com `as_of`, 404 quer dizer "a base ainda não conhecia este posto naquela
    // data" (piso de transação), não "o posto não existe".
    const semDadosNaData = asOf !== null && falha?.motivo === "nao_encontrado";
    const mensagem = semDadosNaData ? MENSAGENS.outraData.semDados : mensagemDeFalha(falha?.motivo ?? "indisponivel");
    return (
      <Tela>
        <BarraTopo titulo="Ficha do posto" />
        {ficha.isError ? (
          <EstadoMensagem
            icone={falha?.motivo === "sem_conexao" ? "semConexao" : semDadosNaData ? "relogio" : "info"}
            titulo={mensagem.titulo}
            corpo={mensagem.corpo}
            alerta
          >
            {semDadosNaData ? <Botao rotulo="Voltar para a visão atual" onPress={() => verEm(null)} /> : null}
            {falha?.motivo === "nao_encontrado" ? null : (
              <Botao rotulo="Tentar novamente" icone="recarregar" onPress={() => void ficha.refetch()} />
            )}
            <Botao rotulo="Nova consulta" variante="secundario" onPress={() => router.replace("/")} />
          </EstadoMensagem>
        ) : (
          <View style={{ padding: 16 }}>
            <EsqueletoLista mensagem={MENSAGENS.carregando} itens={3} />
          </View>
        )}
      </Tela>
    );
  }

  const nome = nomeProprio(posto.razao_social) || "Nome não informado na fonte";
  const favorito = ehFavorito(favoritos, posto.posto_id);
  // A ficha na tela é uma cópia guardada quando a revalidação falhou ou está
  // em pausa por falta de rede. Nesses casos a data da cópia fica à vista.
  const copiaAntiga = ficha.isError || ficha.isPaused;

  return (
    <Tela>
      <BarraTopo
        titulo="Ficha do posto"
        acoes={
          <>
            <BotaoIcone rotuloAcessivel="Compartilhar esta ficha" icone="compartilhar" onPress={() => setFolha("compartilhar")} />
            <BotaoIcone
              rotuloAcessivel={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              accessibilityState={{ selected: favorito }}
              icone="estrela"
              cor={favorito ? cores.ambar : cores.branco}
              preenchimento={favorito ? cores.ambar : "none"}
              onPress={() => alternarFavorito(posto)}
            />
          </>
        }
      />

      {asOf ? (
        <View style={estilos.faixaHistorica} accessibilityRole="alert">
          <Icone nome="relogio" cor={cores.petroleo} />
          <View style={{ flex: 1 }}>
            <Texto variante="pequenoForte" cor={cores.petroleo}>
              Visão histórica
            </Texto>
            <Texto variante="pequeno" cor={cores.petroleo}>
              O que se sabia em {dataBr(posto.as_of)}
            </Texto>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => verEm(null)}
            style={{ minHeight: TOQUE, justifyContent: "center" }}
          >
            <Texto variante="pequenoForte" cor={cores.petroleo} style={{ textDecorationLine: "underline" }}>
              Voltar para hoje
            </Texto>
          </Pressable>
        </View>
      ) : null}

      <View style={estilos.identificacao}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${asOf ? "Visão histórica" : "Visão atual"}, dados conhecidos até ${dataBr(posto.as_of)}. Ver a ficha em outra data`}
          onPress={() => setFolha("data")}
          style={estilos.visao}
        >
          <Icone nome="relogio" tamanho={16} cor={cores.ambar} />
          <Texto variante="fonte" cor={cores.ambar}>
            {/* Na visão histórica a faixa âmbar acima já diz a data: aqui fica só a ação. */}
            {asOf ? "Trocar a data da visão" : `Visão atual · dados conhecidos até ${dataBr(posto.as_of)}`}
          </Texto>
          <Icone nome="abaixo" tamanho={16} cor={cores.ambar} />
        </Pressable>
        <Texto variante="titulo2" cor={cores.branco} accessibilityRole="header">
          {nome}
        </Texto>
        <Texto variante="fonte" cor={cores.sobrePetroleoSuave} style={{ fontSize: 12.5 }}>
          CNPJ {cnpjBr(posto.cnpj)}
        </Texto>
        <Texto variante="pequeno" cor="#dbe5ea" style={{ fontSize: 14 }}>
          {[nomeProprio(posto.endereco), nomeProprio(posto.municipio), posto.uf].filter(Boolean).join(" · ") ||
            "Endereço não informado na fonte"}
        </Texto>
        <View style={estilos.selos}>
          <View style={estilos.selo}>
            <Texto variante="pequenoForte" cor={cores.branco} style={estilos.textoSelo}>
              {nomeProprio(posto.bandeira) || "Sem bandeira declarada"}
            </Texto>
          </View>
          {posto.cadastro_desde ? (
            <View style={estilos.selo}>
              <Texto variante="pequenoForte" cor={cores.branco} style={estilos.textoSelo}>
                No cadastro desde {dataBr(posto.cadastro_desde)}
              </Texto>
            </View>
          ) : null}
        </View>
      </View>

      <View style={estilos.abas}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist">
          {ABAS.map((item) => {
            const ativa = item.id === aba;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativa }}
                onPress={() => setAba(item.id)}
                style={[estilos.aba, ativa ? estilos.abaAtiva : null]}
              >
                <Texto variante="pequenoForte" cor={ativa ? cores.petroleo : cores.tintaSuave} style={{ fontSize: 14 }}>
                  {item.rotulo}
                </Texto>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Corpo
        refreshControl={
          <RefreshControl
            refreshing={ficha.isRefetching}
            onRefresh={() => {
              void ficha.refetch();
              void contexto.refetch();
            }}
            tintColor={cores.petroleo}
          />
        }
      >
        {copiaAntiga ? (
          <View style={estilos.copia} accessibilityRole="alert">
            <Icone nome="semConexao" cor={cores.ambarEscuro} />
            <Texto variante="pequeno" cor={cores.ambarEscuro} style={{ flex: 1 }}>
              {MENSAGENS.copiaGuardada(instanteBr(new Date(ficha.dataUpdatedAt).toISOString()))}
            </Texto>
          </View>
        ) : null}

        {aba === "resumo" ? <SecaoResumo posto={posto} contexto={contexto.data} irPara={setAba} /> : null}
        {aba === "qualidade" ? <SecaoQualidade qualidade={posto.qualidade_combustivel} /> : null}
        {aba === "precos" ? (
          <SecaoPrecos
            contexto={contexto.data}
            carregando={contexto.isPending}
            erro={contexto.error}
            fatos={posto.fatos_recentes}
          />
        ) : null}
        {aba === "cadastro" ? <SecaoCadastro posto={posto} /> : null}
        {aba === "posto" ? <SecaoDoPosto /> : null}
        {aba === "fontes" ? <SecaoFontes posto={posto} salvoEm={ficha.dataUpdatedAt} /> : null}
      </Corpo>

      <FolhaOutraData visivel={folha === "data"} aoFechar={() => setFolha(null)} aoEscolher={verEm} />
      <FolhaCompartilhar
        visivel={folha === "compartilhar"}
        aoFechar={() => setFolha(null)}
        postoId={posto.posto_id}
        nome={nome}
        local={[nomeProprio(posto.municipio), posto.uf].filter(Boolean).join("/") || "local não informado"}
        asOf={posto.as_of}
      />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  visao: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: TOQUE, alignSelf: "flex-start" },
  faixaHistorica: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: cores.ambar,
  },
  identificacao: { backgroundColor: cores.petroleo, paddingHorizontal: 16, paddingBottom: 16, gap: 4, marginTop: -6 },
  selos: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  selo: {
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: cores.petroleo2,
    borderWidth: 1,
    borderColor: cores.petroleoLinha,
    justifyContent: "center",
  },
  textoSelo: { fontSize: 12, lineHeight: 16 },
  abas: { backgroundColor: cores.branco, borderBottomWidth: 1, borderBottomColor: cores.linha },
  aba: {
    minHeight: TOQUE + 2,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  abaAtiva: { borderBottomColor: cores.ambar },
  copia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: cores.ambarClaro,
    borderWidth: 1,
    borderColor: cores.ambarBorda,
  },
});
