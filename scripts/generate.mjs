#!/usr/bin/env node
/**
 * Individual 中控台 console-card SVGs. Not a full-page website capture.
 */

import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = join(ROOT, "svg")
const HOME = "https://zkeq-projects.dev-tool.cool/"
const USER = "zkeq"
const FONT =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', sans-serif"
const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
const HEAD = "ui-serif, Georgia, 'Songti SC', 'Noto Serif SC', serif"

const THEMES = {
  light: {
    page: "#F7F7F7",
    card: "#FFFFFF",
    inner: "rgba(0,0,0,0.03)",
    fg: "#171717",
    muted: "#737373",
    faint: "#A3A3A3",
    border: "rgba(23,23,23,0.10)",
    borderStrong: "rgba(23,23,23,0.16)",
    invert: "#FAFAFA",
    fill: "#171717",
    emerald: "#059669",
    emeraldSoft: "rgba(16,185,129,0.10)",
    emeraldBorder: "rgba(16,185,129,0.35)",
    cyan: "#0891B2",
    cyanSoft: "rgba(6,182,212,0.12)",
    indigo: "#4F46E5",
    indigoSoft: "rgba(99,102,241,0.12)",
    orange: "#EA580C",
    orangeSoft: "rgba(249,115,22,0.12)",
    orangeBorder: "rgba(249,115,22,0.22)",
    amber: "#D97706",
    amberSoft: "rgba(245,158,11,0.12)",
    red: "#DC2626",
    redSoft: "rgba(239,68,68,0.10)",
    pulse: ["#E5E5E5", "rgba(249,115,22,0.20)", "rgba(249,115,22,0.45)", "rgba(249,115,22,0.75)", "#F97316"],
  },
  dark: {
    page: "#111111",
    card: "#171717",
    inner: "rgba(255,255,255,0.04)",
    fg: "#F4F4F4",
    muted: "#A3A3A3",
    faint: "#737373",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",
    invert: "#111111",
    fill: "#F4F4F4",
    emerald: "#34D399",
    emeraldSoft: "rgba(16,185,129,0.08)",
    emeraldBorder: "rgba(16,185,129,0.35)",
    cyan: "#22D3EE",
    cyanSoft: "rgba(6,182,212,0.12)",
    indigo: "#818CF8",
    indigoSoft: "rgba(99,102,241,0.14)",
    orange: "#FB923C",
    orangeSoft: "rgba(249,115,22,0.12)",
    orangeBorder: "rgba(249,115,22,0.22)",
    amber: "#FBBF24",
    amberSoft: "rgba(245,158,11,0.12)",
    red: "#F87171",
    redSoft: "rgba(239,68,68,0.12)",
    pulse: ["#262626", "rgba(249,115,22,0.20)", "rgba(249,115,22,0.45)", "rgba(249,115,22,0.75)", "#F97316"],
  },
}

const PRODUCTS = [
  {
    name: "Vibe Cook 沉浸式烹饪助手",
    desc: "融合真实菜谱检索、AI 选菜与逐步引导的沉浸式烹饪应用。",
    tags: ["AI Agent", "沉浸式烹饪", "智能选菜"],
    featured: true,
  },
  {
    name: "全息推演个人财务系统",
    desc: "以未来现金流推演为核心，统一管理账户、预算、负债与消费计划。",
    tags: ["现金流推演", "预算管理", "负债管理"],
    featured: true,
  },
  {
    name: "SparkAI - 多模态 AI 创作平台前端 - 新版UI",
    desc: "基于 Vue 3 的企业级多模态 AI 内容创作平台，集成智能对话、绘画、视频。",
    tags: ["Vue 3", "TypeScript", "AI 平台"],
    featured: false,
  },
  {
    name: "SparkAI - 多模态 AI 创作平台前端 - 旧版UI",
    desc: "基于 Vue 3 的多模态 AI 综合应用平台，集成对话、绘画、视频。",
    tags: ["Vue 3", "TypeScript", "AI 应用"],
    featured: false,
  },
  {
    name: "SparkAI 视频生成平台",
    desc: "企业级 AI 视频生成 SaaS 平台，支持 15+ 主流 AI 模型。",
    tags: ["AI视频生成", "多模型聚合", "企业级SaaS"],
    featured: false,
  },
  {
    name: "IMYAI智能助手官网",
    desc: "基于 Vue 3 的 AI 智能助手官网，支持多平台下载与动态内容管理。",
    tags: ["Vue 3", "AI助手", "响应式设计"],
    featured: false,
  },
]

const RECORDINGS = [
  {
    date: "2026-08-20 05:19",
    duration: "454.5 秒",
    title: "公积金事件与个人主页制作记录",
    summary: "【工作复盘】时长 454.5 秒 · 云端声音与结构化思维归档",
    tag: "工作复盘",
  },
  {
    date: "2026-08-19 04:42",
    duration: "275.1 秒",
    title: "压力转化资产，个人网站成型",
    summary: "【工作复盘】时长 275.1 秒 · 云端声音与结构化思维归档",
    tag: "工作复盘",
  },
  {
    date: "2026-08-19 04:37",
    duration: "642.5 秒",
    title: "一周回顾与自我调整",
    summary: "【工作复盘】时长 642.5 秒 · 云端声音与结构化思维归档",
    tag: "工作复盘",
  },
]

const POSTS = [
  {
    date: "2026-02-19",
    read: "4 min",
    latest: true,
    title: "年度｜我的 2025 年度总结",
    excerpt: "2025年，日均20次提交的超强工作强度，从河南远程工作到深圳南山，从写出人格相关的书籍到沉浸式的Live House。",
    tags: ["个人成长", "生活碎片", "年度总结"],
  },
  {
    date: "2025-09-12",
    read: "5 min",
    title: "从想法到落地：两小时做出一个人格完善站",
    excerpt: "把人格完善做成一个可以提问、可以读的站点。",
    tags: ["AI", "个人成长"],
  },
  {
    date: "2025-09-07",
    read: "6 min",
    title: "Hexo 博客搭建：一份写给新手的完全指南",
    excerpt: "这是一份写给新手的 Hexo 博客搭建完全指南。",
    tags: ["Hexo", "博客"],
  },
]

const PINNED = [
  {
    name: "vibe-talk",
    tag: "Quiet Log",
    lang: "TypeScript",
    desc: "一个安静、低压力、可长期回看的私人声音复盘工作台 (Quiet Log 实时识别与 AI 讲义)",
  },
  {
    name: "Project-PanelShow",
    tag: "Portfolio",
    lang: "TypeScript",
    desc: "现代化个人作品集系统 · 支持多用户、时间线展示与后台管理",
  },
  {
    name: "tdp-demonstration",
    tag: "TDP Demo",
    lang: "Docker",
    desc: "Vibe Cook 腾讯云 TDP 示范工程与云原生全流程实践",
  },
  {
    name: "tdp-hornor",
    tag: "Astro HUD",
    lang: "Astro",
    desc: "腾讯云开发者先锋（TDP）获奖者展示网站，基于 Astro 构建",
  },
]

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function fmt(n) {
  return Number(n).toLocaleString("en-US")
}

function clip(id, x, y, w, h) {
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/></clipPath>`
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

    ${chip(16, 48, 210, "在线核心产品", `${data.projects} units`, t.emerald, t)}
    ${chip(236, 48, 210, "CNB / 渺软仓库", `${data.cnbRepos} repos`, t.cyan, t)}
    ${chip(456, 48, 210, "GitHub 累计提交", `${data.commits}+`, t.amber, t)}
    ${chip(676, 48, 208, "博客文章沉淀", `${data.posts}+ posts`, t.indigo, t)}
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

function renderProducts(t) {
  const w = 640
  const h = 468
  const tiles = PRODUCTS.map((p, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 16 + col * 308
    const y = 72 + row * 118
    const stroke = p.featured ? t.emeraldBorder : t.border
    const bg = p.featured ? t.emeraldSoft : t.inner
    const tags = p.tags
      .slice(0, 3)
      .map(
        (tag, ti) =>
          `<rect x="${x + 12 + ti * 72}" y="${y + 88}" width="68" height="14" rx="3" fill="${t.inner}"/>
           <text class="mono" x="${x + 46 + ti * 72}" y="${y + 98}" text-anchor="middle" fill="${t.muted}" font-size="8">${esc(tag)}</text>`
      )
      .join("")
    return `
      <rect x="${x}" y="${y}" width="300" height="110" rx="10" fill="${bg}" stroke="${stroke}"/>
      <circle class="led" cx="${x + 18}" cy="${y + 16}" r="3" fill="${t.emerald}"/>
      <text class="hud" x="${x + 28}" y="${y + 20}" fill="${t.emerald}" font-size="8" font-weight="700">ONLINE</text>
      ${p.featured ? `<rect x="${x + 78}" y="${y + 8}" width="32" height="14" rx="3" fill="${t.amberSoft}"/><text class="mono" x="${x + 94}" y="${y + 18}" text-anchor="middle" fill="${t.amber}" font-size="8">★ 重点</text>` : ""}
      <text class="sans" x="${x + 274}" y="${y + 20}" fill="${t.muted}" font-size="11">↗</text>
      <text class="head" x="${x + 12}" y="${y + 42}" fill="${t.fg}" font-size="13" font-weight="700">${esc(p.name)}</text>
      <text class="sans" x="${x + 12}" y="${y + 64}" fill="${t.muted}" font-size="11">${esc(p.desc.slice(0, 34))}${p.desc.length > 34 ? "…" : ""}</text>
      ${tags}
    `
  }).join("")

  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.emerald, t.emeraldSoft, '<path d="M2 9h10M2 4h14M2 14h7"/>', "ACTIVE PRODUCTS MATRIX", "核心在研与生活系统", `
      <rect x="430" y="18" width="58" height="18" rx="6" fill="${t.fill}"/>
      <text class="mono" x="459" y="31" text-anchor="middle" font-size="9" fill="${t.invert}">全部 (16)</text>
      <text class="mono" x="510" y="31" fill="${t.muted}" font-size="9">生活</text>
      <text class="mono" x="548" y="31" fill="${t.muted}" font-size="9">AI</text>
      <text class="mono" x="580" y="31" fill="${t.muted}" font-size="9">基建</text>
    `)}
    ${tiles}
    ${footer(t, w, h, "PPS Gateway · 16 Projects", "查看完整作品集清单 →")}
    `
  )
}

function renderTalk(t) {
  const w = 480
  const h = 468
  const rows = RECORDINGS.map((r, i) => {
    const y = 168 + i * 84
    return `
      <rect x="16" y="${y}" width="448" height="76" rx="10" fill="${t.inner}" stroke="${t.border}"/>
      <text class="mono" x="28" y="${y + 18}" fill="${t.cyan}" font-size="9" font-weight="700">[${r.date}]</text>
      <text class="mono" x="168" y="${y + 18}" fill="${t.muted}" font-size="8">${esc(r.duration)}</text>
      <rect x="392" y="${y + 8}" width="58" height="14" rx="3" fill="${t.inner}"/>
      <text class="mono" x="421" y="${y + 18}" text-anchor="middle" fill="${t.muted}" font-size="8">#${esc(r.tag)}</text>
      <text class="head" x="28" y="${y + 40}" fill="${t.fg}" font-size="13" font-weight="700">${esc(r.title)}</text>
      <text class="sans" x="28" y="${y + 60}" fill="${t.muted}" font-size="10">${esc(r.summary)}</text>
    `
  }).join("")

  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.cyan, t.cyanSoft, '<path d="M7 2a4 4 0 0 1 0 8M7 10v3M4 15h6"/><circle cx="7" cy="6" r="2.4"/>', "CNB CLOUD / ONMICROSOFT", "云原生空间 & 思考电波", `
      <rect x="318" y="16" width="46" height="14" rx="4" fill="${t.emeraldSoft}"/>
      <text class="mono" x="341" y="26" text-anchor="middle" fill="${t.emerald}" font-size="8">Owner</text>
      <rect x="370" y="14" width="94" height="20" rx="6" fill="${t.inner}" stroke="${t.border}"/>
      <text class="mono" x="417" y="28" text-anchor="middle" fill="${t.muted}" font-size="10">vibe-talk ↗</text>
    `)}
    <rect x="16" y="68" width="448" height="42" rx="10" fill="${t.inner}" stroke="${t.border}"/>
    <text class="hud" x="90" y="84" text-anchor="middle" fill="${t.muted}">组织</text>
    <text class="mono" x="90" y="100" text-anchor="middle" fill="${t.fg}" font-size="12" font-weight="700">onmicrosoft</text>
    <text class="hud" x="240" y="84" text-anchor="middle" fill="${t.muted}">全部仓库</text>
    <text class="mono" x="240" y="100" text-anchor="middle" fill="${t.cyan}" font-size="12" font-weight="700">64</text>
    <text class="hud" x="380" y="84" text-anchor="middle" fill="${t.muted}">核心成员</text>
    <text class="mono" x="380" y="100" text-anchor="middle" fill="${t.fg}" font-size="12" font-weight="700">14</text>
    <text class="hud" x="16" y="130" fill="${t.muted}">集群:</text>
    <rect x="58" y="118" width="86" height="16" rx="4" fill="${t.inner}" stroke="${t.border}"/>
    <text class="mono" x="101" y="130" text-anchor="middle" fill="${t.fg}" font-size="9">vibe-cook (6)</text>
    <rect x="150" y="118" width="70" height="16" rx="4" fill="${t.inner}" stroke="${t.border}"/>
    <text class="mono" x="185" y="130" text-anchor="middle" fill="${t.fg}" font-size="9">imyai (1)</text>
    <text class="mono" x="16" y="156" fill="${t.muted}" font-size="11">真实声音复盘 (32 篇)</text>
    <rect x="392" y="144" width="72" height="16" rx="8" fill="${t.cyanSoft}"/>
    <circle class="led" cx="404" cy="152" r="2.4" fill="${t.cyan}"/>
    <text class="mono" x="428" y="156" text-anchor="middle" fill="${t.cyan}" font-size="8">CNB LIVE</text>
    ${rows}
    ${footer(t, w, h, "Quiet Log · Telemetry", "查看 Vibe-Talk 仓库 →", t.cyan)}
    `
  )
}

function renderBlog(t) {
  const w = 640
  const h = 360
  const rows = POSTS.map((p, i) => {
    const y = 68 + i * 84
    const tags = (p.tags || [])
      .map(
        (tag, ti) =>
          `<text class="mono" x="${28 + ti * 72}" y="${y + 70}" fill="${t.muted}" font-size="8">#${esc(tag)}</text>`
      )
      .join("")
    return `
      <rect x="16" y="${y}" width="608" height="76" rx="10" fill="${t.inner}" stroke="${t.border}"/>
      <text class="mono" x="28" y="${y + 18}" fill="${t.indigo}" font-size="9" font-weight="700">[${p.date}]</text>
      ${p.latest ? `<text class="mono" x="118" y="${y + 18}" fill="${t.indigo}" font-size="8">最新</text>` : ""}
      <text class="mono" x="168" y="${y + 18}" fill="${t.muted}" font-size="8">${esc(p.read)}</text>
      <text class="head" x="28" y="${y + 40}" fill="${t.fg}" font-size="13" font-weight="700">${esc(p.title)}</text>
      <text class="sans" x="28" y="${y + 58}" fill="${t.muted}" font-size="11">${esc(p.excerpt.slice(0, 52))}…</text>
      ${tags}
    `
  }).join("")

  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.indigo, t.indigoSoft, '<path d="M3 2h10v14H3zM6 6h4M6 10h4"/>', "ICODEQ.COM TRANSMISSION", "博客实时电波与思考沉淀", `
      <text class="mono" x="624" y="34" text-anchor="end" fill="${t.muted}" font-size="11">icodeq.com ↗</text>
    `)}
    ${rows}
    ${footer(t, w, h, "ATOM / RSS FEED", "浏览博客归档 (30+ 篇) →")}
    `
  )
}

function pulseColor(level, t) {
  return t.pulse[Math.max(0, Math.min(4, level))]
}

function renderPulse(t, data) {
  const w = 480
  const h = 468
  const bars = (data.pulse28 || []).slice(0, 28)
  while (bars.length < 28) bars.push({ level: 0 })
  const barW = 12
  const gap = 3
  const barRow = bars
    .map((b, i) => {
      const x = 16 + i * (barW + gap)
      return `<rect x="${x}" y="168" width="${barW}" height="14" rx="2" fill="${pulseColor(b.level, t)}"/>`
    })
    .join("")

  const repos = PINNED.map((r, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 16 + col * 228
    const y = 198 + row * 96
    return `
      <rect x="${x}" y="${y}" width="220" height="88" rx="10" fill="${t.inner}" stroke="${t.border}"/>
      <text class="mono" x="${x + 12}" y="${y + 20}" fill="${t.fg}" font-size="11" font-weight="700">${esc(r.name)}</text>
      <rect x="${x + 148}" y="${y + 8}" width="60" height="14" rx="3" fill="${t.orangeSoft}"/>
      <text class="mono" x="${x + 178}" y="${y + 18}" text-anchor="middle" fill="${t.orange}" font-size="8">${esc(r.tag)}</text>
      <text class="sans" x="${x + 12}" y="${y + 42}" fill="${t.muted}" font-size="10">${esc(r.desc.slice(0, 22))}…</text>
      <text class="mono" x="${x + 12}" y="${y + 70}" fill="${t.fg}" font-size="10">${esc(r.lang)}</text>
      <text class="mono" x="${x + 208}" y="${y + 70}" text-anchor="end" fill="${t.muted}" font-size="10">CNB 仓库 ↗</text>
    `
  }).join("")

  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.orange, t.orangeSoft, '<path d="M4 12a6 6 0 1 1 8-8"/><path d="M12 4v4h4"/>', "CNB CLOUD TELEMETRY & PINNED", "CNB 态势与云原生脉搏", `
      <rect x="352" y="16" width="112" height="20" rx="6" fill="${t.inner}" stroke="${t.border}"/>
      <text class="mono" x="408" y="30" text-anchor="middle" fill="${t.muted}" font-size="10">@onmicrosoft ↗</text>
    `)}
    <rect x="16" y="68" width="448" height="50" rx="10" fill="${t.inner}" stroke="${t.border}"/>
    <text class="hud" x="90" y="86" text-anchor="middle" fill="${t.muted}">云原生仓库</text>
    <text class="mono" x="90" y="106" text-anchor="middle" fill="${t.orange}" font-size="13" font-weight="700">64 Repos</text>
    <text class="hud" x="240" y="86" text-anchor="middle" fill="${t.muted}">组织</text>
    <text class="mono" x="240" y="106" text-anchor="middle" fill="${t.fg}" font-size="13" font-weight="700">onmicrosoft</text>
    <text class="hud" x="380" y="86" text-anchor="middle" fill="${t.muted}">核心团队</text>
    <text class="mono" x="380" y="106" text-anchor="middle" fill="${t.fg}" font-size="13" font-weight="700">14 Members</text>
    <text class="mono" x="16" y="146" fill="${t.orange}" font-size="10" font-weight="600">CNB 云原生近 28 天真实脉搏</text>
    <text class="mono" x="464" y="146" text-anchor="end" fill="${t.orange}" font-size="9">实时动态流</text>
    ${barRow}
    ${repos}
    ${footer(t, w, h, "CNB Pulse Telemetry", "查看全部 CNB 仓库 (64+) →", t.orange)}
    `,
    t.orangeBorder
  )
}

function renderStatus(t, data) {
  const w = 480
  const h = 220
  const langs = data.langs.slice(0, 4)
  const sum = langs.reduce((a, b) => a + b.count, 0) || 1
  let lx = 16
  const colors = [t.fg, t.muted, t.cyan, t.indigo]
  const bars = langs
    .map((l, i) => {
      const bw = Math.max(16, Math.round(((w - 32) * l.count) / sum))
      const x = lx
      lx += bw
      return `<rect x="${x}" y="168" width="${bw - 3}" height="8" rx="2" fill="${colors[i]}"/>`
    })
    .join("")
  const labels = langs
    .map((l, i) => `<text class="mono" x="${16 + i * 116}" y="196" fill="${t.muted}" font-size="9">${esc(l.name)} ${l.count}</text>`)
    .join("")

  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.orange, t.orangeSoft, '<path d="M7 1v4M3 8h8M2 13h10"/>', "GITHUB STATUS · ZKEQ", "GitHub 仓库与贡献", "")}
    ${mini(16, 68, 106, "提交", data.commits, t)}
    ${mini(130, 68, 106, "仓库", fmt(data.repos), t)}
    ${mini(244, 68, 106, "Stars", fmt(data.stars), t)}
    ${mini(358, 68, 106, "Followers", fmt(data.followers), t)}
    <text class="hud" x="16" y="154" fill="${t.muted}">仓库语言分布</text>
    ${bars}
    ${labels}
    `
  )
}

function mini(x, y, w, label, value, t) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="52" rx="10" fill="${t.inner}" stroke="${t.border}"/>
    <text class="hud" x="${x + 10}" y="${y + 18}" fill="${t.muted}">${esc(label)}</text>
    <text class="mono" x="${x + 10}" y="${y + 38}" fill="${t.fg}" font-size="16" font-weight="700">${esc(value)}</text>
  `
}

function renderBook(t) {
  const w = 300
  const h = 268
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
  const w = 300
  const h = 268
  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.red, t.redSoft, '<path d="M7 1l6 2.5v6c0 3.2-2.4 5.6-6 6.5C3.4 15.1 1 12.7 1 9.5v-6z"/>', "PATENT TELEMETRY / CNIPA", "发明专利与知识产权", `
      <rect x="214" y="16" width="70" height="16" rx="8" fill="${t.amberSoft}"/>
      <circle class="led" cx="226" cy="24" r="2.4" fill="${t.amber}"/>
      <text class="mono" x="248" y="27" text-anchor="middle" fill="${t.amber}" font-size="8">实质审查</text>
    `)}
    <rect x="16" y="72" width="268" height="148" rx="10" fill="${t.inner}" stroke="${t.border}"/>
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
  const w = 300
  const h = 268
  return svg(
    w,
    h,
    t,
    `
    ${header(t, w, 16, 16, t.amber, t.amberSoft, '<path d="M4 1h8v4H4zM3 5h10v3c0 3.2-2.2 5.5-5 5.5S3 11.2 3 8V5zM8 13.5V17"/>', "TDP LEADERSHIP CREDENTIAL", "腾讯云开发者先锋 · 荣誉认证", `
      <rect x="222" y="16" width="62" height="16" rx="8" fill="${t.amberSoft}" stroke="${t.amber}" stroke-opacity="0.3"/>
      <text class="mono" x="253" y="27" text-anchor="middle" fill="${t.amber}" font-size="8" font-weight="700">2025 STAR</text>
    `)}
    <rect x="16" y="72" width="268" height="148" rx="10" fill="${t.inner}" stroke="${t.amber}" stroke-opacity="0.28"/>
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

async function gh(path, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "zkeq-profile",
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (!res.ok) throw new Error(`${path} ${res.status}`)
  return res.json()
}

async function loadData() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ""
  const data = {
    repos: 122,
    followers: 206,
    stars: 724,
    commits: "19,616",
    projects: 16,
    cnbRepos: 64,
    posts: 8,
    langs: [
      { name: "HTML", count: 27 },
      { name: "JavaScript", count: 17 },
      { name: "Python", count: 10 },
      { name: "CSS", count: 9 },
    ],
    pulse28: Array.from({ length: 28 }, (_, i) => ({
      level: [0, 0, 0, 1, 0, 2, 0, 0, 4, 3, 0, 1, 0, 0, 2, 0, 0, 4, 4, 0, 1, 0, 3, 0, 0, 2, 4, 3][i],
    })),
  }

  try {
    const user = await gh(`/users/${USER}`, token)
    data.repos = user.public_repos ?? data.repos
    data.followers = user.followers ?? data.followers
  } catch (err) {
    console.warn("github user:", err.message)
  }

  try {
    const langs = new Map()
    let stars = 0
    for (let page = 1; page <= 2; page++) {
      const repos = await gh(`/users/${USER}/repos?per_page=100&page=${page}&type=owner`, token)
      if (!Array.isArray(repos) || repos.length === 0) break
      for (const r of repos) {
        stars += r.stargazers_count || 0
        if (r.fork) continue
        const lang = r.language || "Other"
        langs.set(lang, (langs.get(lang) || 0) + 1)
      }
    }
    data.stars = stars
    data.langs = [...langs.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }))
  } catch (err) {
    console.warn("github repos:", err.message)
  }

  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}`, {
      headers: { "User-Agent": "zkeq-profile" },
    })
    if (res.ok) {
      const payload = await res.json()
      const total = Object.values(payload.total || {}).reduce((a, b) => a + Number(b || 0), 0)
      if (total) data.commits = fmt(total)
    }
  } catch (err) {
    console.warn("contrib:", err.message)
  }

  return data
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const data = await loadData()
  const files = {
    "hud-light.svg": renderHud(THEMES.light, data),
    "hud-dark.svg": renderHud(THEMES.dark, data),
    "products-light.svg": renderProducts(THEMES.light),
    "products-dark.svg": renderProducts(THEMES.dark),
    "talk-light.svg": renderTalk(THEMES.light),
    "talk-dark.svg": renderTalk(THEMES.dark),
    "blog-light.svg": renderBlog(THEMES.light),
    "blog-dark.svg": renderBlog(THEMES.dark),
    "pulse-light.svg": renderPulse(THEMES.light, data),
    "pulse-dark.svg": renderPulse(THEMES.dark, data),
    "status-light.svg": renderStatus(THEMES.light, data),
    "status-dark.svg": renderStatus(THEMES.dark, data),
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
