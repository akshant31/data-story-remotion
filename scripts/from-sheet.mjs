#!/usr/bin/env node
/**
 * Spreadsheet -> Reels.
 *
 *   node scripts/from-sheet.mjs [file.xlsx] [--dry] [--cover]
 *
 *   (default file: reels.xlsx)
 *   --dry    parse + write props JSON only, don't render videos
 *   --cover  also export a cover.png thumbnail per reel
 *
 * Each row of the "Reels" sheet becomes one clip. Rows are grouped by the
 * "Reel" column; each group renders to out/<reel>.mp4.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import * as XLSX from "xlsx";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--")) || "reels.xlsx";
const DRY = args.includes("--dry");
const COVER = args.includes("--cover");
const NOFIT = args.includes("--no-fit");
const BRAND = "DATA STORY";

if (!existsSync(file)) {
  console.error(`✗ Can't find ${file}. Pass a path: node scripts/from-sheet.mjs path/to/reels.xlsx`);
  process.exit(1);
}

const wb = XLSX.read(readFileSync(file), { type: "buffer" });
const ws = wb.Sheets["Reels"];
if (!ws) {
  console.error('✗ No sheet named "Reels" in the file.');
  process.exit(1);
}
// Header is on row 2 (row 1 is the colored group band) -> range: 1.
const rows = XLSX.utils.sheet_to_json(ws, { range: 1, defval: "" });

const str = (v) => String(v ?? "").trim();
const num = (v) => {
  const n = Number(str(v).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const truthy = (v) => /^(true|yes|1|y)$/i.test(str(v));

// "Label=Value; Label=Value" -> [{label, raw}]
const pairs = (v) =>
  str(v)
    .split(/[;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => {
      const i = p.indexOf("=");
      return i >= 0
        ? { label: p.slice(0, i).trim(), raw: p.slice(i + 1).trim() }
        : { label: p.trim(), raw: "" };
    });

function toClip(row, n) {
  const type = str(row["Type"]).toLowerCase();
  const base = { type, durationInSeconds: num(row["Duration (sec)"]) || 3 };
  const eyebrow = str(row["Eyebrow"]);
  if (eyebrow) base.eyebrow = eyebrow;

  switch (type) {
    case "title": {
      const { eyebrow: _e, ...rest } = base;
      return { ...rest, kicker: eyebrow || undefined, headline: str(row["Title"]), subhead: str(row["Subtitle"]) || undefined };
    }
    case "stat":
      return {
        ...base,
        value: num(row["Value"]),
        prefix: str(row["Prefix"]) || undefined,
        suffix: str(row["Suffix"]) || undefined,
        decimals: row["Decimals"] === "" ? 0 : num(row["Decimals"]),
        label: str(row["Title"]),
        caption: str(row["Subtitle"]) || undefined,
        tone: str(row["Tone"]) || "neutral",
      };
    case "bars":
      return { ...base, title: str(row["Title"]), unit: str(row["Unit"]) || undefined, data: pairs(row["Data"]).map((p) => ({ label: p.label, value: num(p.raw) })) };
    case "pie":
      return { ...base, title: str(row["Title"]), donut: row["Donut"] === "" ? true : truthy(row["Donut"]), data: pairs(row["Data"]).map((p) => ({ label: p.label, value: num(p.raw) })) };
    case "comparison": {
      const [a, b] = pairs(row["Data"]);
      const suffix = str(row["Suffix"]) || undefined;
      return { ...base, title: str(row["Title"]), left: { label: a?.label ?? "A", value: num(a?.raw), suffix }, right: { label: b?.label ?? "B", value: num(b?.raw), suffix } };
    }
    case "ranking":
      return { ...base, title: str(row["Title"]), items: pairs(row["Data"]).map((p) => ({ label: p.label, value: p.raw || undefined })) };
    case "outro":
      return { ...base, message: str(row["Title"]), cta: str(row["Subtitle"]) || undefined, handle: str(row["Handle"]) || undefined };
    default:
      throw new Error(`Row ${n}: unknown Type "${row["Type"]}". Use one of: title, stat, bars, pie, comparison, ranking, outro.`);
  }
}

// group rows by Reel, preserving order
const reels = new Map();
const bgState = {}; // per-reel background that persists until changed
rows.forEach((row, i) => {
  const name = str(row["Reel"]);
  if (!name || !str(row["Type"])) return; // skip blank rows
  if (!reels.has(name)) reels.set(name, { clips: [], script: [], music: "", musicVolume: undefined });
  const reel = reels.get(name);
  const clip = toClip(row, i + 3);

  // Reel-wide background music: first non-empty Music cell in the reel wins.
  const music = str(row["Music"]);
  if (music && !reel.music) {
    reel.music = music;
    const mv = str(row["Music Vol"]);
    if (mv) reel.musicVolume = num(mv);
  }

  // Background video persists within a reel: set it on a row and it carries
  // to following rows until you change it. Type "none" to clear it.
  const cell = str(row["BG"]);
  if (!bgState[name]) bgState[name] = null;
  if (cell) {
    bgState[name] = /^(none|-)$/i.test(cell)
      ? null
      : {
          bg: cell,
          bgOpacity: str(row["BG Opacity"]) ? num(row["BG Opacity"]) : 0.2,
          bgBlur: str(row["BG Blur"]) ? num(row["BG Blur"]) : 0,
        };
  }
  if (bgState[name]) Object.assign(clip, bgState[name]);

  reels.get(name).clips.push(clip);
  reels.get(name).script.push({ dur: clip.durationInSeconds, type: clip.type, text: str(row["Narration"]) });
});

if (reels.size === 0) {
  console.error("✗ No rows found. Fill in the Reels sheet first.");
  process.exit(1);
}

const tc = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

mkdirSync("out/props", { recursive: true });
mkdirSync("out/scripts", { recursive: true });

for (const [name, { clips, script, music, musicVolume }] of reels) {
  const slug = name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();

  // Attach voiceover audio if it's been generated for this reel. Audio never
  // SHORTENS a clip (your pacing is the floor); it only extends a clip whose
  // narration runs longer than its set duration. Use --no-fit to ignore length.
  const timingPath = `public/vo/${slug}/timing.json`;
  if (existsSync(timingPath)) {
    try {
      const timing = JSON.parse(readFileSync(timingPath, "utf8")).clips || [];
      const byIndex = new Map(timing.map((t) => [t.index, t]));
      clips.forEach((clip, n) => {
        const t = byIndex.get(n + 1);
        if (t && t.file) {
          clip.vo = `vo/${slug}/${t.file}`;
          if (!NOFIT && t.seconds) {
            clip.durationInSeconds = Math.max(clip.durationInSeconds, Math.round((t.seconds + 0.5) * 100) / 100);
          }
        }
      });
    } catch (e) {
      console.warn(`  ! couldn't read ${timingPath}: ${e.message}`);
    }
  }

  const propsPath = `out/props/${slug}.json`;
  const props = { clips, brand: BRAND };
  if (music) {
    props.music = music;
    if (musicVolume != null) props.musicVolume = musicVolume;
  }
  writeFileSync(propsPath, JSON.stringify(props, null, 2));
  const secs = clips.reduce((s, c) => s + c.durationInSeconds, 0);

  // voiceover script with timecodes (uses final, possibly audio-fitted durations)
  const lines = [`DATA STORY — voiceover script`, `Reel: ${name}   ·   ${secs}s   ·   ${clips.length} clips`, ""];
  let t = 0;
  script.forEach((s, n) => {
    lines.push(`[${tc(t)}]  ${s.text || "(no narration)"}`);
    t += clips[n].durationInSeconds;
  });
  const scriptPath = `out/scripts/${slug}.txt`;
  writeFileSync(scriptPath, lines.join("\n") + "\n");

  console.log(`\n● ${name} — ${clips.length} clips, ${secs}s -> ${propsPath}\n  script -> ${scriptPath}`);

  if (DRY) continue;

  const out = `out/${slug}.mp4`;
  console.log(`  rendering ${out} ...`);
  execSync(`npx remotion render Video "${out}" --props="${propsPath}"`, { stdio: "inherit", shell: true });

  if (COVER) {
    const cover = `out/${slug}.png`;
    execSync(`npx remotion still Video "${cover}" --props="${propsPath}" --frame=15`, { stdio: "inherit", shell: true });
  }
}

console.log(DRY ? "\n✓ Dry run complete — props in out/props/, scripts in out/scripts/. Drop --dry to render." : "\n✓ Done. Videos in /out, voiceover scripts in out/scripts/.");
