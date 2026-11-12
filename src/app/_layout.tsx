import { IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from "@expo-google-fonts/ibm-plex-mono";
import { Saira_400Regular, Saira_500Medium, Saira_600SemiBold } from "@expo-google-fonts/saira";
import { SairaCondensed_700Bold } from "@expo-google-fonts/saira-condensed";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { useLojaCarregada } from "@/armazenamento/loja";
import { lojaFavoritos, lojaPreferencias, lojaRecentes } from "@/armazenamento/usuario";
import { acompanharRede, criarClienteDeConsultas, opcoesDePersistencia } from "@/offline/consultas";
import { cores } from "@/tema/tokens";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function Raiz() {
  const [fontesProntas, erroDeFontes] = useFonts({
    Saira_400Regular,
    Saira_500Medium,
    Saira_600SemiBold,
    SairaCondensed_700Bold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });
  const [cliente] = useState(criarClienteDeConsultas);

  // As três lojas precisam estar lidas antes da primeira tela: a decisão
  // "mostrar boas-vindas?" e a estrela de favorito dependem delas.
  const preferenciasLidas = useLojaCarregada(lojaPreferencias);
  const favoritosLidos = useLojaCarregada(lojaFavoritos);
  const recentesLidos = useLojaCarregada(lojaRecentes);

  useEffect(() => acompanharRede(), []);

  // Falha ao carregar fonte não pode prender o app na tela de abertura: segue
  // com a fonte do sistema.
  const pronto = (fontesProntas || erroDeFontes !== null) && preferenciasLidas && favoritosLidos && recentesLidos;

  useEffect(() => {
    if (pronto) void SplashScreen.hideAsync().catch(() => undefined);
  }, [pronto]);

  if (!pronto) return null;

  return (
    <PersistQueryClientProvider client={cliente} persistOptions={opcoesDePersistencia}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.papel } }} />
    </PersistQueryClientProvider>
  );
}
