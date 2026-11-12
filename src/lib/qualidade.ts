/**
 * Indicadores factuais do recorte de qualidade (ficha pública, §3).
 *
 * São CONTAGENS DESCRITIVAS do que a API devolveu nesta resposta — não são
 * nota, taxa, índice nem classificação do posto, e o app não calcula
 * percentual: a coleta do PMQC é dirigida e o recorte pode estar truncado.
 *
 * As contagens são refeitas a partir dos ensaios efetivamente exibidos, não
 * das contagens agregadas recebidas, para que a soma sempre bata com o número
 * de ensaios na tela. É a mesma regra do portal.
 */
import type { ContagensPMQC, EnsaioPMQC, QualidadeCombustivel } from "@/api/tipos";
import { nomeProduto } from "@/lib/formato";

export interface ResumoQualidade {
  agrupamentos: number;
  ensaios: number;
  produtos: string[];
  /** Menor e maior data de coleta; `null` quando não há agrupamento. */
  periodo: { inicio: string; fim: string } | null;
  contagens: ContagensPMQC;
  truncado: boolean;
  limite: number;
}

export function contarEnsaios(ensaios: EnsaioPMQC[]): ContagensPMQC {
  const contagens: ContagensPMQC = { conforme: 0, nao_conforme: 0, nao_classificado: 0 };
  for (const ensaio of ensaios) {
    if (ensaio.conforme === true) contagens.conforme += 1;
    else if (ensaio.conforme === false) contagens.nao_conforme += 1;
    else contagens.nao_classificado += 1;
  }
  return contagens;
}

export function resumirQualidade(qualidade: QualidadeCombustivel): ResumoQualidade {
  const produtos = new Set<string>();
  const datas: string[] = [];
  const contagens: ContagensPMQC = { conforme: 0, nao_conforme: 0, nao_classificado: 0 };
  let ensaios = 0;

  for (const agrupamento of qualidade.agrupamentos) {
    produtos.add(nomeProduto(agrupamento.produto));
    datas.push(agrupamento.data_coleta);
    ensaios += agrupamento.ensaios.length;
    const doAgrupamento = contarEnsaios(agrupamento.ensaios);
    contagens.conforme += doAgrupamento.conforme;
    contagens.nao_conforme += doAgrupamento.nao_conforme;
    contagens.nao_classificado += doAgrupamento.nao_classificado;
  }

  datas.sort();
  const inicio = datas[0];
  const fim = datas[datas.length - 1];

  return {
    agrupamentos: qualidade.agrupamentos.length,
    ensaios,
    produtos: Array.from(produtos),
    periodo: inicio && fim ? { inicio, fim } : null,
    contagens,
    truncado: qualidade.truncado,
    limite: qualidade.limite,
  };
}
