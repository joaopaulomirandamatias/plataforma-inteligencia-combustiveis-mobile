/**
 * Cache de consultas e funcionamento offline.
 *
 * O app não tem banco próprio nem regra de negócio: o que ele mostra offline é
 * a ÚLTIMA RESPOSTA DA API, guardada no aparelho já depois da borda (sem dado
 * de auditoria). Toda tela que exibe cópia guardada mostra a data em que ela
 * foi salva — uma ficha velha nunca passa por atual.
 *
 * Três regras:
 *
 * 1. `offlineFirst`: a consulta responde do cache na hora e revalida quando há
 *    rede. Sem rede, a cópia continua visível em vez de virar tela de erro.
 * 2. Só resposta bem-sucedida é gravada. Erro nunca vira "dado".
 * 3. A consulta de postos próximos NÃO é gravada: a chave dela contém a
 *    coordenada do usuário, e a promessa do app é que a localização não é
 *    armazenada.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { onlineManager, QueryClient, type Query } from "@tanstack/react-query";
import type { PersistQueryClientProviderProps } from "@tanstack/react-query-persist-client";

import { FalhaDeConsulta } from "@/api/cliente";

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

/** Trocar este valor descarta o cache gravado por versões anteriores. */
const VERSAO_DO_CACHE = "1";

export const CHAVE_PROXIMOS = "proximos";

function vale_tentar_de_novo(tentativas: number, erro: unknown): boolean {
  if (tentativas >= 2) return false;
  if (!(erro instanceof FalhaDeConsulta)) return false;
  // 404 e 422 são respostas, não falhas de transporte: repetir não muda nada.
  return erro.motivo === "sem_conexao" || erro.motivo === "tempo_esgotado" || erro.motivo === "indisponivel";
}

export function criarClienteDeConsultas(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: "offlineFirst",
        staleTime: 5 * 60 * 1000,
        // `gcTime` precisa cobrir a validade do cache em disco; menor que isso,
        // a consulta é coletada da memória e some do que é persistido.
        gcTime: SETE_DIAS_MS,
        retry: vale_tentar_de_novo,
        refetchOnReconnect: true,
      },
    },
  });
}

export function podeGravar(consulta: Pick<Query, "queryKey" | "state">): boolean {
  if (consulta.state.status !== "success") return false;
  return consulta.queryKey[0] !== CHAVE_PROXIMOS;
}

export const opcoesDePersistencia: PersistQueryClientProviderProps["persistOptions"] = {
  persister: createAsyncStoragePersister({
    storage: AsyncStorage,
    key: "combustivel-em-dia:consultas",
    throttleTime: 1000,
  }),
  maxAge: SETE_DIAS_MS,
  buster: VERSAO_DO_CACHE,
  dehydrateOptions: { shouldDehydrateQuery: podeGravar },
};

/**
 * Liga o estado de rede do aparelho ao gerenciador de consultas. Com isso as
 * consultas pausam sem rede e revalidam sozinhas quando ela volta.
 */
export function acompanharRede(): () => void {
  onlineManager.setEventListener((definir) =>
    NetInfo.addEventListener((estado) => {
      // `isInternetReachable` começa `null` (ainda não medido): tratamos como
      // online para não bloquear a primeira consulta do app.
      definir(estado.isConnected !== false && estado.isInternetReachable !== false);
    }),
  );
  return () => onlineManager.setEventListener(() => undefined);
}

/** Apaga todas as respostas guardadas no aparelho (Conta › Seus dados). */
export async function apagarConsultasGuardadas(cliente: QueryClient): Promise<void> {
  cliente.clear();
  await AsyncStorage.removeItem("combustivel-em-dia:consultas");
}
