import { parseOpenGraph } from "@/lib/og-parse";
import { getSessionAdmin } from "@/server/admin-auth";

/**
 * Preview de link para o formulário de oferta (mesmo mecanismo do WhatsApp):
 * baixa o HTML do link e devolve og:title/description/image para pré-preencher
 * o form. Autenticada (sessão admin) e com anti-SSRF básico: só http(s),
 * hosts privados bloqueados em cada redirect (máx. 3), timeout e limite de
 * leitura.
 */

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 512 * 1024;

const PRIVATE_HOST_PATTERN =
  /^(localhost|.*\.local|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$)/i;

function isBlockedUrl(url: URL): boolean {
  return (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    PRIVATE_HOST_PATTERN.test(url.hostname)
  );
}

/** Lê no máximo MAX_HTML_BYTES do corpo (páginas de produto são enormes). */
async function readCapped(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  return new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks));
}

export async function POST(request: Request) {
  if (!(await getSessionAdmin())) {
    return Response.json({ error: "não autorizado" }, { status: 401 });
  }

  let target: URL;
  try {
    target = new URL(String((await request.json()).url ?? ""));
  } catch {
    return Response.json({ error: "URL inválida" }, { status: 400 });
  }

  try {
    let response: Response | null = null;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      if (isBlockedUrl(target)) {
        return Response.json({ error: "URL não permitida" }, { status: 400 });
      }
      response = await fetch(target, {
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ghtpromo-preview/1.0; +https://ghtpromo.com.br)",
          Accept: "text/html",
        },
      });
      const location = response.headers.get("location");
      if (response.status >= 300 && response.status < 400 && location) {
        target = new URL(location, target);
        continue;
      }
      break;
    }
    if (!response || !response.ok) {
      return Response.json(
        { error: `a página respondeu HTTP ${response?.status ?? "?"}` },
        { status: 502 },
      );
    }
    return Response.json(parseOpenGraph(await readCapped(response)));
  } catch {
    return Response.json({ error: "não foi possível carregar o link" }, { status: 502 });
  }
}
