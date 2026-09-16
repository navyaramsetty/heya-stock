import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function harness(responses = []) {
  const requests = [];
  const modules = new Map();
  function load(file) {
    const absolute = resolve(root, file);
    if (modules.has(absolute)) return modules.get(absolute);
    const source = readFileSync(absolute, "utf8");
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const compiled = { exports: {} };
    function require(name) {
      if (name === "react") return { cache: fn => fn };
      if (name === "@supabase/supabase-js") return { createClient: () => ({
        from: () => {
          const operations = [];
          requests.push(operations);
          const builder = {};
          for (const method of ["select", "eq", "ilike", "or", "order", "range", "gt", "limit", "maybeSingle"]) {
            builder[method] = (...args) => { operations.push([method, ...args]); return builder; };
          }
          builder.then = (yes, no) => Promise.resolve(responses.shift() || { data: [], error: null, count: 0 }).then(yes, no);
          return builder;
        },
      }) };
      if (name.startsWith(".")) return load(resolve(dirname(absolute), name + ".ts"));
      throw new Error("Unexpected import: " + name);
    }
    vm.runInNewContext(output, { module: compiled, exports: compiled.exports, require, process, URL, console });
    modules.set(absolute, compiled.exports);
    return compiled.exports;
  }
  return { load, requests };
}
test("metadata supplies page-specific canonical and both share images", () => {
  const { pageMetadata, SITE_URL, DEFAULT_IMAGE } = harness().load("lib/seo.ts");
  const value = pageMetadata("Contact", "Support", "/contact");
  assert.equal(value.title, "Contact");
  assert.equal(value.alternates.canonical, "/contact");
  assert.equal(value.openGraph.url, SITE_URL + "/contact");
  assert.equal(value.twitter.title, "Contact | Heya");
  assert.equal(value.openGraph.images[0].url, DEFAULT_IMAGE);
  assert.equal(value.twitter.images[0], DEFAULT_IMAGE);
});
test("slugs encode Unicode and special characters consistently", () => {
  const { categorySlug } = harness().load("lib/seo.ts");
  assert.equal(categorySlug("  Travel Photos  "), "travel-photos");
  assert.equal(categorySlug("Food & Drink"), "food-%26-drink");
});
test("JSON-LD cannot terminate its script element", () => {
  const { jsonLd } = harness().load("lib/seo.ts");
  const value = { name: "</script><script>alert(1)</script>" };
  const encoded = jsonLd(value);
  assert.equal(encoded.includes("<"), false);
  assert.deepEqual(JSON.parse(encoded), value);
});
test("invalid media identifiers do not query the database", async () => {
  const { load, requests } = harness();
  const { getMedia } = load("lib/catalog.ts");
  for (const value of ["0", "-1", "abc", "1.5", "1e2", "9007199254740992"]) assert.equal(await getMedia(value), null);
  assert.equal(requests.length, 0);
});
test("database outages are not presented as missing media", async () => {
  const { load } = harness([{ data: null, error: { message: "offline" } }]);
  await assert.rejects(load("lib/catalog.ts").getMedia("2"), /Unable to load media/);
});
test("sitemap batching continues across a server row cap smaller than 500", async () => {
  const { load, requests } = harness([
    { data: [{ id: 2 }, { id: 5 }], error: null },
    { data: [{ id: 9 }], error: null },
    { data: [], error: null },
  ]);
  const items = await load("lib/catalog.ts").getCatalogIndex();
  assert.equal(items.length, 3);
  assert.deepEqual(requests.map(ops => ops.find(op => op[0] === "gt")[2]), [0, 5, 9]);
});
test("pagination uses a stable order and quotes literal search input", async () => {
  const { load, requests } = harness([{ data: [], count: 100, error: null }]);
  const search = 'office, tags.eq.private%_';
  await load("lib/catalog.ts").getMediaPage(2, search, "video");
  const ops = requests[0];
  assert.deepEqual(ops.find(op => op[0] === "range"), ["range", 24, 47]);
  assert.ok(ops.some(op => op[0] === "eq" && op[1] === "status" && op[2] === "approved"));
  assert.ok(ops.some(op => op[0] === "eq" && op[1] === "media_type" && op[2] === "video"));
  const filter = ops.find(op => op[0] === "or")[1];
  assert.ok(filter.startsWith('title.ilike."'));
  assert.ok(filter.includes("tags.eq.private"));
  assert.equal(ops.filter(op => op[0] === "order").length, 2);
});
test("page numbers reject unsafe ranges and category URLs are deduplicated", async () => {
  const { load } = harness([
    { data: [{ id: 1, category: "Nature", image_url: "one" }, { id: 2, category: "nature", image_url: "two" }], error: null },
    { data: [], error: null },
  ]);
  const catalog = load("lib/catalog.ts");
  for (const value of ["-1", "abc", "1000000", "1.5", ["2", "3"]]) assert.equal(catalog.pageNumber(value), 1);
  assert.equal(catalog.pageNumber("2"), 2);
  const categories = await catalog.getCategories();
  assert.equal(categories.length, 1);
  assert.equal(categories[0].count, 2);
});

test("out-of-range database responses become an empty page for 404 handling", async () => {
  const { load } = harness([{ data: null, error: { code: "PGRST103", message: "Requested range not satisfiable" } }]);
  const page = await load("lib/catalog.ts").getMediaPage(999999);
  assert.equal(page.items.length, 0);
});
