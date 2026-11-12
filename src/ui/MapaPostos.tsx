/**
 * Mapa de postos — versão sem mapa (navegador).
 *
 * O mapa de verdade está em `MapaPostos.native.tsx`, que o empacotador escolhe
 * em Android e iOS. No navegador o app mostra só a lista: carregar um SDK de
 * mapas ali exigiria chave e enviaria a área consultada a um terceiro só para
 * a conferência visual. As duas versões exportam exatamente a mesma forma.
 */
import type { PontoMapa } from "@/api/tipos";

export interface MapaPostosProps {
  centro: { latitude: number; longitude: number };
  raioMetros: number;
  pontos: PontoMapa[];
  selecionado: string | null;
  aoSelecionar: (postoId: string | null) => void;
  /** Chamado quando o usuário arrasta o mapa para longe do centro consultado. */
  aoMoverCentro: (centro: { latitude: number; longitude: number } | null) => void;
}

export const MAPA_DISPONIVEL: boolean = false;

export function MapaPostos(_props: MapaPostosProps) {
  return null;
}
