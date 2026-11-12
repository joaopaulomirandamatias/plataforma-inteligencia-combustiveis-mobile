#!/usr/bin/env node
/**
 * Prévia do app no navegador.
 *
 * Serve a exportação web (`dist/`) e responde em `/_pic/*` pela API, na MESMA
 * origem da página. Isso é necessário porque a API pública não libera
 * chamadas diretas de navegador (não há CORS); em Android e iOS o app fala
 * com a API direto e este script não participa.
 *
 *   npm run previa            → repassa `/_pic/*` para a API real
 *   npm run previa:amostra    → responde com dados fictícios de `amostra.mjs`
 *
 * `PIC_API_URL` troca a API de destino; `PORT` troca a porta (padrão 8080).
 * Atrás de um proxy HTTP de saída, rode com `NODE_USE_ENV_PROXY=1`.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { responderAmostra } from "./amostra.mjs";

const RAIZ = join(fileURLToPath(new URL(".", import.meta.url)), "..", "dist");
const PORTA = Number(process.env.PORT ?? 8080);
const AMOSTRA = process.argv.includes("--amostra");
const API = (process.env.PIC_API_URL ?? "https://pic-api-production.up.railway.app").replace(/\/+$/, "");
const PREFIXO = "/_pic";

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};

if (!existsSync(join(RAIZ, "index.html"))) {
  console.error("dist/index.html não existe. Rode antes: EXPO_PUBLIC_PIC_API_URL=/_pic npx expo export --platform web");
  process.exit(1);
}

// Faixa fixa no topo da página quando os dados são fictícios: quem olha a
// prévia não pode confundir amostra com registro de posto real.
const FAIXA_AMOSTRA =
  '<div style="position:fixed;z-index:99999;top:0;left:0;right:0;padding:3px 8px;background:#f2a614;color:#0c2733;' +
  'font:600 11px/1.3 system-ui,sans-serif;text-align:center;pointer-events:none">DADOS DE AMOSTRA · fictícios</div>';

function enviarJson(res, status, corpo) {
  res.writeHead(status, { "Content-Type": status >= 400 ? "application/problem+json" : "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(corpo));
}

async function atenderApi(caminho, parametros, res) {
  if (AMOSTRA) {
    const resposta = responderAmostra(caminho, parametros);
    return enviarJson(res, resposta?.status ?? 404, resposta?.corpo ?? { status: 404, codigo: "rota_inexistente" });
  }
  try {
    const consulta = parametros.toString();
    const origem = await fetch(`${API}${caminho}${consulta ? `?${consulta}` : ""}`, { headers: { Accept: "application/json" } });
    res.writeHead(origem.status, { "Content-Type": origem.headers.get("content-type") ?? "application/json", "Cache-Control": "no-store" });
    res.end(Buffer.from(await origem.arrayBuffer()));
  } catch (erro) {
    console.error(`[previa] falha ao alcançar ${API}${caminho}:`, erro?.cause?.code ?? erro?.message ?? erro);
    enviarJson(res, 502, { status: 502, codigo: "api_inalcancavel" });
  }
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://previa");
  const caminho = decodeURIComponent(url.pathname);

  if (caminho === PREFIXO || caminho.startsWith(`${PREFIXO}/`)) {
    // Só leitura: a prévia não repassa nada além de GET.
    if (req.method !== "GET") return enviarJson(res, 405, { status: 405 });
    return void atenderApi(caminho.slice(PREFIXO.length) || "/", url.searchParams, res);
  }

  // `normalize` + prefixo conferido: nenhum caminho sai de `dist/`.
  let arquivo = normalize(join(RAIZ, caminho));
  if (!arquivo.startsWith(RAIZ) || !existsSync(arquivo) || statSync(arquivo).isDirectory()) {
    arquivo = join(RAIZ, "index.html"); // rota do app: quem resolve é o Expo Router
  }
  const tipo = TIPOS[extname(arquivo)] ?? "application/octet-stream";
  let corpo = readFileSync(arquivo);
  if (AMOSTRA && arquivo.endsWith("index.html")) {
    corpo = Buffer.from(corpo.toString("utf8").replace("</body>", `${FAIXA_AMOSTRA}</body>`));
  }
  res.writeHead(200, { "Content-Type": tipo, "Cache-Control": arquivo.endsWith("index.html") ? "no-store" : "public, max-age=3600" });
  res.end(corpo);
}).listen(PORTA, "0.0.0.0", () => {
  console.log(`[previa] http://localhost:${PORTA} · ${AMOSTRA ? "dados de AMOSTRA (fictícios)" : `API: ${API}`}`);
});
