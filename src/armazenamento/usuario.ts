/**
 * O que o app guarda sobre o uso, e só no aparelho.
 *
 * Nada aqui é enviado a servidor algum. A tela Conta mostra o que está
 * guardado e apaga tudo com um toque.
 */
import { criarLoja } from "@/armazenamento/loja";

/** Identificação mínima para listar o posto sem rede. */
export interface PostoGuardado {
  posto_id: string;
  razao_social: string | null;
  municipio: string | null;
  uf: string | null;
  /** ISO 8601 de quando o usuário salvou ou visitou. */
  quando: string;
}

export const MAXIMO_DE_RECENTES = 5;

export const lojaFavoritos = criarLoja<{ itens: PostoGuardado[] }>("combustivel-em-dia:favoritos", { itens: [] });

export const lojaRecentes = criarLoja<{ itens: PostoGuardado[] }>("combustivel-em-dia:recentes", { itens: [] });

export interface Preferencias {
  viuBoasVindas: boolean;
  /** Último recorte geográfico usado na busca; evita redigitar. */
  uf: string;
  municipio: string;
  /** Telemetria é opt-in: nasce desligada e hoje não envia nada. */
  estatisticasDeUso: boolean;
}

export const lojaPreferencias = criarLoja<Preferencias>("combustivel-em-dia:preferencias", {
  viuBoasVindas: false,
  uf: "",
  municipio: "",
  estatisticasDeUso: false,
});

type Identificavel = Pick<PostoGuardado, "posto_id" | "razao_social" | "municipio" | "uf">;

function guardar(posto: Identificavel, agora: Date): PostoGuardado {
  return {
    posto_id: posto.posto_id,
    razao_social: posto.razao_social,
    municipio: posto.municipio,
    uf: posto.uf,
    quando: agora.toISOString(),
  };
}

export function ehFavorito(itens: PostoGuardado[], postoId: string): boolean {
  return itens.some((item) => item.posto_id === postoId);
}

export function alternarFavorito(posto: Identificavel, agora = new Date()): void {
  lojaFavoritos.definir((atual) =>
    ehFavorito(atual.itens, posto.posto_id)
      ? { itens: atual.itens.filter((item) => item.posto_id !== posto.posto_id) }
      : { itens: [guardar(posto, agora), ...atual.itens] },
  );
}

export function registrarVisita(posto: Identificavel, agora = new Date()): void {
  lojaRecentes.definir((atual) => ({
    itens: [guardar(posto, agora), ...atual.itens.filter((item) => item.posto_id !== posto.posto_id)].slice(
      0,
      MAXIMO_DE_RECENTES,
    ),
  }));
}

export async function apagarDadosDoUsuario(): Promise<void> {
  await Promise.all([lojaFavoritos.redefinir(), lojaRecentes.redefinir()]);
}
