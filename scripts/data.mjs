/**
 * Live data, same sources and auth as zkeq-site (zkeq-projects).
 * CNB_TOKEN: Bearer https://api.cnb.cool
 * GITHUB_TOKEN / GH_TOKEN: GitHub REST
 */

const USER = "zkeq"
const CNB_GROUP = "onmicrosoft"
const PPS = "https://pps-backend.onmicrosoft.cn/api/projects/zkeq"
const ATOM = "https://icodeq.com/atom.xml"

function cnbHeaders() {
  const token = process.env.CNB_TOKEN || ""
  const headers = { Accept: "application/json", "User-Agent": "zkeq-profile" }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function ghHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ""
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "zkeq-profile",
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function getJson(url, headers) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${url} ${res.status}`)
  return res.json()
}

function tagOf(item) {
  if (!item) return ""
  if (typeof item === "string") return item
  return item.label || item.name || String(item)
}

function isFeatured(name = "") {
  return /vibe cook|烹饪|财务|记账|渺软/i.test(name)
}

function pinMeta(name = "") {
  if (name.includes("vibe-talk")) return { tag: "Quiet Log", language: "TypeScript" }
  if (name.includes("PanelShow")) return { tag: "Portfolio", language: "TypeScript" }
  if (name.includes("tdp-demonstration")) return { tag: "TDP Demo", language: "Docker" }
  if (name.includes("tdp-hornor")) return { tag: "Astro HUD", language: "Astro" }
  if (name.includes("feishu-bot")) return { tag: "Bot", language: "Python" }
  if (name.includes("Game")) return { tag: "Game", language: "Ren'Py" }
  return { tag: "CNB Pin", language: "TypeScript" }
}

async function fetchProjects() {
  const payload = await getJson(PPS, { "User-Agent": "zkeq-profile" })
  const items = payload.data || []
  return items.map((p) => ({
    name: p.name || "未命名项目",
    desc: (p.description || "面向日常生活与极客效率的独立产品。").split("\n")[0].trim(),
    tags: (p.tags || []).map(tagOf).filter(Boolean).slice(0, 3),
    featured: isFeatured(p.name),
  }))
}

async function fetchBlog() {
  const res = await fetch(ATOM, {
    headers: {
      "User-Agent": "ZkeqProjects-Site/2.0",
      Accept: "application/atom+xml, application/xml, text/xml",
    },
  })
  if (!res.ok) throw new Error(`atom ${res.status}`)
  const xml = await res.text()
  const entries = xml.match(/<entry[\s\S]*?<\/entry>/gi) || []
  return entries.slice(0, 8).map((entry, idx) => {
    const title = strip(tag(entry, "title")) || "无标题文章"
    const updated = tag(entry, "updated") || tag(entry, "published")
    const summary = strip(tag(entry, "summary") || tag(entry, "content")).slice(0, 140)
    const tags = [...entry.matchAll(/<category[^>]*?term=["']([^"']+)["']/gi)].map((m) => m[1])
    return {
      date: updated ? updated.slice(0, 10) : "",
      read: `${Math.max(3, Math.min(15, Math.ceil(summary.length / 20)))} min`,
      latest: idx === 0,
      title,
      excerpt: summary || "点击查看博客全文与详细记录。",
      tags: tags.slice(0, 3),
    }
  })
}

function tag(xml, name) {
  const cdata = xml.match(new RegExp(`<${name}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${name}>`, "i"))
  if (cdata) return cdata[1].trim()
  const normal = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"))
  return normal ? normal[1].trim() : ""
}

function strip(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

async function fetchCnb() {
  const headers = cnbHeaders()
  const org = await getJson(`https://api.cnb.cool/${CNB_GROUP}`, headers)
  let subGroups = []
  try {
    const data = await getJson(`https://api.cnb.cool/${CNB_GROUP}/-/sub-groups`, headers)
    if (Array.isArray(data)) subGroups = data
  } catch (err) {
    console.warn("cnb sub-groups:", err.message)
  }

  let repos = []
  try {
    const data = await getJson(`https://api.cnb.cool/${CNB_GROUP}/-/repos?page=1&page_size=20`, headers)
    if (Array.isArray(data)) repos = data
  } catch (err) {
    console.warn("cnb repos:", err.message)
  }

  const prioritized = [
    "vibe-talk",
    "Project-PanelShow",
    "tdp-demonstration",
    "tdp-hornor",
    "feishu-bot",
    "TCH-Game-20260524",
  ]
  const matched = prioritized
    .map((name) => repos.find((r) => r.name === name || (r.path || "").endsWith(name)))
    .filter(Boolean)
  const rest = repos.filter((r) => !matched.some((m) => m.path === r.path))
  const pinned = [...matched, ...rest].slice(0, 4).map((r) => {
    const meta = pinMeta(r.name || "")
    let desc = (r.description || "CNB 云原生云端协同与生产力项目").split("\n")[0].trim()
    if (r.name === "tdp-demonstration") desc = "Vibe Cook 腾讯云 TDP 示范工程与云原生全流程实践"
    if (r.name === "tdp-hornor") desc = "腾讯云开发者先锋（TDP）获奖者展示网站，基于 Astro 构建"
    if (r.name === "vibe-talk") {
      desc = "一个安静、低压力、可长期回看的私人声音复盘工作台 (Quiet Log 实时识别与 AI 讲义)"
    }
    return { name: r.name, desc, tag: meta.tag, lang: meta.language }
  })

  const recordings = await fetchRecordings(headers)
  const pulse28 = await fetchPulse(headers)

  return {
    orgName: org?.name || CNB_GROUP,
    cnbRepos: org?.all_sub_repo_count || org?.sub_repo_count || repos.length || 64,
    members: org?.member_count || 14,
    subGroups: subGroups.slice(0, 4).map((g) => ({
      name: g.name,
      count: g.sub_repo_count || 0,
    })),
    recordings,
    pinned,
    pulse28,
  }
}

async function fetchRecordings(headers) {
  const all = []
  for (let page = 1; page <= 8; page++) {
    const batch = await getJson(
      `https://api.cnb.cool/${CNB_GROUP}/vibe-talk/-/issues/2/comments?page=${page}&page_size=100`,
      headers
    )
    if (!Array.isArray(batch) || batch.length === 0) break
    all.push(...batch)
    if (batch.length < 100) break
  }

  const seen = new Set()
  const out = []
  for (const c of [...all].reverse()) {
    if (!c.body) continue
    if (
      c.body.includes("__quiet_log_repository_config__") ||
      c.body.includes("仓库配置") ||
      c.body.includes("配置更新") ||
      c.body.includes("已删除")
    ) {
      continue
    }
    const durationMatch = c.body.match(/时长[：:]\s*([0-9.]+\s*秒)/)
    if (!durationMatch) continue
    const duration = durationMatch[1]
    const lines = c.body.split("\n")
    const titleLine = lines.find((l) => l.startsWith("### ")) || ""
    const title = titleLine.replace(/^###\s*/, "").trim()
    if (!title || title.includes("配置")) continue
    const key = `${title}_${duration}`
    if (seen.has(key)) continue
    seen.add(key)
    const typeLine = lines.find((l) => l.includes("类型：") || l.includes("类型:")) || ""
    const type = typeLine.replace(/.*类型[：:]\s*/, "").trim()
    const tagsLine = lines.find((l) => l.includes("标签：") || l.includes("标签:")) || ""
    const rawTags = tagsLine.replace(/.*标签[：:]\s*/, "").trim()
    const tags = []
    if (type && type !== "无类型" && type !== "无标签") tags.push(type)
    if (rawTags && rawTags !== "无标签") tags.push(...rawTags.split(/[,\s]+/).filter(Boolean))
    const dateStr = c.created_at ? c.created_at.slice(0, 16).replace("T", " ") : ""
    out.push({
      date: dateStr,
      duration,
      title,
      summary:
        type && type !== "声音复盘"
          ? `【${type}】时长 ${duration} · 云端声音与结构化思维归档`
          : `录音时长 ${duration} · 云端声音与结构化思维归档`,
      tag: tags[0] || "声音复盘",
    })
  }
  return out
}

async function fetchPulse(headers) {
  const daily = {}
  for (let i = 0; i < 28; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (27 - i))
    daily[d.toISOString().slice(0, 10)] = 0
  }
  try {
    const commits = await getJson(
      `https://api.cnb.cool/${CNB_GROUP}/vibe-talk/-/git/commits?page=1&page_size=100`,
      headers
    )
    if (Array.isArray(commits)) {
      for (const c of commits) {
        const dateStr = c.commit?.author?.date || c.commit?.committer?.date
        if (!dateStr) continue
        const key = dateStr.slice(0, 10)
        if (daily[key] !== undefined) daily[key] += 1
      }
    }
  } catch (err) {
    console.warn("cnb commits:", err.message)
  }
  try {
    const comments = await getJson(
      `https://api.cnb.cool/${CNB_GROUP}/vibe-talk/-/issues/2/comments?page=1&page_size=100`,
      headers
    )
    if (Array.isArray(comments)) {
      for (const c of comments) {
        if (!c.created_at) continue
        const key = c.created_at.slice(0, 10)
        if (daily[key] !== undefined) daily[key] += 1
      }
    }
  } catch (err) {
    console.warn("cnb comments pulse:", err.message)
  }
  return Object.entries(daily).map(([date, count]) => ({
    date,
    count,
    level: count >= 8 ? 4 : count >= 4 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0,
  }))
}

async function fetchContributionTotal(login, createdAt, token) {
  if (token) {
    const startYear = new Date(createdAt || "2020-01-01").getUTCFullYear()
    const endYear = new Date().getUTCFullYear()
    let total = 0
    const query = `
      query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar { totalContributions }
          }
        }
      }
    `
    for (let year = startYear; year <= endYear; year++) {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "zkeq-profile",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: {
            login,
            from: `${year}-01-01T00:00:00Z`,
            to: `${year}-12-31T23:59:59Z`,
          },
        }),
      })
      if (!res.ok) throw new Error(`graphql ${res.status}`)
      const json = await res.json()
      if (json.errors) throw new Error(json.errors[0]?.message || "graphql error")
      total +=
        json.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0
    }
    if (total > 0) return total
  }

  const payload = await getJson(`https://github-contributions-api.jogruber.de/v4/${login}`, {
    "User-Agent": "ZkeqProjects-Site/2.0",
  })
  return Object.values(payload.total || {}).reduce((a, b) => a + Number(b || 0), 0)
}

async function fetchGithub() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ""
  const headers = ghHeaders()
  const user = await getJson(`https://api.github.com/users/${USER}`, headers)
  let stars = 0
  const langs = new Map()
  for (let page = 1; page <= 2; page++) {
    const repos = await getJson(
      `https://api.github.com/users/${USER}/repos?per_page=100&page=${page}&type=owner`,
      headers
    )
    if (!Array.isArray(repos) || repos.length === 0) break
    for (const r of repos) {
      stars += r.stargazers_count || 0
      if (r.fork) continue
      const lang = r.language || "Other"
      langs.set(lang, (langs.get(lang) || 0) + 1)
    }
  }
  let commits = ""
  try {
    const total = await fetchContributionTotal(USER, user.created_at, token)
    if (total > 0) commits = total.toLocaleString("en-US")
  } catch (err) {
    console.warn("contrib:", err.message)
  }
  return {
    repos: user.public_repos || 0,
    followers: user.followers || 0,
    stars,
    commits,
    langs: [...langs.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count })),
  }
}

export async function loadData() {
  const data = {
    projects: [],
    projectCount: 0,
    recordings: [],
    recordingCount: 0,
    posts: [],
    postCount: 0,
    orgName: "onmicrosoft",
    cnbRepos: 64,
    members: 14,
    subGroups: [],
    pinned: [],
    pulse28: Array.from({ length: 28 }, () => ({ level: 0 })),
    repos: 0,
    followers: 0,
    stars: 0,
    commits: "",
    langs: [],
  }

  const tasks = [
    fetchProjects()
      .then((list) => {
        data.projects = list.slice(0, 6)
        data.projectCount = list.length
      })
      .catch((err) => console.warn("pps:", err.message)),
    fetchBlog()
      .then((list) => {
        data.posts = list.slice(0, 3)
        data.postCount = Math.max(list.length, 8)
      })
      .catch((err) => console.warn("blog:", err.message)),
    fetchCnb()
      .then((cnb) => {
        Object.assign(data, cnb)
        data.recordingCount = cnb.recordings.length
        data.recordings = cnb.recordings.slice(0, 3)
      })
      .catch((err) => console.warn("cnb:", err.message)),
    fetchGithub()
      .then((gh) => Object.assign(data, gh))
      .catch((err) => console.warn("github:", err.message)),
  ]

  await Promise.all(tasks)
  return data
}
