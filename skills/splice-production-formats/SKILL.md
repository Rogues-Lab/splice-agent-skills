---
name: splice-production-formats
description: "Production craft for a finished video with Splice by film.fun: the segment anatomy of a social short, advert, explainer, news show, product demo or music video, the Splice asset each beat needs (image, video, voiceover, music, Motion composition, captions), durations for a target length, assembly notes and a pre-render QA checklist. Use when someone asks for a complete video rather than a single clip."
license: MIT. Using the Splice service needs a Splice account under the film.fun Terms (https://www.film.fun/terms).
compatibility: Needs network access to splice.film.fun; generation needs a Splice account (OAuth sign-in or an sk_ agent key).
metadata:
  author: film.fun
  version: "1.0.0"
---
# Plan a whole cut with Splice

Connect the Splice MCP server at `https://splice.film.fun/api/mcp` (OAuth sign-in, or `Authorization: Bearer sk_…` from https://splice.film.fun/dashboard/api-keys). Without MCP, use the REST API under `https://splice.film.fun/api/agents/*` with the same key (reference: https://splice.film.fun/llms-full.txt).

Production craft for a finished video (an advert, explainer, social short, news round-up, product demo or music video): which segments the format needs, what Splice asset each beat calls for, how long each runs, and the checks before the final render.

## Tools (free, read-only)

- `production_brief {format, length_s?, aspect?}`: the segment plan below scaled to your length, the asset summary, assembly notes and a QA gate. Call it before generating anything.
- `production_qa {description}`: the pre-render checklist plus flags for likely misses in the cut you describe.
- Then generate one asset per beat (`generate_image`, `generate_video`, `generate_voice`, `generate_music`; `motion_design_brief` before any Motion composition), assemble on a Studio timeline (`create_studio` / `edit_studio`), run `production_qa`, and `export_studio` (`dry_run` prices it first).

## Formats

### Social short (TikTok / Reels / Shorts) (`social-short`)

Vertical, fast, feed-native. Watched sound-off first, so text carries the message. Typical length 15-45 s, 9:16. Plan at 30 s:

| Segment | Seconds | Job | Assets |
|---|---|---|---|
| Hook | 3.6 | Stop the scroll in the first 3s — a bold visual + a promise on screen. | video — arresting opening motion; composition — kinetic on-screen hook text |
| Build | 21.6 | Deliver the payoff in 2–4 quick beats; keep motion changing. | video — beat 1 visual; image — beat 2 visual; voiceover — optional narration / trending audio; captions — burned-in captions (sound-off) |
| Payoff + CTA | 4.8 | Land the point and tell them what to do next. | composition — end-card with CTA (follow / link) |

- Aspect: 9:16. Keep EVERY clip at this aspect.
- Sound-off platform — burn captions and make on-screen text carry the message.
- Generate to these beats, then assemble on a Studio timeline (video track + audio track + a foreground text track for callouts).
- Captions are NON-optional — most views are muted.
- Front-load value; the first frame IS the thumbnail.
- Music bed spans the whole clip.

### Advert / promo (`advert`)

Short brand or product spot — hook, a few product beats, a CTA close. Typical length 15-30 s, 16:9. Plan at 23 s:

| Segment | Seconds | Job | Assets |
|---|---|---|---|
| Title / hook | 5 | Brand moment + a reason to keep watching. | composition — animated title / logo; video — hero establishing shot |
| Product beats | 15 | 2–3 benefit shots, each with a one-line callout. | video — benefit shot; image — benefit shot; composition — feature callout lower-thirds |
| CTA end-card | 3 | Logo + tagline + where to go. | composition — end-card: logo, tagline, URL/CTA |

- Aspect: 16:9. Keep EVERY clip at this aspect.
- Lay one music bed across the whole cut; duck it under any voiceover.
- Generate to these beats, then assemble on a Studio timeline (video track + audio track + a foreground text track for callouts).
- One motion personality across every title/callout (see motion_design_brief).
- Music bed full-duration; add VO only if there's a specific line to say.

### Explainer (`explainer`)

Teach one idea clearly — problem, solution, recap. VO-led. Typical length 45-120 s, 16:9. Plan at 83 s:

| Segment | Seconds | Job | Assets |
|---|---|---|---|
| Open | 5.1 | Title + the question the video answers. | composition — title card; voiceover — cold-open line |
| Problem | 20.2 | Set the stakes so the solution matters. | video — problem visual; voiceover — narration; music — bed (ducked under VO) |
| Solution | 45.5 | Walk the idea in 2–4 steps; label each. | video — step visual; image — diagram / detail; voiceover — narration; composition — step labels / lower-thirds |
| Recap + CTA | 12.1 | One-line recap and the next action. | composition — recap / CTA end-card; voiceover — sign-off |

- Aspect: 16:9. Keep EVERY clip at this aspect.
- Lay one music bed across the whole cut; duck it under any voiceover.
- Generate to these beats, then assemble on a Studio timeline (video track + audio track + a foreground text track for callouts).
- Script first (draft_pipeline), then generate to the script's beats.
- Duck the music under the voiceover so narration stays intelligible.
- Every spoken number gets a stat card with exactly that number; still images always move (slow push or pan).

### News show / round-up (`news-show`)

Multi-story segment: open, N stories (title + read + b-roll + strap), close. Typical length 60-120 s, 16:9. Plan at 90 s:

| Segment | Seconds | Job | Assets |
|---|---|---|---|
| Show open | 9.2 | Animated logo + show title; set the tone. | composition — show-open animation; music — sting |
| Story 1 | 34.6 | Title card, host read, b-roll under, name strap. | composition — story title + source watermark; video — newsreader read; video — b-roll underlay; composition — lower-third strap |
| Story 2 | 34.6 | Same shape — repeat per story you cover. | composition — story title; video — newsreader read; image — b-roll underlay; composition — lower-third strap |
| Close | 11.5 | Sign-off card + host outro. | composition — close / credits card; video — host sign-off |

- Aspect: 16:9. Keep EVERY clip at this aspect.
- Lay one music bed across the whole cut; duck it under any voiceover.
- Generate to these beats, then assemble on a Studio timeline (video track + audio track + a foreground text track for callouts).
- Composition + newsreader + b-roll are THREE independent assets per story.
- Repeat the Story block for each story; scale total to your target length.
- Add a stat composition when a story has a quotable number.

### Product demo / walkthrough (`product-demo`)

Show the thing working — open, feature walkthrough with labels, recap. Typical length 30-90 s, 16:9. Plan at 60 s:

| Segment | Seconds | Job | Assets |
|---|---|---|---|
| Open | 3.3 | Title + the outcome the product delivers. | composition — title card; voiceover — value line |
| Walkthrough | 50 | Feature-by-feature; label each on screen. | video — screen / product capture; voiceover — narration; composition — feature labels |
| Recap + CTA | 6.7 | Recap the wins and the next step. | composition — recap / CTA end-card; voiceover — sign-off |

- Aspect: 16:9. Keep EVERY clip at this aspect.
- Lay one music bed across the whole cut; duck it under any voiceover.
- Generate to these beats, then assemble on a Studio timeline (video track + audio track + a foreground text track for callouts).
- Keep each feature beat to one idea; don't stack labels.
- Music low under the VO.

### Music video / visualizer (`music-video`)

Music is the spine; visuals cut to the track. Usually no VO. Typical length 15-60 s, 16:9. Plan at 38 s:

| Segment | Seconds | Job | Assets |
|---|---|---|---|
| Intro | 4.2 | Establish mood + optional artist/title card. | music — the track (full duration); composition — artist / title card; video — mood-setting visual |
| Verse / build | 21.1 | Visual beats cut on the music's rhythm. | video — beat visual; image — beat visual |
| Hook / climax | 12.7 | Biggest visual on the drop / chorus. | video — hero visual; composition — kinetic lyric / accent |

- Aspect: 16:9. Keep EVERY clip at this aspect.
- Lay one music bed across the whole cut; duck it under any voiceover.
- Generate to these beats, then assemble on a Studio timeline (video track + audio track + a foreground text track for callouts).
- Cut on the beat — align clip boundaries to the music.
- No captions unless there are lyrics to show.

### Remix (a reference's structure, your content) (`remix`)

Make one like this: keep a reference's pacing, beats and framing; recast it with your own characters and lines. Typical length 15-60 s, 9:16. Plan at 38 s:

| Segment | Seconds | Job | Assets |
|---|---|---|---|
| Hook (the reference's first beat) | 4.1 | Same job and length as the reference's opening; your own line and cast. | video — opening shot recast with your character (@slug); composition — on-screen hook text |
| Beats (the reference's shape) | 27.1 | One beat per measured beat of the reference: same job, length and framing, rewritten words. | video — beat shot per reference beat; image — still for a held beat; voiceover — your rewritten line; captions — burned-in captions |
| Payoff + CTA | 6.8 | The reference's closing beat, with your payoff. | composition — end card / CTA; music — bed in your own licensed music |

- Aspect: 9:16. Keep EVERY clip at this aspect.
- Sound-off platform — burn captions and make on-screen text carry the message.
- Generate to these beats, then assemble on a Studio timeline (video track + audio track + a foreground text track for callouts).
- Structure only: never reproduce the reference's footage, music, artwork, logos or people.
- The person attests they may use the reference before anything runs; you cannot attest for them.
- A beat is never shorter than its line takes to say, whatever the reference did.
- Report the pacing you copied (shot count, average shot length, cuts a minute).

### Motion graphics (title card, logo sting, kinetic type) (`motion-graphics`)

Pure Motion, 10 seconds or less: an animated title, lower-third, stat reveal or logo sting with no footage or voice. Typical length 4-10 s, 16:9. Plan at 7 s:

| Segment | Seconds | Job | Assets |
|---|---|---|---|
| Enter | 1.5 | The hero element arrives in the motion personality's easing and duration. | composition — hero entrance (motion_design_brief first) |
| Hold | 4 | Everything settles long enough to read (about 1s per 3 words). | composition — supporting element / secondary action |
| Lock or exit | 1.5 | Exit cleanly or end on a still, sharp final frame. | composition — exit or final lock; music — optional sting |

- Aspect: 16:9. Keep EVERY clip at this aspect.
- Lay one music bed across the whole cut; duck it under any voiceover.
- Generate to these beats, then assemble on a Studio timeline (video track + audio track + a foreground text track for callouts).
- One composition, one motion personality; no generated footage or voice.
- Check layout with png stills at the key times before the full render.
- Stay inside the GSAP timeline: no timers, Date.now() or Math.random.

### Slideshow (tips, list, deck) (`slideshow`)

N tips, a roadmap or a recap deck shown as slides from one shared frame, without narration. Typical length 20-90 s, 16:9. Plan at 55 s:

| Segment | Seconds | Job | Assets |
|---|---|---|---|
| Title slide | 4.6 | What the list is and how many points. | composition — title slide from the shared frame |
| Slides | 45.8 | One idea per slide, fixed length (3-6s), one transition throughout. | composition — slide from the shared frame; image — image only where a slide's cue earns it |
| Closing slide | 4.6 | The takeaway or CTA. | composition — closing slide; music — low bed (optional) |

- Aspect: 16:9. Keep EVERY clip at this aspect.
- Lay one music bed across the whole cut; duck it under any voiceover.
- Generate to these beats, then assemble on a Studio timeline (video track + audio track + a foreground text track for callouts).
- Same frame on every slide; vary the content, never the design.
- Two points on one slide means two slides.
- Text stays up long enough to read aloud twice.

### General multi-scene piece (`general-video`)

Fallback when no narrower format fits: scenes freely mix footage, narration and on-screen text. Typical length 30-120 s, 16:9. Plan at 75 s:

| Segment | Seconds | Job | Assets |
|---|---|---|---|
| Hook | 3.9 | The first line, first text and first frame agree on what this is. | video — opening shot; composition — hook text |
| Scenes | 64.7 | Shot-list order; each scene tagged footage, voice or motion. | video — scene footage; image — scene still; voiceover — narration; composition — titles / lower-thirds |
| Close | 6.5 | Land the point; end card or CTA. | composition — end card |

- Aspect: 16:9. Keep EVERY clip at this aspect.
- Lay one music bed across the whole cut; duck it under any voiceover.
- Generate to these beats, then assemble on a Studio timeline (video track + audio track + a foreground text track for callouts).
- Anything over about 15s gets a shot list before any generation.
- Fix the frame, palette and motion personality in the plan; drift between scenes is the most visible failure.
- If a scene fails twice, change its treatment (a still with a slow push-in) instead of paying for a third attempt.

## Pre-render checklist

- Does something happen in the first 3 seconds?
- Is there continuous audio (music and/or VO) with no silent gaps?
- Is the music ducked under the voiceover?
- Do all clips share one aspect ratio?
- For a sound-off platform, are captions burned in?
- Is every on-screen text on long enough to read and legible?
- Do the shots look like one piece (consistent characters/palette/style)?
- Is there a clear close / CTA?
- Is the total close to the target length (±10%)?
- Does any element enter but never resolve (hard cut mid-motion)?
