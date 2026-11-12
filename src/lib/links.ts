/**
 * Links que saem do app.
 *
 * O link compartilhado aponta para o PORTAL, não para o esquema do app: quem
 * recebe pode não ter o app instalado, e a ficha tem de abrir do mesmo jeito.
 * O caminho `/postos/{id}` é o mesmo nas duas pontas, então o mesmo endereço
 * serve de link universal quando o domínio próprio estiver configurado.
 */
import { Linking, Platform } from "react-native";

const SITE_PADRAO = "https://pic-web-production.up.railway.app";

export function origemDoSite(): string {
  const configurada = process.env.EXPO_PUBLIC_PIC_SITE_URL?.trim().replace(/\/+$/, "");
  return configurada || SITE_PADRAO;
}

/**
 * `asOf` presente = link permanente do recorte (abre sempre a mesma data).
 * Ausente = ficha sempre atualizada. O instante vai como a API o devolveu,
 * sem recalcular a representação.
 */
export function linkDaFicha(postoId: string, asOf?: string | null): string {
  const base = `${origemDoSite()}/postos/${encodeURIComponent(postoId)}`;
  return asOf ? `${base}?as_of=${encodeURIComponent(asOf)}` : base;
}

/** Abre a rota no app de mapas do aparelho. Só o destino é enviado. */
export function linkDeRota(destino: { latitude: number; longitude: number } | { endereco: string }): string {
  const alvo = "endereco" in destino ? encodeURIComponent(destino.endereco) : `${destino.latitude},${destino.longitude}`;
  if (Platform.OS === "ios") return `http://maps.apple.com/?daddr=${alvo}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${alvo}`;
}

export async function abrirFora(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
