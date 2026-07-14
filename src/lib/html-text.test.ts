import { describe, expect, it } from "vitest";

import { htmlToPlainText } from "./html-text";

describe("htmlToPlainText", () => {
  it("decodifica entidades HTML nomeadas de acentuação (pt-BR)", () => {
    expect(htmlToPlainText("usu&aacute;rios de condutividade t&eacute;rmica")).toBe(
      "usuários de condutividade térmica",
    );
    expect(htmlToPlainText("&Aacute;udio para sess&otilde;es de grava&ccedil;&atilde;o")).toBe(
      "Áudio para sessões de gravação",
    );
  });

  it("converte &nbsp; em espaço simples, sem duplicar", () => {
    expect(htmlToPlainText("JBL Tune 530BT &nbsp; Pure Bass")).toBe("JBL Tune 530BT Pure Bass");
  });

  it("decodifica entidades numéricas decimais e hexadecimais", () => {
    expect(htmlToPlainText("caf&#233; &#x26; leite")).toBe("café & leite");
  });

  it("remove tags HTML", () => {
    expect(htmlToPlainText("<p>Som <b>potente</b></p>")).toBe("Som potente");
  });

  it("remove entidades desconhecidas em vez de vazá-las para a UI", () => {
    expect(htmlToPlainText("Garantia&foobar;estendida")).toBe("Garantia estendida");
  });

  it("preserva & literal fora de entidades", () => {
    expect(htmlToPlainText("Dolby & DTS")).toBe("Dolby & DTS");
  });

  it("colapsa espaços e retorna null para texto vazio", () => {
    expect(htmlToPlainText("  \n\t ")).toBeNull();
    expect(htmlToPlainText("<div>&nbsp;</div>")).toBeNull();
  });

  it("trunca no limite em fronteira de palavra com reticências", () => {
    const result = htmlToPlainText("Fone de ouvido com cancelamento de ruído", 20);
    expect(result).toBe("Fone de ouvido com…");
    expect((result as string).length).toBeLessThanOrEqual(20);
  });
});
