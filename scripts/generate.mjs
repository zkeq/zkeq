#!/usr/bin/env node
/**
 * Individual 中控台 console-card SVGs. Not a full-page website capture.
 */

import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { loadData } from "./data.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = join(ROOT, "svg")
const HOME = "https://zkeq-projects.dev-tool.cool/"
const FONT =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', sans-serif"
const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
const HEAD = "ui-serif, Georgia, 'Songti SC', 'Noto Serif SC', serif"

const THEMES = {
  light: {
    page: "#ffffff",
    card: "#ffffff",
    inner: "#f6f8fa",
    fg: "#1f2328",
    muted: "#656d76",
    faint: "#8c959f",
    border: "#d0d7de",
    borderStrong: "#afb8c1",
    invert: "#ffffff",
    fill: "#1f2328",
    emerald: "#1a7f37",
    emeraldSoft: "rgba(26,127,55,0.10)",
    emeraldBorder: "rgba(26,127,55,0.40)",
    cyan: "#0969da",
    cyanSoft: "rgba(9,105,218,0.10)",
    indigo: "#8250df",
    indigoSoft: "rgba(130,80,223,0.10)",
    orange: "#bc4c00",
    orangeSoft: "rgba(188,76,0,0.10)",
    orangeBorder: "rgba(188,76,0,0.35)",
    amber: "#9a6700",
    amberSoft: "rgba(154,103,0,0.12)",
    red: "#cf222e",
    redSoft: "rgba(207,34,46,0.10)",
    pulse: ["#d0d7de", "rgba(188,76,0,0.22)", "rgba(188,76,0,0.45)", "rgba(188,76,0,0.72)", "#bc4c00"],
  },
  dark: {
    page: "#0d1117",
    card: "#161b22",
    inner: "#0d1117",
    fg: "#e6edf3",
    muted: "#8b949e",
    faint: "#6e7681",
    border: "#30363d",
    borderStrong: "#484f58",
    invert: "#0d1117",
    fill: "#e6edf3",
    emerald: "#3fb950",
    emeraldSoft: "rgba(63,185,80,0.12)",
    emeraldBorder: "rgba(63,185,80,0.40)",
    cyan: "#58a6ff",
    cyanSoft: "rgba(88,166,255,0.12)",
    indigo: "#a371f7",
    indigoSoft: "rgba(163,113,247,0.12)",
    orange: "#db6d28",
    orangeSoft: "rgba(219,109,40,0.14)",
    orangeBorder: "rgba(219,109,40,0.40)",
    amber: "#d29922",
    amberSoft: "rgba(210,153,34,0.14)",
    red: "#f85149",
    redSoft: "rgba(248,81,73,0.12)",
    pulse: ["#21262d", "rgba(219,109,40,0.28)", "rgba(219,109,40,0.50)", "rgba(219,109,40,0.75)", "#db6d28"],
  },
}

const LAYOUT = {
  leftW: 742,
  rightW: 580,
  rowH: 452,
  colW: 310,
  colH: 268,
}

function featuredName(name = "") {
  return /vibe cook|烹饪|财务|记账|渺软/i.test(name)
}

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function unitWidth(ch) {
  return /[\x00-\xff]/.test(ch) ? 0.55 : 1
}

function fit(str, max) {
  let used = 0
  let out = ""
  for (const ch of [...String(str)]) {
    const w = unitWidth(ch)
    if (used + w > max) return `${out}…`
    out += ch
    used += w
  }
  return out
}

function wrapFit(str, max, maxLines) {
  const chars = [...String(str)]
  const lines = []
  let cur = ""
  let used = 0
  for (const ch of chars) {
    const w = unitWidth(ch)
    if (used + w > max) {
      lines.push(cur)
      cur = ch
      used = w
      if (lines.length === maxLines) break
    } else {
      cur += ch
      used += w
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur)
  const consumed = lines.join("").length
  if (consumed < chars.length && lines.length) {
    lines[lines.length - 1] = fit(lines[lines.length - 1], max - 1)
  }
  return lines
}

function css(t) {
  return `
    .hud { font-family: ${MONO}; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; }
    .mono { font-family: ${MONO}; }
    .sans { font-family: ${FONT}; }
    .head { font-family: ${HEAD}; }
    .led { animation: blink 2.4s ease-in-out infinite; }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
  `
}

function svg(w, h, t, body, stroke) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" fill="none">
  <title>Zkeq Projects</title>
  <desc>${HOME}</desc>
  <style><![CDATA[${css(t)}]]></style>
  <rect width="${w}" height="${h}" rx="14" fill="${t.card}" stroke="${stroke || t.border}"/>
  ${body}
</svg>
`
}

function iconBox(x, y, color, soft, d) {
  return `
    <rect x="${x}" y="${y}" width="28" height="28" rx="8" fill="${soft}"/>
    <g transform="translate(${x + 7},${y + 7})" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</g>
  `
}

function header(t, w, x, y, color, soft, icon, tag, title, right = "") {
  return `
    ${iconBox(x, y, color, soft, icon)}
    <text class="hud" x="${x + 36}" y="${y + 11}" fill="${color}" font-weight="700">${esc(tag)}</text>
    <text class="head" x="${x + 36}" y="${y + 28}" fill="${t.fg}" font-size="16" font-weight="700">${esc(title)}</text>
    ${right}
    <line x1="${x}" y1="${y + 40}" x2="${w - 16}" y2="${y + 40}" stroke="${t.border}" />
  `
}

function footer(t, w, h, left, right, rightColor) {
  return `
    <line x1="16" y1="${h - 36}" x2="${w - 16}" y2="${h - 36}" stroke="${t.border}"/>
    <text class="mono" x="16" y="${h - 16}" fill="${t.muted}" font-size="10">${esc(left)}</text>
    <text class="sans" x="${w - 16}" y="${h - 16}" text-anchor="end" fill="${rightColor || t.fg}" font-size="11">${esc(right)}</text>
  `
}

function renderHud(t, data) {
  const w = 900
  const h = 132
  return svg(
    w,
    h,
    t,
    `
    <rect x="16" y="14" width="268" height="22" rx="11" fill="${t.emeraldSoft}" stroke="${t.emerald}" stroke-opacity="0.28"/>
    <circle class="led" cx="30" cy="25" r="3.2" fill="${t.emerald}"/>
    <text class="hud" x="40" y="29" fill="${t.emerald}" font-weight="700">SYSTEM: ALL SYSTEMS OPERATIONAL</text>
    <text class="mono" x="298" y="29" fill="${t.muted}" font-size="10">SHENZHEN · NANSHAN [22.53° N, 113.93° E]</text>
    <rect x="694" y="12" width="96" height="24" rx="8" fill="${t.fill}"/>
    <text class="mono" x="742" y="28" text-anchor="middle" font-size="10" fill="${t.invert}" font-weight="700">HUD 中控台  1</text>
    <rect x="794" y="12" width="90" height="24" rx="8" fill="${t.inner}" stroke="${t.border}"/>
    <text class="mono" x="839" y="28" text-anchor="middle" font-size="10" fill="${t.muted}">叙事长文  2</text>

    ${chip(16, 48, 210, "在线核心产品", `${data.projectCount} units`, t.emerald, t)}
    ${chip(236, 48, 210, "CNB / 渺软仓库", `${data.cnbRepos} repos`, t.cyan, t)}
    ${chip(456, 48, 210, "GitHub 累计提交", `${data.commits}+`, t.amber, t)}
    ${chip(676, 48, 208, "博客文章沉淀", `${data.postCount}+ posts`, t.indigo, t)}
    `
  )
}

function chip(x, y, w, label, value, accent, t) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="68" rx="12" fill="${t.inner}" stroke="${t.border}"/>
    <text class="hud" x="${x + 14}" y="${y + 22}" fill="${t.muted}">${esc(label)}</text>
    <text class="mono" x="${x + 14}" y="${y + 48}" fill="${t.fg}" font-size="20" font-weight="700">${esc(value)}</text>
    <circle cx="${x + w - 18}" cy="${y + 34}" r="3.5" fill="${accent}"/>
  `
}

function renderProducts(t, products = [], total = 0) {
  const w = LAYOUT.leftW
  const h = LAYOUT.rowH
  const pad = 16
  const gutter = 12
  const tileW = (w - pad * 2 - gutter) / 2
  const top = 64
  const footerH = 38
  const tileH = 108
  const rowGap = (h - top - footerH - tileH * 3) / 2
  const clips = products.map((_, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = pad + col * (tileW + gutter)
    const y = top + row * (tileH + rowGap)
    return `<clipPath id="p${i}"><rect x="${x + 10}" y="${y + 26}" width="${tileW - 20}" height="52" rx="4"/></clipPath>`
  }).join("")
  const tiles = products.map((p, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = pad + col * (tileW + gutter)
    const y = top + row * (tileH + rowGap)
    const featured = p.featured || featuredName(p.name)
    const stroke = featured ? t.emeraldBorder : t.border
    const bg = featured ? t.emeraldSoft : t.inner
    const title = fit(p.name, 20)
    const descLines = wrapFit(p.desc, 24, 2)
    const desc = descLines
      .map(
        (line, li) =>
          `<text class="sans" x="${x + 12}" y="${y + 58 + li * 15}" fill="${t.muted}" font-size="11">${esc(line)}</text>`
      )
      .join("")
    const tags = p.tags
      .slice(0, 3)
      .map((tag, ti) => {
        const label = fit(tag, 8)
        return `<rect x="${x + 12 + ti * 78}" y="${y + tileH - 22}" width="72" height="14" rx="3" fill="${t.card}" stroke="${t.border}"/>
           <text class="mono" x="${x + 48 + ti * 78}" y="${y + tileH - 12}" text-anchor="middle" fill="${t.muted}" font-size="8">${esc(label)}</text>`
      })
      .join("")
    return `
      <rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" rx="10" fill="${bg}" stroke="${stroke}"/>
      <circle class="led" cx="${x + 18}" cy="${y + 16}" r="3" fill="${t.emerald}"/>
      <text class="hud" x="${x + 28}" y="${y + 20}" fill="${t.emerald}" font-size="8" font-weight="700">ONLINE</text>
      ${featured ? `<rect x="${x + 78}" y="${y + 8}" width="32" height="14" rx="3" fill="${t.amberSoft}"/><text class="mono" x="${x + 94}" y="${y + 18}" text-anchor="middle" fill="${t.amber}" font-size="8">★ 重点</text>` : ""}
      <text class="sans" x="${x + tileW - 16}" y="${y + 20}" fill="${t.muted}" font-size="11">↗</text>
      <g clip-path="url(#p${i})">
        <text class="head" x="${x + 12}" y="${y + 42}" fill="${t.fg}" font-size="13" font-weight="700">${esc(title)}</text>
        ${desc}
      </g>
      ${tags}
    `
  }).join("")

  return svg(
    w,
    h,
    t,
    `
    <defs>${clips}</defs>
    ${header(t, w, 16, 16, t.emerald, t.emeraldSoft, '<path d="M2 9h10M2 4h14M2 14h7"/>', "ACTIVE PRODUCTS MATRIX", "核心在研与生活系统", `
      <rect x="${w - 210}" y="18" width="58" height="18" rx="6" fill="${t.fill}"/>
      <text class="mono" x="${w - 181}" y="31" text-anchor="middle" font-size="9" fill="${t.invert}">全部 (${total})</text>
      <text class="mono" x="${w - 130}" y="31" fill="${t.muted}" font-size="9">生活</text>
      <text class="mono" x="${w - 92}" y="31" fill="${t.muted}" font-size="9">AI</text>
      <text class="mono" x="${w - 60}" y="31" fill="${t.muted}" font-size="9">基建</text>
    `)}
    ${tiles}
    ${footer(t, w, h, `PPS Gateway · ${total} Projects`, "查看完整作品集清单 →")}
    `
  )
}

function renderTalk(t, data) {
  const recordings = data.recordings || []
  const groups = data.subGroups || []
  const w = LAYOUT.rightW
  const h = LAYOUT.rowH
  const inner = w - 32
  const recTop = 168
  const recH = 76
  const recGap = (h - 38 - recTop - recH * 3) / 2
  const rows = recordings.map((r, i) => {
    const y = recTop + i * (recH + recGap)
    return `
      <rect x="16" y="${y}" width="${inner}" height="${recH}" rx="10" fill="${t.inner}" stroke="${t.border}"/>
      <text class="mono" x="28" y="${y + 18}" fill="${t.cyan}" font-size="9" font-weight="700">[${r.date}]</text>
      <text class="mono" x="176" y="${y + 18}" fill="${t.muted}" font-size="8">${esc(r.duration)}</text>
      <rect x="${w - 86}" y="${y + 8}" width="58" height="14" rx="3" fill="${t.card}" stroke="${t.border}"/>
      <text class="mono" x="${w - 57}" y="${y + 18}" text-anchor="middle" fill="${t.muted}" font-size="8">#${esc(r.tag)}</text>
      <text class="head" x="28" y="${y + 40}" fill="${t.fg}" font-size="13" font-weight="700">${esc(fit(r.title, 24))}</text>
      <text class="sans" x="28" y="${y + 60}" fill="${t.muted}" font-size="10">${esc(fit(r.summary, 32))}</text>
    `
  }).join("")

  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.cyan, t.cyanSoft, '<path d="M7 2a4 4 0 0 1 0 8M7 10v3M4 15h6"/><circle cx="7" cy="6" r="2.4"/>', "CNB CLOUD / ONMICROSOFT", "云原生空间 & 思考电波", `
      <rect x="${w - 156}" y="16" width="46" height="14" rx="4" fill="${t.emeraldSoft}"/>
      <text class="mono" x="${w - 133}" y="26" text-anchor="middle" fill="${t.emerald}" font-size="8">Owner</text>
      <rect x="${w - 106}" y="14" width="90" height="20" rx="6" fill="${t.inner}" stroke="${t.border}"/>
      <text class="mono" x="${w - 61}" y="28" text-anchor="middle" fill="${t.muted}" font-size="10">vibe-talk ↗</text>
    `)}
    <rect x="16" y="68" width="${inner}" height="42" rx="10" fill="${t.inner}" stroke="${t.border}"/>
    <text class="hud" x="${16 + inner * 0.17}" y="84" text-anchor="middle" fill="${t.muted}">组织</text>
    <text class="mono" x="${16 + inner * 0.17}" y="100" text-anchor="middle" fill="${t.fg}" font-size="12" font-weight="700">${esc(data.orgName || "onmicrosoft")}</text>
    <text class="hud" x="${16 + inner * 0.5}" y="84" text-anchor="middle" fill="${t.muted}">全部仓库</text>
    <text class="mono" x="${16 + inner * 0.5}" y="100" text-anchor="middle" fill="${t.cyan}" font-size="12" font-weight="700">${data.cnbRepos}</text>
    <text class="hud" x="${16 + inner * 0.83}" y="84" text-anchor="middle" fill="${t.muted}">核心成员</text>
    <text class="mono" x="${16 + inner * 0.83}" y="100" text-anchor="middle" fill="${t.fg}" font-size="12" font-weight="700">${data.members}</text>
    <text class="hud" x="16" y="130" fill="${t.muted}">集群:</text>
    ${groups.slice(0, 2).map((g, i) => {
      const x = 58 + i * 92
      const label = `${g.name} (${g.count})`
      return `<rect x="${x}" y="118" width="86" height="16" rx="4" fill="${t.inner}" stroke="${t.border}"/>
    <text class="mono" x="${x + 43}" y="130" text-anchor="middle" fill="${t.fg}" font-size="9">${esc(fit(label, 12))}</text>`
    }).join("")}
    <text class="mono" x="16" y="148" fill="${t.muted}" font-size="11">真实声音复盘 (${data.recordingCount} 篇)</text>
    <rect x="${w - 88}" y="136" width="72" height="16" rx="8" fill="${t.cyanSoft}"/>
    <circle class="led" cx="${w - 76}" cy="144" r="2.4" fill="${t.cyan}"/>
    <text class="mono" x="${w - 52}" y="148" text-anchor="middle" fill="${t.cyan}" font-size="8">CNB LIVE</text>
    ${rows}
    ${footer(t, w, h, "Quiet Log · Telemetry", "查看 Vibe-Talk 仓库 →", t.cyan)}
    `
  )
}

function renderBlog(t, posts = [], total = 0) {
  const w = LAYOUT.leftW
  const h = LAYOUT.rowH
  const inner = w - 32
  const postH = 108
  const top = 68
  const gap = (h - 38 - top - postH * 3) / 2
  const rows = posts.map((p, i) => {
    const y = top + i * (postH + gap)
    const tags = (p.tags || [])
      .map(
        (tag, ti) =>
          `<text class="mono" x="${28 + ti * 78}" y="${y + 88}" fill="${t.muted}" font-size="8">#${esc(tag)}</text>`
      )
      .join("")
    return `
      <rect x="16" y="${y}" width="${inner}" height="${postH}" rx="10" fill="${t.inner}" stroke="${t.border}"/>
      <text class="mono" x="28" y="${y + 22}" fill="${t.indigo}" font-size="9" font-weight="700">[${p.date}]</text>
      ${p.latest ? `<text class="mono" x="118" y="${y + 22}" fill="${t.indigo}" font-size="8">最新</text>` : ""}
      <text class="mono" x="168" y="${y + 22}" fill="${t.muted}" font-size="8">${esc(p.read)}</text>
      <text class="head" x="28" y="${y + 46}" fill="${t.fg}" font-size="15" font-weight="700">${esc(fit(p.title, 38))}</text>
      <text class="sans" x="28" y="${y + 68}" fill="${t.muted}" font-size="11">${esc(fit(p.excerpt, 48))}</text>
      ${tags}
    `
  }).join("")

  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.indigo, t.indigoSoft, '<path d="M3 2h10v14H3zM6 6h4M6 10h4"/>', "ICODEQ.COM TRANSMISSION", "博客实时电波与思考沉淀", `
      <text class="mono" x="${w - 16}" y="34" text-anchor="end" fill="${t.muted}" font-size="11">icodeq.com ↗</text>
    `)}
    ${rows}
    ${footer(t, w, h, "ATOM / RSS FEED", `浏览博客归档 (${total}+ 篇) →`)}
    `
  )
}

function pulseColor(level, t) {
  return t.pulse[Math.max(0, Math.min(4, level))]
}

function renderPulse(t, data) {
  const pinned = data.pinned || []
  const w = LAYOUT.rightW
  const h = LAYOUT.rowH
  const inner = w - 32
  const bars = (data.pulse28 || []).slice(0, 28)
  while (bars.length < 28) bars.push({ level: 0 })
  const step = inner / 28
  const barW = Math.max(8, step - 3)
  const barY = 140
  const barRow = bars
    .map((b, i) => {
      const x = 16 + i * step
      return `<rect x="${x}" y="${barY}" width="${barW}" height="14" rx="2" fill="${pulseColor(b.level, t)}"/>`
    })
    .join("")

  const repoTop = 168
  const repoGutter = 10
  const repoW = (inner - repoGutter) / 2
  const repoGap = 10
  const repoH = (h - 38 - repoTop - repoGap) / 2
  const repos = pinned.map((r, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 16 + col * (repoW + repoGutter)
    const y = repoTop + row * (repoH + repoGap)
    return `
      <rect x="${x}" y="${y}" width="${repoW}" height="${repoH}" rx="10" fill="${t.inner}" stroke="${t.border}"/>
      <text class="mono" x="${x + 12}" y="${y + 22}" fill="${t.fg}" font-size="11" font-weight="700">${esc(fit(r.name, 16))}</text>
      <rect x="${x + repoW - 72}" y="${y + 10}" width="60" height="14" rx="3" fill="${t.orangeSoft}"/>
      <text class="mono" x="${x + repoW - 42}" y="${y + 20}" text-anchor="middle" fill="${t.orange}" font-size="8">${esc(r.tag)}</text>
      <text class="sans" x="${x + 12}" y="${y + 46}" fill="${t.muted}" font-size="10">${esc(fit(r.desc, 18))}</text>
      <text class="mono" x="${x + 12}" y="${y + repoH - 18}" fill="${t.fg}" font-size="10">${esc(r.lang)}</text>
      <text class="mono" x="${x + repoW - 12}" y="${y + repoH - 18}" text-anchor="end" fill="${t.muted}" font-size="10">CNB 仓库 ↗</text>
    `
  }).join("")

  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.orange, t.orangeSoft, '<path d="M4 12a6 6 0 1 1 8-8"/><path d="M12 4v4h4"/>', "CNB CLOUD TELEMETRY & PINNED", "CNB 态势与云原生脉搏", `
      <rect x="${w - 128}" y="16" width="112" height="20" rx="6" fill="${t.inner}" stroke="${t.border}"/>
      <text class="mono" x="${w - 72}" y="30" text-anchor="middle" fill="${t.muted}" font-size="10">@onmicrosoft ↗</text>
    `)}
    <rect x="16" y="68" width="${inner}" height="44" rx="10" fill="${t.inner}" stroke="${t.border}"/>
    <text class="hud" x="${16 + inner * 0.17}" y="84" text-anchor="middle" fill="${t.muted}">云原生仓库</text>
    <text class="mono" x="${16 + inner * 0.17}" y="102" text-anchor="middle" fill="${t.orange}" font-size="13" font-weight="700">${data.cnbRepos} Repos</text>
    <text class="hud" x="${16 + inner * 0.5}" y="84" text-anchor="middle" fill="${t.muted}">组织</text>
    <text class="mono" x="${16 + inner * 0.5}" y="102" text-anchor="middle" fill="${t.fg}" font-size="13" font-weight="700">${esc(data.orgName || "onmicrosoft")}</text>
    <text class="hud" x="${16 + inner * 0.83}" y="84" text-anchor="middle" fill="${t.muted}">核心团队</text>
    <text class="mono" x="${16 + inner * 0.83}" y="102" text-anchor="middle" fill="${t.fg}" font-size="13" font-weight="700">${data.members} Members</text>
    <text class="mono" x="16" y="130" fill="${t.orange}" font-size="10" font-weight="600">CNB 云原生近 28 天真实脉搏</text>
    <text class="mono" x="${w - 16}" y="130" text-anchor="end" fill="${t.orange}" font-size="9">实时动态流</text>
    ${barRow}
    ${repos}
    ${footer(t, w, h, "CNB Pulse Telemetry", `查看全部 CNB 仓库 (${data.cnbRepos}+) →`, t.orange)}
    `,
    t.orangeBorder
  )
}

function renderBook(t) {
  const w = LAYOUT.colW
  const h = LAYOUT.colH
  const chapters = [
    ["01", "《二次成长》重塑"],
    ["02", "《人性的弱点》指引"],
    ["03", "AI 智能深度问答"],
    ["04", "INFJ-A 升阶演进"],
  ]
  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.amber, t.amberSoft, '<path d="M2 2h8v14H2zM12 5h2v11H8"/>', "PUBLICATION CORE", "人格完善指南", "")}
    <text class="head" x="16" y="78" fill="${t.fg}" font-size="13" font-weight="700">Zkeq 的人格完善指南</text>
    <text class="sans" x="16" y="98" fill="${t.muted}" font-size="11">以名著为指引、AI 赋能的认知提升体系。</text>
    ${chapters
      .map(
        ([n, title], i) =>
          `<text class="mono" x="16" y="${122 + i * 20}" fill="${t.amber}" font-size="11" font-weight="700">${n}</text>
           <text class="sans" x="40" y="${122 + i * 20}" fill="${t.fg}" font-size="11">${esc(title)}</text>`
      )
      .join("")}
    ${footer(t, w, h, "成书前言 →", "开启导读 →", t.amber)}
    `
  )
}

function renderPatent(t) {
  const w = LAYOUT.colW
  const h = LAYOUT.colH
  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.red, t.redSoft, '<path d="M7 1l6 2.5v6c0 3.2-2.4 5.6-6 6.5C3.4 15.1 1 12.7 1 9.5v-6z"/>', "PATENT TELEMETRY / CNIPA", "发明专利与知识产权", `
      <rect x="${w - 86}" y="16" width="70" height="16" rx="8" fill="${t.amberSoft}"/>
      <circle class="led" cx="${w - 74}" cy="24" r="2.4" fill="${t.amber}"/>
      <text class="mono" x="${w - 52}" y="27" text-anchor="middle" fill="${t.amber}" font-size="8">实质审查</text>
    `)}
    <rect x="16" y="72" width="${w - 32}" height="148" rx="10" fill="${t.inner}" stroke="${t.border}"/>
    <text class="mono" x="28" y="92" fill="${t.muted}" font-size="8">CONFIDENTIAL FILING ARCHIVE</text>
    <text class="mono" x="28" y="118" fill="${t.fg}" font-size="11">申请号  ████████████████</text>
    <text class="mono" x="28" y="140" fill="${t.fg}" font-size="11">公开日  ████年██月██日</text>
    <text class="mono" x="28" y="162" fill="${t.fg}" font-size="11">发明名称  一种████、装置与可读介质</text>
    <text class="sans" x="28" y="190" fill="${t.muted}" font-size="10">第一项发明专利已公开并进入实质审查。</text>
    ${footer(t, w, h, "国知局专利检索", "epub.cnipa.gov.cn →")}
    `
  )
}

function renderHonor(t) {
  const w = LAYOUT.colW
  const h = LAYOUT.colH
  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.amber, t.amberSoft, '<path d="M4 1h8v4H4zM3 5h10v3c0 3.2-2.2 5.5-5 5.5S3 11.2 3 8V5zM8 13.5V17"/>', "TDP LEADERSHIP CREDENTIAL", "腾讯云开发者先锋 · 荣誉认证", `
      <rect x="${w - 88}" y="16" width="72" height="16" rx="8" fill="${t.amberSoft}" stroke="${t.amber}" stroke-opacity="0.3"/>
      <text class="mono" x="${w - 52}" y="27" text-anchor="middle" fill="${t.amber}" font-size="8" font-weight="700">2025 STAR</text>
    `)}
    <rect x="16" y="72" width="${w - 32}" height="148" rx="10" fill="${t.inner}" stroke="${t.amber}" stroke-opacity="0.28"/>
    <text class="mono" x="28" y="96" fill="${t.amber}" font-size="10">腾讯云开发者先锋 · TDP</text>
    <text class="head" x="28" y="122" fill="${t.fg}" font-size="16" font-weight="700">年度技术引领之星</text>
    <text class="mono" x="28" y="144" fill="${t.muted}" font-size="10">先锋: Zkeq · 编号 No.21000075</text>
    <text class="sans" x="28" y="168" fill="${t.muted}" font-size="11">一场 vibe coding 分享留下的痕迹。</text>
    <rect x="28" y="184" width="78" height="16" rx="4" fill="${t.inner}"/>
    <text class="mono" x="67" y="195" text-anchor="middle" fill="${t.muted}" font-size="8">Vibe Coding 分享</text>
    ${footer(t, w, h, "查看分享与获奖记录 →", "腾讯云官网验证", t.amber)}
    `
  )
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const data = await loadData()
  console.log(
    JSON.stringify(
      {
        projects: data.projectCount,
        recordings: data.recordingCount,
        posts: data.postCount,
        cnbRepos: data.cnbRepos,
        commits: data.commits,
      },
      null,
      2
    )
  )
  const files = {
    "hud-light.svg": renderHud(THEMES.light, data),
    "hud-dark.svg": renderHud(THEMES.dark, data),
    "products-light.svg": renderProducts(THEMES.light, data.projects, data.projectCount),
    "products-dark.svg": renderProducts(THEMES.dark, data.projects, data.projectCount),
    "talk-light.svg": renderTalk(THEMES.light, data),
    "talk-dark.svg": renderTalk(THEMES.dark, data),
    "blog-light.svg": renderBlog(THEMES.light, data.posts, data.postCount),
    "blog-dark.svg": renderBlog(THEMES.dark, data.posts, data.postCount),
    "pulse-light.svg": renderPulse(THEMES.light, data),
    "pulse-dark.svg": renderPulse(THEMES.dark, data),
    "book-light.svg": renderBook(THEMES.light),
    "book-dark.svg": renderBook(THEMES.dark),
    "patent-light.svg": renderPatent(THEMES.light),
    "patent-dark.svg": renderPatent(THEMES.dark),
    "honor-light.svg": renderHonor(THEMES.light),
    "honor-dark.svg": renderHonor(THEMES.dark),
  }
  for (const [name, content] of Object.entries(files)) {
    await writeFile(join(OUT, name), content)
  }
  console.log(`wrote ${Object.keys(files).length} svgs`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
