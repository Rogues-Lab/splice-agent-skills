# Splice agent skills

Agent Skills for [Splice](https://splice.film.fun), film.fun's AI filmmaking studio. They teach an agent (Claude Code, Cursor, VS Code, Codex and other [Agent Skills](https://agentskills.io) hosts) how to use Splice on a user's account: generate and edit images, video, voice and music, render motion graphics, run tested templates and check prices.

The skills are documentation only. They contain no code and no credentials. Every action goes through Splice's public API at `https://splice.film.fun`, and anything that spends credits needs the user's own Splice account.

Developer docs: **https://splice.film.fun/developers**

## Skills

| Skill | What it covers |
|-------|----------------|
| [`splice-generate-media`](skills/splice-generate-media/SKILL.md) | Images, text/image-to-video, voiceovers, music and sound effects |
| [`splice-edit-media`](skills/splice-edit-media/SKILL.md) | Image edits, upscaling, reframing, clipping, merging, captions, lip sync, transcription |
| [`splice-motion-graphics`](skills/splice-motion-graphics/SKILL.md) | HTML + GSAP compositions rendered to MP4, WebM or PNG |
| [`splice-templates`](skills/splice-templates/SKILL.md) | Find and run tested model + prompt recipes from the public template library |
| [`splice-credits-and-pricing`](skills/splice-credits-and-pricing/SKILL.md) | Prices, balance and credit top-ups |

## Install

**Any Agent Skills host (via [skills.sh](https://skills.sh)):**

```sh
npx skills add Rogues-Lab/splice-agent-skills
```

**Claude Code plugin** (skills plus the Splice MCP server):

```sh
claude plugin marketplace add Rogues-Lab/splice-agent-skills
claude plugin install splice@splice
```

**MCP server only.** The remote server is `https://splice.film.fun/api/mcp`. It signs you in with OAuth on first connect, or takes `Authorization: Bearer sk_…` from [your API keys page](https://splice.film.fun/dashboard/api-keys). Ready-made configs are in this repo:

- Claude Code: [`.mcp.json`](.mcp.json), or `claude mcp add --transport http splice https://splice.film.fun/api/mcp`
- Cursor: [`.cursor/mcp.json`](.cursor/mcp.json)
- VS Code: [`.vscode/mcp.json`](.vscode/mcp.json)

A public, sign-in-free docs server (templates, models, prices) is at `https://splice.film.fun/api/mcp/docs`.

## Also published at

The same skills are served at https://splice.film.fun/.well-known/agent-skills/index.json (Agent Skills discovery v0.2.0). More for agents: [`/llms-full.txt`](https://splice.film.fun/llms-full.txt), [`/agents.md`](https://splice.film.fun/agents.md), [`/pricing.md`](https://splice.film.fun/pricing.md).

## License

The skill documents in this repo are [MIT](LICENSE). Using the Splice service needs a Splice account under the [film.fun Terms](https://www.film.fun/terms).
