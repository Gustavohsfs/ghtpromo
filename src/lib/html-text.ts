/**
 * Conversão de HTML "sujo" de feeds externos (ex.: datafeed Awin) em texto
 * puro seguro para UI/JSON-LD: remove tags, decodifica entidades HTML e
 * normaliza espaços. Sem dependências — cobre o conjunto Latin-1 usado em
 * descrições pt-BR.
 */

/** Entidades nomeadas minúsculas; as maiúsculas (Aacute…) são derivadas. */
const LOWER_ENTITIES: Record<string, string> = {
  aacute: "á",
  agrave: "à",
  acirc: "â",
  atilde: "ã",
  auml: "ä",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  euml: "ë",
  iacute: "í",
  igrave: "ì",
  icirc: "î",
  iuml: "ï",
  oacute: "ó",
  ograve: "ò",
  ocirc: "ô",
  otilde: "õ",
  ouml: "ö",
  uacute: "ú",
  ugrave: "ù",
  ucirc: "û",
  uuml: "ü",
  ccedil: "ç",
  ntilde: "ñ",
  yacute: "ý",
};

const NAMED_ENTITIES: Record<string, string> = {
  ...LOWER_ENTITIES,
  ...Object.fromEntries(
    Object.entries(LOWER_ENTITIES).map(([name, char]) => [
      name[0].toUpperCase() + name.slice(1),
      char.toUpperCase(),
    ]),
  ),
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  ordm: "º",
  ordf: "ª",
  deg: "°",
  sup2: "²",
  sup3: "³",
  frac12: "½",
  plusmn: "±",
  micro: "µ",
  middot: "·",
  bull: "•",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "'",
  rsquo: "'",
  ldquo: "“",
  rdquo: "”",
  copy: "©",
  reg: "®",
  trade: "™",
  times: "×",
};

/** Decodifica &#123;/&#xAB;/&nome;. Entidade nomeada desconhecida vira espaço. */
function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (match, code: string) => {
      try {
        return String.fromCodePoint(Number(code));
      } catch {
        return " ";
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (match, code: string) => {
      try {
        return String.fromCodePoint(Number.parseInt(code, 16));
      } catch {
        return " ";
      }
    })
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, name: string) => NAMED_ENTITIES[name] ?? " ");
}

/**
 * Converte HTML em texto puro: tags removidas, entidades decodificadas,
 * espaços colapsados. Retorna null quando não sobra texto útil. Com
 * maxLength, trunca em fronteira de palavra e encerra com reticências.
 */
export function htmlToPlainText(raw: string, maxLength?: number): string | null {
  const text = decodeEntities(raw.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  if (maxLength === undefined || text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
}
