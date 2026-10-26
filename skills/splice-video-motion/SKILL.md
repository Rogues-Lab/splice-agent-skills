---
name: splice-video-motion
description: "Direct movement in generated video and Motion compositions with Splice by film.fun: prompt anatomy for motion, the MiniMax H3 family and its settings (prompt expansion, first and last frame), camera language, timed beats for 10-15 s takes, text in video, long takes and joins, multi-shot takes with cuts, and a free prompt check per model. Use before writing a video prompt with camera moves or action, or when a generated clip moves wrongly."
license: MIT. Using the Splice service needs a Splice account under the film.fun Terms (https://www.film.fun/terms).
compatibility: Needs network access to splice.film.fun; generation needs a Splice account (OAuth sign-in or an sk_ agent key).
metadata:
  author: film.fun
  version: "1.0.0"
---
# Direct movement in video with Splice

Connect the Splice MCP server at `https://splice.film.fun/api/mcp` (OAuth sign-in, or `Authorization: Bearer sk_…` from https://splice.film.fun/dashboard/api-keys). Without MCP, use the REST API under `https://splice.film.fun/api/agents/*` with the same key (reference: https://splice.film.fun/llms-full.txt).

How to write MOVEMENT for video models (the MiniMax H3 family above all, Splice's default video model) and for Motion compositions. The same guides Splice's own agent reads.

## Tools (free, read-only)

- `get_video_motion_guide {topic}`: one guide below, by id or plain words ("dolly zoom", "prompt expansion", "bpm").
- `get_model_guide {model}`: the model's own prompting guide. Read it first.
- `check_video_prompt {prompt, model, duration, has_first_frame?, has_last_frame?, reference_images?, prompt_expansion_mode?}`: lint the prompt for its model before `generate_video` spends credits.
- `pack_multishot {shots: [{description, duration, camera?, dialogue?}], style?}`: several short shots, with cuts, in as few H3 generations as fit; each take comes with its `generate_video` arguments. `lint_multishot {prompt, duration}` checks a hand-written one.

The guides name the in-app tools in places: `generate_asset` is `generate_video` over MCP, and `validate_composition` is a `render_composition` PNG still check.

## Guides

- `motion-prompt`: Writing motion for a video model. Before any image-to-video or text-to-video prompt, on any model.
- `minimax-h3`: MiniMax H3 family — which model, which settings. Choosing between minimaxH3MaxTurbo, minimaxH3Max and minimaxH3, or setting their parameters.
- `camera-language`: Camera language for generated video. Writing the camera part of a video prompt, or a move keeps coming back wrong.
- `timed-beats`: Timed beats and structured long prompts. Any clip over ~6s, a one-take with several actions, or a motion-design film from a video model.
- `text-in-video`: Text and typography: video model or Motion?. A generated clip needs words on screen, or kinetic type over footage.
- `long-takes`: Long takes, joins and keyframes. Longer than one generation, a clip that drifts late, or joining two generated clips.
- `motion-graphics`: Motion compositions: choreography, beats and type. Building a Motion (HTML + GSAP) title, lower-third, kinetic type or overlay — after motion_design_brief.

## Writing motion for a video model

A video prompt is a direction for movement over time. The picture is the
easy part; what goes wrong is WHAT MOVES, WHEN, and WHAT MUST STAY PUT.

### Order of a prompt
1. **Format line** — length, aspect, genre: "A 15-second 9:16 one-take fashion film."
2. **Lock line** (image-to-video) — the first frame is the master: "Same face,
   outfit, set and logo as the first frame throughout." Don't re-describe the
   frame; the image already shows it. [verified: paparazzi-yacht, anime-fashion-film]
3. **The motion spine** — the one continuous thing the camera and subject do.
4. **Timed beats** for anything over ~6s (see timed-beats).
5. **Camera** — one behaviour per beat, with size and speed (see camera-language).
6. **Physics and sound** — "real body weight", "coherent liquid physics",
   diegetic sound only. [verified: paparazzi-yacht]
7. **Closing look line** — the same style line on every shot of a piece.

### Rules
- One action per beat. Two actions in a second read as mush.
- Name speed and change of speed: "accelerates between poses, brakes hard on
  every lock" gives rhythm; "dynamic camera" gives nothing. [verified: anime-fashion-film]
- Define invariants by what you can SEE, not by what must not happen. "Never
  tilts" failed; "the shelf lines stay parallel to the top and bottom of frame"
  worked. For an orbit, "held locked and motionless in the exact centre of
  frame" held the framing. [verified: camera-moves renders]
- Bans on a style or transition ("no dissolves or morphs", "hard cuts only")
  do tend to hold. [guidance + verified: angle-showcase]
- A fixed element must be stated as present: "the logo stays on screen the
  whole time", not only mentioned once. [guidance]
- More specific detail = more adherence, especially colour and line style
  that should not drift. [guidance]
- After two failed rewordings of the same move, change model. Some moves are
  a capability gap, not a wording problem (a true dolly zoom worked first try
  on minimaxH3MaxTurbo after failing twice on LTX). [verified]

Run check_video_prompt before you spend: it catches wrong reference labels,
references a model drops, beats that don't add up, and length problems.

## MiniMax H3 family on Splice

| modelId | What we send it | Length | Resolution | Cost |
|---|---|---|---|---|
| minimaxH3MaxTurbo (DEFAULT) | prompt, firstFrameImage, lastFrameImage, aspectRatio (T2V only) | 5–15s | 480P / 768P | 3.75 / 6 cr/s |
| minimaxH3Max | same as Turbo | 5–15s | 480P / 768P | 7.5 / 12 cr/s |
| minimaxH3MaxReference | prompt, referenceImages (≤9), referenceVideos (≤3), referenceAudios (≤3), ≤12 files, aspectRatio (default adaptive), promptExpansionMode — NO first frame | 5–15s | 480P / 768P / 1080P | 10 / 16 cr/s (1080P 32) + reference surcharge |
| minimaxH3 | prompt, first/last frame, referenceImages (≤7), referenceVideos, referenceAudios | 4–15s | 768P / 2K | see list_generators |

Pass these in generate_asset params (or the agent API's parameters object):
{ modelId, prompt, duration, resolution, aspectRatio, firstFrameImage,
lastFrameImage, promptExpansionMode }.

### What each one does and ignores
- **Turbo / Max take NO references.** Reference images, videos and audio are
  dropped. To hold a face or a product, either bake it into a first frame
  with an image model (with the references) and animate that frame
  [verified: paparazzi-yacht = image model master still → Turbo, 15s], or
  use **minimaxH3MaxReference** (the "Video · references" generator's reference mode).
- **minimaxH3MaxReference** (live in the Video · references generator) takes references
  but no first frame. Name them in attach order, spaced: "Image 1 is the
  courier; Image 2 is her bike; Audio 1 is her voice." (MiniMax's long-form
  structured layout writes <Picture 1>.) Give every reference a job. Reference clips
  are 2–15s each, ≤15s combined; audio needs an image or video beside it.
  References add a token surcharge, so attach only what carries identity,
  motion or voice. [guidance: Forge #158 schema; not yet rendered by us]
- **aspectRatio only applies to text-to-video.** With a first frame the
  output follows the image. Turbo at 768P comes back 1344×768 (≈16:9).
- **First + last frame**: write ONE continuous path between the two stills,
  not two descriptions. A last frame alone also works: the model invents a
  start and lands on it. [guidance]
- **minimaxH3** is the one with references: character, prop, voice and
  camera-plate references, and native dialogue from a reference voice.
  Name the inputs in the prompt in attach order, spaced: "Image 1", "Video 1",
  "Audio 1" (MiniMax's and fal's form), and give every reference a job:
  "Image 1 is the courier; Image 2 is her bike." [verified 2026-09-27 on
  Replicate: binds by ordinal; Image1, [Image1], @Image1 and <Picture 1> also
  bind — keep one style per prompt]
- **Labels are per model AND per provider.** Our Seedance 2.5 / 2 Fast run on
  Replicate: [Image1] / [Video1] / [Audio1]. The @Image1 form is fal's
  Seedance dialect — don't carry it over. check_video_prompt knows each.
- Turbo has the best prompt adherence per credit; draft at 480P/5s, then
  render the keeper at 768P. [guidance + verified pricing]

### promptExpansionMode (Turbo / Max)
Forge sends "balanced" unless you pass one.
- **disabled** — send the prompt as written. Use it when the prompt is
  already timed and structured (beats, sections, exact on-screen text), so
  the rewrite can't blur your timings. [guidance; Forge passes it through,
  not yet run by us]
- **balanced** (~1s) — a detailed prompt you're not sure is in H3's style.
- **quality** (up to ~30s) — a short prompt that needs fleshing out.

### Camera syntax
H3 reads camera moves as prose ("the camera pushes in slowly with a small
move"). The bracket commands ("[Pan left]", "[Push in]") belong to the older
Hailuo models; don't use them on H3. See camera-language. [guidance]

### The rest of the H3 Max family
- **minimaxH3MaxExtend** — continue a clip: videoUrl (1.6–60s) + a prompt
  that says WHAT HAPPENS NEXT, not what the source shows. duration = seconds
  of new footage (5–15); output "extended" (source + new) or "continuation"
  (new only); 480P–2K. It is the "Extend Video" tool (Tools), and the agent
  API route POST /api/agents/edit/video-extend; generate_asset has no extend
  kind, so from this chat send the user to the tool.
- **minimaxH3MaxLipSync** — a face image + ≥5s of audio (clipped at 14.8s),
  no prompt; the clip is as long as the audio. generate_asset kind "lipsync"
  with { modelId: "minimaxH3MaxLipSync", imageUrl, audioUrl } (agent API:
  /api/agents/generate/lipsync with image_url instead of video_url).

### Several short shots in one take
For a scene of several shots under ~5s each, use compose_multishot_prompt: it
packs them into as few 5–15s generations as fit, with MiniMax's own cut
notation ("[Shot 2] At 00:03.500, the camera cuts to …"). check_video_prompt
reads that notation as beats too.

## Camera language

Write a move as **type + size + speed + target**:
"The camera pushes in slowly, a small move, toward her eyes."
"A fast, large arc left around the car, ending on the driver's window."

### Move types (use these words)
- **Push in / pull out** — the camera travels toward or away (not a zoom).
- **Zoom in / out** — the lens changes; perspective stays.
- **Pan / tilt** — the camera turns in place, left-right / up-down.
- **Truck** — slides sideways; **pedestal** — rises or lowers without tilting.
- **Arc / orbit** — circles the subject.
- **Tracking / follow** — moves with a moving subject.
- **Static / locked-off** — no movement at all.
- **Handheld / shake** (slight or strong), **roll**, **POV**.
[guidance: MiniMax's H3 vocabulary; the same words carried our 20 camera-move templates]

### Rules
- **One camera behaviour per beat.** Change behaviour at a beat boundary:
  "quiet push → low lateral track → fast pull back → locked frontal hold". [guidance]
- **Rhythm is speed change.** "Accelerates between marks and brakes on each
  one" reads as edited; constant speed reads as a screensaver. [verified: anime-fashion-film]
- **Prefer a cut to a tiny reframe only when there is new information**;
  otherwise move the camera. [guidance]
- **Make the invariant visible** for moves defined by what doesn't change:
  - pedestal: "horizontal lines stay parallel to the top and bottom of frame"
  - orbit: "the subject held locked and motionless in the exact centre of frame
    while the room sweeps continuously past"
  - dolly zoom: "head and shoulders pinned to the identical spot and width in
    frame, touching the same frame edges in the last frame as in the first"
  [verified: camera-moves renders; the dolly zoom also needed minimaxH3MaxTurbo]
- **Transitions as physical events**: "whip pan left, cut at peak blur, snap
  back into focus on the man". [guidance + verified: paparazzi whip-left/whip-back]

The Template library's "Camera moves" category has 20 working examples to start from.

## Timed beats

Timed beats are the strongest control we have over a 10–15s clip.

### Format
One beat per line, times from 0 to the duration, no gaps, no overlaps:

    0-2s: The man pushes the bottle into her hands; they look at each other.
    2-4s: She shakes it hard with both hands.
    …
    12-15s: He catches her; the take ends on him laughing at the camera.

Two-decimal times work too ("0.00-1.50  FIRST WORD") and suit text on a beat grid.
[verified: paparazzi-yacht (Turbo, 15s, 7 beats) and anime-fashion-film (H3, 15s, 9 beats)]

### Sectioned prompts for designed films [guidance]
Long prompts (several thousand characters) work on text-to-video when they
are organised. A shape that holds up:
1. FORMAT — "an exactly 15-second 16:9 motion-design film" (match the duration you send)
2. CONCEPT — one sentence on what the piece is about
3. VISUAL SYSTEM — palette, materials, line and type style (lock the colours by name)
4. ALLOWED ON-SCREEN TEXT — the exact phrases, nothing else
5. TIMED PASSAGES — 3–5 blocks with a title each: "3.00-6.00 — THE LINE BECOMES A GROOVE"
6. MOTION AND CAMERA — the one continuous spine and the camera behaviour per passage
7. SOUND — diegetic sound and music
Count things exactly when counts matter ("15 clues in five passages of three").

### Beat sizing
- ≥1.5s for a real action; <1s beats only for single, simple accents.
- Put the biggest event about two-thirds in, then land.
- **Script the ending.** "12.80-15.00 — Hold: camera and every layer stop;
  the frame stays sharp and unchanged to the last frame." An unscripted
  ending drifts or loops back to the opening. [guidance]
- Keep the stated length, the beats and the duration parameter in agreement.

With promptExpansionMode left on, the model may rewrite your beats; send
"disabled" when the beats are final (see minimax-h3).

## Text in generated video

Video models can render text, but it breaks as it multiplies: letters swap,
words re-form mid-shot, colours drift.

### Decide first
- **Exact words that must be right** (brand, price, CTA, names) → Motion
  composition over the footage. It is deterministic and costs a flat 5
  credits per render.
- **Text as part of the image** (a sign, a neon word, a title that is also
  an object) → the video model, with the rules below.

### If the model renders the text [guidance]
- Put every phrase in quotes, exactly as it should read, and list them as the
  only allowed text.
- Few words at a time: one short phrase per beat.
- Ask for whole-phrase layers: "each phrase is one finished, typeset layer;
  letters never scramble, morph, bend or re-form".
- Blur only while moving: "directional blur on moving panels only; zero blur
  while text is readable".
- Lock a key text frame with first/last frames: make the frame with an image
  model (clean type), then animate from or into it.

### Hybrid (usually best)
Generate the plate with no text, then build the type in Motion on top: the
footage as a video clip on the bottom track, text clips above, animations on
the same beat grid as the footage's timed beats.

## Long takes and joins

- **Late drift**: if a take goes wrong at, say, 11s, keep 0–11s, then extend
  it with minimaxH3MaxExtend (prompt only what happens next), or extract that
  frame and generate the next segment from it as the first frame. [guidance]
- **Slow starts**: models ease in over the first ~second. When joining a
  continuation, trim ~1s from its head so the motion doesn't visibly stall at
  the join. [guidance]
- **Bridges**: to join shot A to shot B seamlessly, generate a clip with
  firstFrameImage = A's last frame and lastFrameImage = B's first frame, and
  describe the single path between them. [guidance; long in our skills, not render-checked]
- **Keyframes as control**: generate many cheap text-to-video drafts (480P,
  5s), pick the best, clean its key frames with an image model, then re-run as
  image-to-video with those frames. [guidance]
- Generation is a global concurrency cap: run segments one after another.

## Motion compositions — choreography

motion_design_brief picks the personality (easing family, durations,
travel); this is how to lay the timeline out so it plays like a film.

### Put everything on a grid
- **Music**: one beat = 60 / BPM seconds (120 BPM = 0.5s, 128 BPM ≈ 0.469s).
  Start entrances ON beats, let holds span whole bars (4 beats), and land the
  final lock on a downbeat. Round clip starts to the grid with shift_clips /
  sequence_clips rather than by eye.
- **No music**: use a fixed grid anyway (0.25s or 0.5s) so the piece feels
  deliberate.
- When the footage under it has timed beats, reuse the same times.

### Passages, not a pile of tweens
Split the piece into 3–5 passages, each with ONE job (enter the title,
reveal the stat, hand to the CTA, hold). Inside a passage, one hero moves and
the rest support. Name them in your plan with times, like a shot list.

### Accelerate between, brake on the lock
Moves that start fast and stop softly read as confident: expo.out or
power4.out into a hold; expo.inOut for a move between two resting places.
Hold every lock long enough to read (≈ word count / 3 seconds, minimum 0.8s).

### Typography
- Animate whole words or lines (per_word + stagger_s), not individual
  letters, unless the letters ARE the idea. Keep each phrase one piece.
- Blur only during travel; text is sharp whenever it is readable.
- One direction of travel per passage; alternate between passages.
- Mask reveals (a clip moving out from behind a panel) look designed; plain
  fades on everything look default.

### A camera in HTML
A slow scale on a full-stage wrapper (1.00 → 1.04 over the passage, sine)
reads as a push-in and ties separate layers together. Keep it under 5% so
text stays crisp. Use it for one passage, not the whole piece.

### Ending
Final state holds, sharp and still, to the last frame. No element should
still be moving when the composition ends.

### Frame-exact
The render seeks every frame, so any randomness or jitter comes from the
seeded __ff.rand / __ff.range / __ff.wiggle helpers, never Math.random,
timers or requestAnimationFrame, and loops use a finite repeat count.

Then run motion_quality_check, and validate_composition before rendering.
