import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useState } from "react";
import { Linking, View } from "react-native";

import { useLoja } from "@/armazenamento/loja";
import { apagarDadosDoUsuario, lojaFavoritos, lojaPreferencias, lojaRecentes } from "@/armazenamento/usuario";
import { MENSAGENS } from "@/lib/mensagens";
import { apagarConsultasGuardadas } from "@/offline/consultas";
import { cores } from "@/tema/tokens";
import { Botao } from "@/ui/Botao";
import { Chave } from "@/ui/Controles";
import { Etiqueta } from "@/ui/Etiqueta";
import { Cartao, Divisor, LinhaNavegacao } from "@/ui/Superficies";
import { BarraTopo, Corpo, Tela } from "@/ui/Tela";
import { Texto } from "@/ui/Texto";

export default function Conta() {
  const cliente = useQueryClient();
  const favoritos = useLoja(lojaFavoritos).itens.length;
  const recentes = useLoja(lojaRecentes).itens.length;
  const preferencias = useLoja(lojaPreferencias);
  const [confirmando, setConfirmando] = useState(false);
  const [apagado, setApagado] = useState(false);

  async function apagarTudo() {
    await Promise.all([apagarDadosDoUsuario(), apagarConsultasGuardadas(cliente)]);
    setConfirmando(false);
    setApagado(true);
  }

  return (
    <Tela>
      <BarraTopo titulo="Conta e privacidade" voltar={false} />
      <Corpo>
        <Cartao>
          <Texto variante="corpoForte">{MENSAGENS.conta.semConta}</Texto>
          <Texto variante="pequeno" cor={cores.tintaSuave}>
            {MENSAGENS.conta.semContaCorpo}
          </Texto>
        </Cartao>

        <Texto variante="rotulo" accessibilityRole="header">
          Suas permissões
        </Texto>
        <Cartao style={{ paddingVertical: 2, gap: 0 }}>
          <LinhaNavegacao
            titulo="Localização"
            subtitulo="Pedida só ao tocar em “Usar minha localização” · nunca armazenada"
            iconeDireita="externo"
            rotuloAcessivel="Localização. Abrir os ajustes do aparelho"
            onPress={() => void Linking.openSettings().catch(() => undefined)}
          />
          <Chave
            rotulo="Notificações"
            descricao="Dependem do serviço de avisos, ainda em construção"
            valor={false}
            desabilitada
            direita={<Etiqueta tipo="vazia">Indisponível</Etiqueta>}
          />
          <Divisor />
          <Chave
            rotulo="Estatísticas de uso anônimas"
            descricao="Desligado até você escolher ligar. Hoje o app não envia nenhuma estatística."
            valor={preferencias.estatisticasDeUso}
            aoMudar={(novo) => lojaPreferencias.definir((atual) => ({ ...atual, estatisticasDeUso: novo }))}
          />
        </Cartao>

        <Texto variante="rotulo" accessibilityRole="header">
          Seus dados
        </Texto>
        <Cartao>
          <View style={{ gap: 2 }}>
            <Texto variante="corpoMedio">Guardado neste aparelho</Texto>
            <Texto variante="pequeno" cor={cores.tintaSuave} accessibilityLiveRegion="polite">
              {apagado && favoritos + recentes === 0
                ? MENSAGENS.conta.apagado
                : `${favoritos} ${favoritos === 1 ? "favorito" : "favoritos"} · ${recentes} ${
                    recentes === 1 ? "consulta recente" : "consultas recentes"
                  } · cópias das fichas abertas nos últimos 7 dias`}
            </Texto>
          </View>
          {confirmando ? (
            <View style={{ gap: 8 }}>
              <Texto variante="pequenoForte" cor={cores.erro} accessibilityRole="alert">
                Isso apaga favoritos, consultas recentes e fichas guardadas. Não dá para desfazer.
              </Texto>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Botao rotulo="Cancelar" variante="secundario" compacto onPress={() => setConfirmando(false)} estilo={{ flex: 1 }} />
                <Botao rotulo="Apagar tudo" variante="escuro" compacto onPress={() => void apagarTudo()} estilo={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <Botao
              rotulo="Apagar dados deste aparelho"
              variante="secundario"
              compacto
              onPress={() => {
                setApagado(false);
                setConfirmando(true);
              }}
            />
          )}
          <Texto variante="pequeno" cor={cores.tintaSuave}>
            Nada disso é enviado a servidor. Sem conta, não há dados seus fora do aparelho.
          </Texto>
        </Cartao>

        <Cartao style={{ paddingVertical: 2, gap: 0 }}>
          <LinhaNavegacao titulo="Sobre os dados e as fontes" onPress={() => router.push("/sobre")} ultima />
        </Cartao>

        <Texto variante="fonte" centro>
          Versão {Constants.expoConfig?.version ?? "—"}
        </Texto>
      </Corpo>
    </Tela>
  );
}
