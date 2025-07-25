import { describe, it, expect, beforeAll } from "vitest";
import { Miniflare } from "miniflare";
import { execSync } from "node:child_process";

let mf;

beforeAll(async () => {
  execSync("npx wrangler build");
  mf = new Miniflare({
    scriptPath: "dist/index.js",
    modules: true,
    modulesRules: [
      { type: "Text", include: ["**/*.html"] },
      { type: "Text", include: ["**/*.js?raw"] },
    ],
  });
});

describe("worker", () => {
  it("renders markdown as slideshow", async () => {
    const res = await mf.dispatchFetch("http://localhost/marp", {
      method: "POST",
      body: "# Title",
    });
    const html = await res.text();
    expect(html).toContain("bespoke-marp-parent");
    expect(html).toContain("<h1");
  });

  it("serves homepage", async () => {
    const res = await mf.dispatchFetch("http://localhost/");
    expect(res.headers.get("content-type")).toContain("text/html");
  });
});
