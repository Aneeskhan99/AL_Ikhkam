import "server-only";
import sanitizeHtml from "sanitize-html";

/** Clean article HTML from the rich text editor before it is stored and shown publicly. */
export function cleanArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "cite", "img", "br", "hr", "code", "pre", "figure", "figcaption", "span"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      p: ["class", "lang", "dir"],
      span: ["class", "lang", "dir"],
      h2: ["dir"],
      h3: ["dir"],
      h4: ["dir"],
      blockquote: ["dir"],
    },
    allowedClasses: { p: ["arabic"], span: ["arabic"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href || "");
        return { tagName, attribs: { ...attribs, ...(external ? { target: "_blank", rel: "noopener" } : {}) } };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !/^(\/|https:\/\/)/.test(frame.attribs.src || ""),
  }).trim();
}

export function cleanPlain(v: string, max: number) {
  return sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} }).replace(/&amp;/g, "&").trim().slice(0, max);
}
