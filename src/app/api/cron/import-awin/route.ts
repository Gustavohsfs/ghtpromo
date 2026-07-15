import { revalidatePath } from "next/cache";
import { gunzipSync } from "node:zlib";

import { importAwinFeed } from "@/server/awin-import";

/**
 * Importação automática do datafeed Awin (Vercel Cron, diário — ver
 * vercel.json). Baixa o feed da URL autenticada (AWIN_FEED_URL), importa
 * para o banco (upsert + expiração) e regenera as páginas SSG via
 * revalidatePath — sem novo deploy. Protegida pelo Bearer que a Vercel
 * envia automaticamente em invocações de cron (CRON_SECRET).
 */

/** Importar ~5k linhas leva minutos; padrão da Vercel já é 300s, explícito aqui. */
export const maxDuration = 300;

/** Assinatura gzip (0x1f 0x8b) — o feed vem com compression/gzip na URL. */
function isGzip(body: Buffer): boolean {
  return body.length > 2 && body[0] === 0x1f && body[1] === 0x8b;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "não autorizado" }, { status: 401 });
  }
  const feedUrl = process.env.AWIN_FEED_URL;
  if (!feedUrl) {
    return Response.json({ error: "AWIN_FEED_URL não configurada" }, { status: 500 });
  }

  let csv: Buffer;
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`download do feed falhou: HTTP ${response.status}`);
    }
    const body = Buffer.from(await response.arrayBuffer());
    csv = isGzip(body) ? gunzipSync(body) : body;
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 502 });
  }

  const stats = await importAwinFeed(csv);
  revalidatePath("/", "layout");
  console.log("cron import-awin:", stats);
  return Response.json({ ok: true, stats });
}
