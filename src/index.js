import { Marp } from "@marp-team/marp-core";
import home from "./home.html";
const externalScript = "https://cdn.jsdelivr.net/npm/@marp-team/marp-core/browser.js";

const marp = new Marp({ html: true });

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname === "/marp" && request.method === "POST") {
      const text = await request.text();
      if (!text.trim()) return new Response("empty body", { status: 400 });
      const { html, css } = marp.render(text);
      const meta =
        '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,height=device-height,initial-scale=1.0">';
      const body = `<style>${css}</style><div class="bespoke-marp-parent">${html}</div><script src="${externalScript}"></script>`;
      const out = `<!DOCTYPE html><html><head>${meta}</head><body>${body}</body></html>`;
      return new Response(out, { headers: { "content-type": "text/html" } });
    }

    if (pathname === "/") return new Response(home, { headers: { "content-type": "text/html" } });
    return new Response("Not Found", { status: 404 });
  },
};
