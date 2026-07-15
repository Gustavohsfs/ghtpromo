import { describe, expect, it } from "vitest";

import { parseOpenGraph } from "./og-parse";

describe("parseOpenGraph", () => {
  it("extrai og:image, og:title e og:description", () => {
    const html = `<html><head>
      <meta property="og:title" content="Echo Dot 5ª geração" />
      <meta property="og:description" content="Smart speaker com Alexa &amp; som potente" />
      <meta property="og:image" content="https://m.media-amazon.com/images/I/echo.jpg" />
    </head></html>`;

    expect(parseOpenGraph(html)).toEqual({
      title: "Echo Dot 5ª geração",
      description: "Smart speaker com Alexa & som potente",
      imageUrl: "https://m.media-amazon.com/images/I/echo.jpg",
    });
  });

  it("aceita atributos em ordem invertida (content antes de property)", () => {
    const html = `<meta content="https://cdn.loja.com/p.png" property="og:image">`;
    expect(parseOpenGraph(html).imageUrl).toBe("https://cdn.loja.com/p.png");
  });

  it("cai para twitter:image e <title> quando og:* não existe", () => {
    const html = `<head>
      <title>Produto Bacana | Loja</title>
      <meta name="twitter:image" content="https://cdn.loja.com/tw.jpg">
    </head>`;

    const result = parseOpenGraph(html);
    expect(result.imageUrl).toBe("https://cdn.loja.com/tw.jpg");
    expect(result.title).toBe("Produto Bacana | Loja");
  });

  it("aceita aspas simples", () => {
    const html = `<meta property='og:image' content='https://cdn.loja.com/s.jpg'>`;
    expect(parseOpenGraph(html).imageUrl).toBe("https://cdn.loja.com/s.jpg");
  });

  it("retorna nulls quando não há metadados", () => {
    expect(parseOpenGraph("<html><body>nada</body></html>")).toEqual({
      title: null,
      description: null,
      imageUrl: null,
    });
  });

  it("ignora og:image com URL que não é http(s)", () => {
    const html = `<meta property="og:image" content="javascript:alert(1)">`;
    expect(parseOpenGraph(html).imageUrl).toBeNull();
  });
});
