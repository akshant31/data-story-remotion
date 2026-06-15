#!/usr/bin/env node
/**
 * Narration -> voiceover audio.
 *
 *   node scripts/voiceover.mjs [file.xlsx] [--dry] [--force]
 *
 * Reads the Narration column, sends each clip's line to a text-to-speech
 * provider, and writes audio to public/vo/<reel>/<NN>.(mp3|wav) plus a
 * public/vo/<reel>/timing.json the renderer uses to sync + pace.
 *
 * Pick a provider with env vars (a local .env file is auto-loaded):
 *
 *   Sarvam (IN)  VO_PROVIDER=sarvam      SARVAM_API_KEY=...   [VO_VOICE=shubh]
 *                optional: VO_LANG=en-IN  VO_PACE=1.0  VO_FORMAT=wav|mp3
 *   OpenAI       VO_PROVIDER=openai      OPENAI_API_KEY=...   [VO_VOICE=alloy]
 *   ElevenLabs   VO_PROVIDER=elevenlabs  ELEVENLABS_API_KEY=. [VO_VOICE=<voiceId>]
 *
 * --dry    print what would be generated, call no APIs
 * --force  regenerate even if the audio file already exists
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import * as XLSX from "xlsx";
import { parseBuffer } from "music-metadata";

// Load a local .env file if present (so you can keep keys out of your shell).
try { process.loadEnvFile?.(); } catch { /* no .env, that's fine */ }

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--")) || "reels.xlsx";
const DRY = args.includes("--dry");
const FORCE = args.includes("--force");
const PROVIDER = (process.env.VO_PROVIDER || "sarvam").toLowerCase();

if (!existsSync(file)) {
  console.error(`✗ Can't find ${file}.`);
  process.exit(1);
}
const wb = XLSX.read(readFileSync(file), { type: "buffer" });
const ws = wb.Sheets["Reels"];
if (!ws) { console.error('✗ No "Reels" sheet.'); process.exit(1); }
const rows = XLSX.utils.sheet_to_json(ws, { range: 1, defval: "" });
const str = (v) => String(v ?? "").trim();

// group narration by reel, in row order
const reels = new Map();
for (const row of rows) {
  const name = str(row["Reel"]);
  if (!name || !str(row["Type"])) continue;
  if (!reels.has(name)) reels.set(name, []);
  reels.get(name).push(str(row["Narration"]));
}
if (reels.size === 0) { console.error("✗ No rows found."); process.exit(1); }

// ---------------- providers (each returns { data: Buffer, ext }) ----------------
async function ttsOpenAI(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Set OPENAI_API_KEY");
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.VO_MODEL || "gpt-4o-mini-tts",
      voice: process.env.VO_VOICE || "alloy",
      input: text,
      response_format: "mp3",
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`);
  return { data: Buffer.from(await r.arrayBuffer()), ext: "mp3" };
}

async function ttsElevenLabs(text) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("Set ELEVENLABS_API_KEY");
  const voice = process.env.VO_VOICE || "21m00Tcm4TlvDq8ikWAM"; // "Rachel"
  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: process.env.VO_MODEL || "eleven_flash_v2_5" }),
    }
  );
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
  return { data: Buffer.from(await r.arrayBuffer()), ext: "mp3" };
}

async function ttsSarvam(text) {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw new Error("Set SARVAM_API_KEY (in your shell or a .env file)");
  if (text.length > 2500) throw new Error(`Sarvam bulbul:v3 caps at 2500 chars (got ${text.length}).`);
  const codec = (process.env.VO_FORMAT || "wav").toLowerCase(); // wav | mp3
  const r = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: { "api-subscription-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      target_language_code: process.env.VO_LANG || "en-IN",
      speaker: (process.env.VO_VOICE || "shubh").toLowerCase(), // v3 speakers are lowercase
      model: process.env.VO_MODEL || "bulbul:v3",
      pace: Number(process.env.VO_PACE || 1), // 0.5 (slower) – 2.0 (faster)
      speech_sample_rate: Number(process.env.VO_SAMPLE_RATE || 24000),
      output_audio_codec: codec,
    }),
  });
  if (!r.ok) throw new Error(`Sarvam ${r.status}: ${await r.text()}`);
  const json = await r.json();
  const b64 = json.audios?.[0];
  if (!b64) throw new Error("Sarvam: no audio in response");
  return { data: Buffer.from(b64, "base64"), ext: codec === "mp3" ? "mp3" : "wav" };
}

const PROVIDERS = { openai: ttsOpenAI, elevenlabs: ttsElevenLabs, sarvam: ttsSarvam };
const tts = PROVIDERS[PROVIDER];
if (!tts) { console.error(`✗ Unknown VO_PROVIDER "${PROVIDER}". Use openai | elevenlabs | sarvam.`); process.exit(1); }

const slugify = (s) => s.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
const pad2 = (n) => String(n).padStart(2, "0");

console.log(`Provider: ${PROVIDER}${DRY ? "  (dry run)" : ""}\n`);
let totalChars = 0;

for (const [name, lines] of reels) {
  const slug = slugify(name);
  const dir = `public/vo/${slug}`;
  if (!DRY) mkdirSync(dir, { recursive: true });
  console.log(`● ${name}`);
  const timing = [];

  for (let i = 0; i < lines.length; i++) {
    const idx = i + 1;
    const text = lines[i];
    if (!text) { timing.push({ index: idx, file: null, text: "", seconds: 0 }); continue; }
    totalChars += text.length;

    if (DRY) {
      console.log(`   ${pad2(idx)}  (${text.length} chars)  ${text}`);
      continue;
    }

    let ext = "mp3";
    let outPath = `${dir}/${pad2(idx)}.${ext}`;
    const existsAny = ["mp3", "wav"].map((e) => `${dir}/${pad2(idx)}.${e}`).find(existsSync);

    if (existsAny && !FORCE) {
      outPath = existsAny; ext = existsAny.endsWith("wav") ? "wav" : "mp3";
    } else {
      const { data, ext: e } = await tts(text);
      ext = e; outPath = `${dir}/${pad2(idx)}.${ext}`;
      writeFileSync(outPath, data);
    }
    const meta = await parseBuffer(readFileSync(outPath));
    const seconds = Math.round((meta.format.duration || 0) * 100) / 100;
    timing.push({ index: idx, file: `${pad2(idx)}.${ext}`, text, seconds });
    console.log(`   ${pad2(idx)}  ${seconds}s  ${outPath}`);
  }

  if (!DRY) writeFileSync(`${dir}/timing.json`, JSON.stringify({ clips: timing }, null, 2));
}

console.log(
  DRY
    ? `\n✓ Dry run. ${totalChars} characters across ${reels.size} reels. Set a provider + API key and drop --dry to generate.`
    : `\n✓ Audio written to public/vo/. Now run: npm run reels  (voiceover is picked up automatically).`
);
