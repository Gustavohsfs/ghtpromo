import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/server/admin-session";

/**
 * Guarda do painel /admin (1ª camada — o layout do painel revalida no
 * servidor): sem sessão válida, qualquer subrota redireciona para o login
 * em /admin. O próprio /admin fica de fora do matcher (é a tela de login).
 */
export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path+",
};
