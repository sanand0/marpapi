import { Marp } from "@marp-team/marp-core";
import { load } from "js-yaml";
import home from "./home.html";

const browserScript = "https://cdn.jsdelivr.net/npm/@marp-team/marp-core/lib/browser.js";
const bespokeScript = "https://cdn.jsdelivr.net/npm/@marp-team/marp-cli/lib/bespoke.js";

const marp = new Marp({ html: true });

const parseFrontMatter = (md) => {
  if (!md.startsWith("---")) return { content: md, meta: {} };
  const end = md.indexOf("\n---", 3);
  if (end < 0) return { content: md, meta: {} };
  const yaml = md.slice(3, end).trim();
  let meta = {};
  try {
    meta = load(yaml) || {};
  } catch {}
  return { content: md.slice(end + 4), meta };
};

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname === "/marp" && request.method === "POST") {
      const text = await request.text();
      if (!text.trim()) return new Response("empty body", { status: 400 });

      const { content, meta } = parseFrontMatter(text);
      const { html, css } = marp.render(content);

      const head = [];
      const push = (k, v, p) => {
        if (!v) return;
        head.push(`<meta ${p ? "property" : "name"}="${k}" content="${v}">`);
      };

      if (meta.title) head.push(`<title>${meta.title}</title>`);
      push("og:title", meta.title, true);
      push("description", meta.description);
      push("author", meta.author);
      push("article:author", meta.author, true);
      push("keywords", meta.keywords);
      if (meta.url) head.push(`<link rel="canonical" href="${meta.url}">`);
      push("og:url", meta.url, true);
      push("og:image", meta["og-image"], true);
      head.push(
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width,height=device-height,initial-scale=1.0">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta http-equiv="X-UA-Compatible" content="ie=edge">',
        '<meta property="og:type" content="website">',
        '<meta name="twitter:card" content="summary">',
      );

      head.push(`<style>${css}</style>`);

      const body =
        `<div class="bespoke-marp-parent">${html}</div>` +
        `<script src="${browserScript}"></script>` +
        `<script src="${bespokeScript}"></script>`;

      const out = `<!DOCTYPE html><html><head>${head.join("")}</head><body>${body}</body></html>`;
      return new Response(out, { headers: { "content-type": "text/html" } });
    }

    if (pathname === "/") return new Response(home, { headers: { "content-type": "text/html" } });
    return new Response("Not Found", { status: 404 });
  },
};
