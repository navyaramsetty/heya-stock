import { createRequire } from "node:module";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadEnvConfig(root);
const ffmpeg = process.env.FFMPEG_PATH;
if (!ffmpeg) throw new Error("Set FFMPEG_PATH to your FFmpeg executable.");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const destination = resolve(root, "public/video-thumbnails");
const manifestPath = resolve(root, "lib/video-thumbnails.json");
await mkdir(destination, { recursive: true });
let manifest = {};
try { manifest = JSON.parse(await readFile(manifestPath, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
function extract(url, path, seconds) {
  return new Promise((yes, no) => {
    const child = spawn(ffmpeg, ["-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-rw_timeout", "15000000", "-ss", String(seconds), "-i", url, "-frames:v", "1", "-vf", "scale=1280:-2,format=yuvj420p", "-threads", "1", "-q:v", "3", path], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
    let error = "";
    child.stderr.on("data", chunk => { error += chunk; });
    const timeout = setTimeout(() => child.kill(), 60000);
    child.on("error", err => { clearTimeout(timeout); no(err); });
    child.on("exit", code => { clearTimeout(timeout); if (code === 0) yes(); else no(new Error("Frame extraction failed: " + error.slice(-1500))); });
  });
}
let after = 0;
let count = 0;
while (true) {
  const { data, error } = await db.from("images").select("id,image_url")
    .eq("status", "approved").eq("media_type", "video").gt("id", after).order("id").limit(100);
  if (error) throw new Error(error.message);
  if (!data?.length) break;
  for (const item of data) {
    const url = item.image_url;
    if (!url?.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/")) throw new Error("Unrecognized public video storage for " + item.id);
    const hash = createHash("sha256").update(url).digest("hex").slice(0, 12);
    const filename = item.id + "-" + hash + ".jpg";
    const file = resolve(destination, filename);
    let exists = false;
    try { exists = (await stat(file)).size > 0; } catch { /* No previously generated thumbnail. */ }
    if (!exists) {
      try { await extract(url, file, 1); } catch { await extract(url, file, 0); }
      try { await sharp(file).metadata(); } catch { await extract(url, file, 0); }
    }
    const dimensions = await sharp(file).metadata();
    if (dimensions.format !== "jpeg" || dimensions.width < 60 || dimensions.height < 30) throw new Error("Invalid thumbnail for " + item.id);
    manifest[url] = "/video-thumbnails/" + filename;
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log("Video " + item.id + ": " + filename + " (" + dimensions.width + "x" + dimensions.height + ")");
    count++;
  }
  after = data[data.length - 1].id;
}
console.log("Validated " + count + " video thumbnails. No remote files or records were changed.");
