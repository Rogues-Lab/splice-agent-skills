#!/usr/bin/env node
/**
 * Validates this repo against its manifest (skills.json) and, unless --offline,
 * against what Splice serves live at /.well-known/agent-skills/.
 *
 *   node scripts/validate.mjs            all checks
 *   node scripts/validate.mjs --offline  skip the live checks
 *
 * Checks:
 *   1. Frontmatter: every SKILL.md starts with YAML frontmatter whose name matches
 *      its folder and the Agent Skills naming rules, with a description of at most
 *      1024 characters and a metadata.version equal to the manifest's.
 *   2. Digests: the sha256 of each SKILL.md equals its manifest digest and, live,
 *      the digest Splice publishes and the bytes Splice serves.
 *   3. Orphans: every file under skills/ is a SKILL.md listed in the manifest, and
 *      every listed skill exists.
 *   4. Version: content_hash is recomputed from the digests, version is
 *      `<mcp_version>+skills.<content_hash>`, every plugin manifest carries it, and
 *      (live) mcp_version is the version the Splice MCP server reports.
 *
 * No dependencies: Node 20+.
 */
import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const OFFLINE = process.argv.includes('--offline')
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const PLUGIN_MANIFESTS = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json']

const errors = []
const fail = (msg) => errors.push(msg)
const sha = (buf) => `sha256:${createHash('sha256').update(buf).digest('hex')}`
const exists = (p) => stat(p).then(() => true, () => false)

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else out.push(p)
  }
  return out
}

/** Minimal frontmatter reader: top-level `key: value` pairs and one level of nesting. */
function frontmatter(text) {
  if (!text.startsWith('---\n')) return null
  const end = text.indexOf('\n---\n', 4)
  if (end < 0) return null
  const data = {}
  let parent = null
  for (const line of text.slice(4, end).split('\n')) {
    if (!line.trim()) continue
    const nested = /^ {2}([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    const top = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (nested && parent) data[parent][nested[1]] = unquote(nested[2])
    else if (top) {
      if (top[2] === '') {
        parent = top[1]
        data[parent] = {}
      } else {
        parent = null
        data[top[1]] = unquote(top[2])
      }
    } else return null
  }
  return data
}

function unquote(v) {
  if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v)
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'")
  return v
}

function contentHash(skills) {
  const lines = [...skills]
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map((s) => `${s.name} ${s.digest}\n`)
    .join('')
  return createHash('sha256').update(lines, 'utf8').digest('hex').slice(0, 12)
}

async function fetchRetry(url, as) {
  let last
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } })
      if (res.ok) return as === 'json' ? res.json() : Buffer.from(await res.arrayBuffer())
      last = `HTTP ${res.status}`
    } catch (e) {
      last = e.message
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
  }
  throw new Error(`${url}: ${last}`)
}

const manifest = JSON.parse(await readFile(join(ROOT, 'skills.json'), 'utf8'))
const listed = new Map(manifest.skills.map((s) => [s.name, s]))
if (listed.size !== manifest.skills.length) fail('skills.json lists a skill twice')

// 1 + 2 (local) per skill
for (const s of manifest.skills) {
  const path = join(ROOT, 'skills', s.name, 'SKILL.md')
  if (s.path !== `skills/${s.name}/SKILL.md`) fail(`${s.name}: path is ${s.path}, expected skills/${s.name}/SKILL.md`)
  if (!(await exists(path))) {
    fail(`${s.name}: skills/${s.name}/SKILL.md is missing`)
    continue
  }
  const buf = await readFile(path)
  const text = buf.toString('utf8')
  const fm = frontmatter(text)
  if (!fm) {
    fail(`${s.name}: SKILL.md has no readable frontmatter`)
    continue
  }
  if (fm.name !== s.name) fail(`${s.name}: frontmatter name is "${fm.name}"`)
  if (!NAME_RE.test(s.name) || s.name.length > 64) fail(`${s.name}: name breaks the Agent Skills naming rules`)
  if (typeof fm.description !== 'string' || !fm.description.trim()) fail(`${s.name}: description is empty`)
  else if (fm.description.length > 1024) fail(`${s.name}: description is ${fm.description.length} chars (max 1024)`)
  if (fm.description !== s.description) fail(`${s.name}: frontmatter description differs from skills.json`)
  if (fm.metadata?.version !== s.version) fail(`${s.name}: metadata.version ${fm.metadata?.version} != skills.json ${s.version}`)
  if (sha(buf) !== s.digest) fail(`${s.name}: sha256 of SKILL.md does not match skills.json`)
}

// 3 orphans
for (const f of await walk(join(ROOT, 'skills'))) {
  const rel = relative(join(ROOT, 'skills'), f).split('/')
  if (rel.length !== 2 || rel[1] !== 'SKILL.md' || !listed.has(rel[0])) fail(`orphan file: skills/${rel.join('/')}`)
}

// 4 version (local)
const hash = contentHash(manifest.skills)
if (hash !== manifest.content_hash) fail(`content_hash is ${manifest.content_hash}, recomputed ${hash}`)
const version = `${manifest.mcp_version}+skills.${manifest.content_hash}`
if (manifest.version !== version) fail(`version is ${manifest.version}, expected ${version}`)
for (const p of PLUGIN_MANIFESTS) {
  if (!(await exists(join(ROOT, p)))) continue
  const v = JSON.parse(await readFile(join(ROOT, p), 'utf8')).version
  if (v !== manifest.version) fail(`${p}: version ${v} != ${manifest.version}`)
}
if (!(await readFile(join(ROOT, 'README.md'), 'utf8')).includes(manifest.version)) fail('README.md does not name the bundle version')

// live
if (!OFFLINE) {
  try {
    const index = await fetchRetry(manifest.index_url, 'json')
    const live = new Map(index.skills.map((s) => [s.name, s]))
    for (const name of new Set([...listed.keys(), ...live.keys()])) {
      const a = listed.get(name)
      const b = live.get(name)
      if (!b) fail(`${name}: in skills.json but not served live`)
      else if (!a) fail(`${name}: served live but missing here`)
      else {
        if (a.digest !== b.digest) fail(`${name}: digest differs from the live index`)
        const bytes = await fetchRetry(b.url, 'buffer')
        if (sha(bytes) !== a.digest) fail(`${name}: the live SKILL.md bytes do not match`)
      }
    }
    const card = await fetchRetry(`${manifest.origin}/.well-known/mcp/server-card.json`, 'json')
    if (card.version !== manifest.mcp_version) fail(`mcp_version ${manifest.mcp_version} != live server ${card.version}`)
  } catch (e) {
    fail(`live check failed: ${e.message}`)
  }
}

if (errors.length) {
  console.error(`${errors.length} problem(s):\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`ok: ${manifest.skills.length} skills, version ${manifest.version}${OFFLINE ? ' (offline)' : ', matches live'}`)
