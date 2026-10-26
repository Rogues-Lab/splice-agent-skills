---
name: splice-motion-design
description: "Motion design craft for Splice Motion compositions (HTML + GSAP): pick the motion personality for the tone (corporate, playful, luxury, news, tech, cinematic) with its easing family, durations, travel and stagger, apply the animation principles, and check the result against an amateur-motion quality gate before rendering. Use before animating a title card, lower-third, kinetic type or stat reveal, or when motion looks cheap."
license: MIT. Using the Splice service needs a Splice account under the film.fun Terms (https://www.film.fun/terms).
compatibility: Needs network access to splice.film.fun; generation needs a Splice account (OAuth sign-in or an sk_ agent key).
metadata:
  author: film.fun
  version: "1.0.0"
---
# Design motion that feels intentional

Connect the Splice MCP server at `https://splice.film.fun/api/mcp` (OAuth sign-in, or `Authorization: Bearer sk_…` from https://splice.film.fun/dashboard/api-keys). Without MCP, use the REST API under `https://splice.film.fun/api/agents/*` with the same key (reference: https://splice.film.fun/llms-full.txt).

The director's layer above GSAP mechanics for Splice Motion compositions (title cards, lower-thirds, kinetic type, stat reveals, logo stings): decide the motion personality first, then sequence, then check.

## Tools (free, read-only)

- `motion_design_brief {intent, tone?}`: the personality for the tone (easing family, durations, travel, stagger, what to avoid), the matching recipe, the principles to apply, choreography and a quality gate. Call it before writing any animation.
- `gsap_for_use_case {intent}`: the GSAP pattern, easing and paste-ready snippet for an animation described in plain words.
- `motion_quality_check {description, code?}`: the checklist below plus flags for likely misses, and a lint of custom GSAP for calls that render differently from the preview.
- Build with `create_composition` / `edit_composition`, check with `render_composition` PNG stills (`times_s`), then render the MP4.

## Personalities

| Tone | Feel | Easing family | Entrance | Travel | Stagger | Avoid |
|---|---|---|---|---|---|---|
| `corporate` | Restrained. Motion should be felt, not seen. Nothing overshoots. | power2, sine | 0.4-0.7 s | Small — 16–32px travel, scale 0.98→1. Never a big slam. | Tight, 0.05–0.08s, so lists feel orderly not showy. | elastic, bounce, back |
| `playful` | Bouncy and expressive. Overshoot is a feature, not a bug. | back, elastic, power2 | 0.4-0.8 s | Generous — scale 0.6→1 pops, 40px+ travel, visible overshoot. | Loose, 0.08–0.14s, so the cascade is part of the charm. | none |
| `luxury` | Slow, deliberate, lots of empty time. Silence between beats. | expo, power4, sine | 0.8-1.4 s | Minimal travel, long holds. A slow fade + micro ken-burns. | Wide, 0.12–0.2s. Let each element land before the next. | bounce, elastic, back |
| `news` | Fast and punchy. Type slams in; kinetic word-by-word reveals. | expo, power4, circ | 0.25-0.5 s | Bold — big scale slams (1.4→1), decisive slides off-edge. | Fast per-word, 0.04–0.08s, for kinetic-typography urgency. | elastic, bounce |
| `tech` | Crisp and mechanical-but-smooth. Clean starts and stops. | circ, power2, power4 | 0.3-0.6 s | Medium, geometric. Snap to grid; avoid organic wobble. | Even, 0.06–0.1s. Precision over personality. | bounce, elastic |
| `cinematic` | Slow builds, long holds, motion that breathes. Ken-burns base. | sine, power2, expo | 0.7-1.3 s | Small foreground travel over slow continuous background drift. | Wide, 0.12–0.25s. Time is the tool; don't rush the reveal. | bounce, elastic, back |

One personality per composition: easings from more than one family read as an accident.

## Principles

- **Staging.** Sequence, don't pile on. Title lands, THEN the subtitle, THEN the CTA — use stagger / timeline offsets. Two things moving in opposite directions at once reads as chaos.
- **Timing.** Pick duration from the personality band, not a habit. A luxury title at 0.3s reads frantic; a news slam at 1.2s reads asleep. Add a HOLD so the viewer can read before the exit.
- **Slow in, slow out (easing).** Never use ease 'none' for entrances/exits. Reach for a power/expo/sine curve. 'none' is only for continuous loops (carousel, ken-burns base).
- **Follow-through & overlapping action.** Offset grouped elements with stagger; let a subtitle settle a beat after its title. An overshoot easing (back.out) is follow-through for a single element.
- **Appeal (coherence).** One personality per composition. Don't mix an elastic badge with an expo title — pick the personality's easing family and stay in it. Consistent durations and stagger read as intentional.

## Ease presets

- `smooth` (`sine.inOut`): Gentle start and stop. Loops, drifts, background moves, calm brands.
- `gentle-out` (`power2.out`): Standard entrance: quick start, soft landing. The safe default.
- `snappy-out` (`expo.out`): Fast, confident arrival that settles hard. Titles, UI, tech brands.
- `overshoot` (`back.out(1.7)`): Lands slightly past the mark and returns. Badges, pops, playful energy.
- `anticipate` (`back.in(1.7)`): Pulls back before leaving. Exits that should feel deliberate.
- `anticipate-overshoot` (`back.inOut(1.7)`): Wind-up then overshoot. Position swaps and cartoon moves.
- `elastic-settle` (`elastic.out(1, 0.5)`): Springy wobble that settles. Logo stings and stat pops; use sparingly.
- `bounce-land` (`bounce.out`): Drops and bounces to rest. Objects falling into place.
- `accelerate-out` (`power2.in`): Starts slow, leaves fast. Standard exit.
- `linear` (`none`): Constant speed. Only for continuous loops, tickers and Ken Burns.

## Quality gate (before rendering)

- Is any entrance/exit using ease 'none' (linear)?
- Does everything share one duration?
- Do grouped elements (list, row, words) animate in unison?
- Is there a hold so the viewer can actually read it?
- Does an element enter but never leave (or vice-versa)?
- Are 3+ things moving in different directions at once?
- Do the easings come from more than one personality family?

A clean `motion_quality_check` is not a pass: walk the list yourself.
