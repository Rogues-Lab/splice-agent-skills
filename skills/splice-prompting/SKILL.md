---
name: splice-prompting
description: "How to write prompts for each AI model Splice offers (video, image, voice, music): per-model guides with reference-label syntax, prompt caps, parameter ranges, what each model ignores and verified examples, plus rules that hold on every model. Use before writing or fixing a prompt for a Splice model, or when someone asks how to prompt Seedance, MiniMax H3, Kling, Veo, Nano Banana or another model, or why a model ignored a reference."
license: MIT. Using the Splice service needs a Splice account under the film.fun Terms (https://www.film.fun/terms).
compatibility: Needs network access to splice.film.fun; generation needs a Splice account (OAuth sign-in or an sk_ agent key).
metadata:
  author: film.fun
  version: "1.0.0"
---
# Prompt Splice's models well

Connect the Splice MCP server at `https://splice.film.fun/api/mcp` (OAuth sign-in, or `Authorization: Bearer sk_…` from https://splice.film.fun/dashboard/api-keys). Without MCP, use the REST API under `https://splice.film.fun/api/agents/*` with the same key (reference: https://splice.film.fun/llms-full.txt).

Splice's prompting guides are the ones its own agent and prompt helper use: one per model, plus rules that hold on every model. Read them through the MCP server (free, read-only):

1. `list_models {type}`: each model with a guide carries `guide {tool: "get_model_guide", model, uri}`.
2. **Before prompting a model for the first time**, call `get_model_guide {model}`. It returns the model's guide (strengths, limits, prompt structure, camera or composition rules, dialogue, negatives, parameters, verified examples), its hard facts (how the prompt names attached references, which differs per model AND per provider, the character cap, duration and aspect ranges, what it ignores) and the cross-model rules below. Where the two disagree, the model guide wins.
3. For video, run `check_video_prompt {prompt, model, duration, …}` before `generate_video`. It is free and catches dropped references, label syntax and beats that overrun the clip.
4. Any other guide: `list_guides {kind?}` and `get_craft_guide {topic}`. Resources: `splice://guides/models/{id}`, `splice://guides/{kind}/{name}`.

## Rules for every model

These rules hold on every model. A model skill adds that model's own facts
(how it names attached inputs, its caps, what it ignores). When a rule here
and a model skill disagree, the model skill wins.

### Rules

- Give every attached input ONE job and say what to ignore: "Image 1 is the courier's face and jacket only; ignore its background." Never write "use the references" or "respectively".
- When several images show one thing, say so ("Images 1-3 are the same lamp from three sides; keep exactly one lamp").
- Name references with the target model's own syntax (the model skill's reference_syntax); it differs between models and even between providers of the same model. Keep labels already in the prompt verbatim.
- One primary action per shot or stage. For several beats, write them in order and give each an observable end state the next beat starts from ("she ends holding the key in her left hand").
- Time ranges ("0-3s") are pacing budgets, not frame-accurate cuts. Keep them consecutive, inside the clip length, and long enough to carry the action (about 2 s minimum).
- Camera: shot size + one move + speed ("medium shot, slow push-in"). If a second move is essential, cut to a new shot instead of stacking moves.
- Write behaviour, not labels: gaze, posture, breath, a hand that stops mid-reach — not "sad" or "tense".
- Dialogue: name the speaker, the language/accent and delivery, then the exact words in double quotes. Keep lines short enough to say in the time given (about 2.5 words per second).
- Settings that the API takes as parameters (duration, aspect ratio, resolution, audio on/off) go in the parameters, not the prose.
- Negatives: short and concrete ("no subtitles, no watermark, no extra people"). Better still, state the wanted state positively ("the camera stays locked off"). Skip long generic negative lists.
- Swap vague quality words ("cinematic", "8k", "masterpiece") for concrete choices: lens, light direction, colour, texture.
- Recurring characters, locations, props and sets: reference the entity's SHEET (turnaround or multi-view reference sheet, set as its default image), not a one-off casual still. One sheet carries the face, wardrobe and proportions from every side, so later shots hold. In Splice, mention it as @slug and the sheet is attached and labelled for the model.
- Front-load what matters most; models weight the start of the prompt, and capped models lose the end.
- Something that must NOT change (no tilt, locked framing, constant size) is the part models drop. Restate it as an observable consequence ("the shelf lines stay parallel to the top of frame"), and after two failed attempts switch model instead of rewording a third time.

### Video

- Order: subject (and its reference label), the one action, camera (size + move + speed), setting and light, one style line.
- Reuse the exact same style line on every shot of a production so the grade matches at the cut.
- Never use a multi-panel sheet as a video's FIRST frame: the model animates the grid. Compose a single frame from the sheets first (shot framing, or Splice's first_frame: "auto") and animate that. Video models with reference inputs take the sheet as a reference image like any other.
- Image-to-video: describe what moves and changes, not what the first frame already shows, and add one line that locks identity to it ("same face, outfit and set as the first frame throughout").

### Image

- Write sentences, not keyword piles: subject first, then action, setting, light, style, lens.
- Quote any text that must appear and say where it sits.
- For an edit, say what changes AND what stays.

### Audio

- Voice: put the words in text; put the delivery in style_instruction (tone, accent, pace). Everything in text is read aloud, and so is a style sent as prompt. Spell out numbers and acronyms.
- Music: genre, mood, instruments, tempo and how it builds. Never name real artists or songs.
- Sound effects: source, action, space — one sound event per prompt.

### Output

- Return only the prompt itself: no preamble, no quotes around it, no labels like "Enhanced prompt:".
- Keep the user's subject, names and any reference labels intact.

## Video model prompting

The cross-model rules are in `prompt-creation`; each model's own skill has
its caps, parameters and verified examples, and **the model skill wins**
wherever this summary and it disagree. For how to direct movement (camera
language, timed beats, invariants, joins) load `video-motion`.

The single biggest source of silently wrong output is **mixing
reference-label syntax between models**. Each model refers to its input
images, videos and audio differently, and the wrong convention makes the
model ignore the reference — nothing tells you. Pick the model first, then
write to its rules.

### Reference labels are per model AND per provider

| Model (`modelId`) | Image | Video | Audio | Notes |
|---|---|---|---|---|
| `minimaxH3` (Replicate) | `Image 1` | `Video 1` | `Audio 1` | spaced, as MiniMax and fal document it. Verified 2026-09-27: binds by ordinal, and `Image1`, `[Image1]`, `@Image1`, `<Picture 1>` also bind. One style per prompt |
| `minimaxH3MaxTurbo`, `minimaxH3Max` (fal) | none | none | none | **no reference inputs** — only a first and a last frame |
| `minimaxH3MaxReference` (fal) | `Image 1` | `Video 1` | `Audio 1` | spaced; MiniMax's long-form structured layout writes `<Picture 1>` |
| `seedance25`, `seedance2Fast` (Replicate) | `[Image1]` | `[Video1]` | `[Audio1]` | square brackets, no space. `@Image1` is fal's dialect of Seedance — not our route |
| `googleGeminiOmni11` (Replicate) | none — by role | — | — | ≤3 reference images guide subject and style (not frames); describe them by role. A reference video is a video to **edit** |

- Number inputs in the order you attach them (1, 2, …), per type. Label only
  inputs you actually pass.
- The media itself goes in the request's arrays (`referenceImages`,
  `firstFrameImage`, `referenceVideos`, `referenceAudios`); the labels are how
  the prompt **refers to** those inputs, not a replacement for attaching them.
- Give every reference one job and say what to ignore: "Image 1 is the
  courier: face and jacket only; ignore the background. Image 2 is her bike."
- Recurring characters, locations, props and sets: attach the entity's
  reference sheet (Splice attaches it for an `@slug` mention). Never use a
  multi-panel sheet as a FIRST frame — compose a single frame from it first.
- Splice's `check_video_prompt` knows each route's labels and flags a wrong one.

### What each model ignores

- **Turbo and Max drop references.** To hold a face, logo or product, make a
  first-frame still with an image model (references attached) and animate it,
  or switch to `minimaxH3MaxReference` (references, but no first frame).
- **`aspectRatio` is text-to-video only** on the H3 family; with a first
  frame the output follows the image.
- **Gemini Omni has no duration input**: the prompt decides the length (up to
  about 10 s) and it bills as 10 s.
- **Model parameters go in `parameters`** on Splice's agent API and MCP
  tools (`duration`, `resolution`, `aspectRatio`, `firstFrameImage`,
  `promptExpansionMode` …); flat keys beside `prompt` are not forwarded.

### Which model, quickly

- The default, best adherence per credit, first and/or last frame →
  `minimaxH3MaxTurbo`. Draft at 480P/5 s, render the keeper at 768P.
- **References straight to the video model** (a face, a product, a camera
  plate, a voice) → `minimaxH3MaxReference`, or `minimaxH3` when you also need
  a first frame.
- **A longer single narrative** (up to 30 s) with dialogue, subject
  replacement or forward extension → `seedance25`. Its prompt is capped at
  about 2000 characters (Forge truncates past it), so keep it tight.
- **Continue an existing clip** → `minimaxH3MaxExtend`; the prompt says what
  happens next.
- Never assume one model's reference syntax works on another — re-label when
  you switch.

### Consistency across a production

- The same style line on every shot so the grade matches at the cut.
- The same reference sheet on every shot a character, place or prop is in.
- Bridges between shots: `firstFrameImage` = A's last frame,
  `lastFrameImage` = B's first frame, one path described between them.
- Generation is a global concurrency cap: submit shots one at a time and
  poll each to completion.

## The production look

A production can take its look from a moodboard (`get_production_look`; `extract_moodboard_look` builds it, `set_production_look` turns it on). While it is on, Splice adds it to image, video and shot generations itself, so do not paste it into your prompt:

- **Words, never hex.** A short suffix ("Look: deep teal and charcoal palette, with amber accents; low-key tungsten lighting; …") goes after your prompt. Palette colours are named; models read "teal shadows" well and some draw "#104e52" as text.
- **Per-model rules.** Models with a negative-prompt field get the look's avoid list there; others get a short "No x, no y." The suffix is shortened to fit a model's hard prompt cap (Seedance 2.5: 2000 characters; Kling 3: 2500 with the negative), or left out. Type notes are added only when the prompt asks for text.
- **Style references only where they are safe.** Image models that take reference images get up to 2 board images as style references, after every other reference and labelled as colour, light and texture only. Never when a character (or a hero take of people) is attached: consistency and face checks win. Video models get the words only, because they read references as subjects.
- **Free.** Nothing extra is charged at generation time. Results report `look_applied` (the board, the suffix, style references); `use_look: false` skips it for one generation.
- **Write for the look.** Describe the shot (subject, action, framing, camera); leave palette and grade to the look unless this shot breaks from it on purpose (then say so, e.g. "a single red neon sign against the teal").

## Model guides

Read one with `get_model_guide {model}` (any id in the row works) or the resource `splice://guides/models/<guide>`.

| Guide | Media | Model ids | Use it for |
|---|---|---|---|
| `aceStep` | audio | `fishaudioAceStep15`, `lucatacoMusicAceStep` | ACE-Step 1.5: our DEFAULT music model; tag-style prompts with optional lyrics, long tracks, instrumental beds. |
| `alibabaHappyHorse11` | video | `alibabaHappyHorse11` | HappyHorse 1.1: text-to-video, one-image animation, or up to 9 reference images in one prompt; 3-15 s, 720p/1080p. |
| `alibabaWan3` | video | `alibabaWan3`, `alibabaWan3Prime`, `wan22t2vFast` | Wan 3 (and Prime): text or first-frame video up to 30 s at up to 1080p, with a built-in prompt expander. Wan 2.2 Fast: cheap 480p drafts. |
| `bflFlux3` | video | `bflFlux3` | FLUX 3 video: text/image-to-video and video continuation, 5-20 s, 720p/1080p, with generated audio. |
| `byteplusSeedance15Pro` | video | `byteplusSeedance15Pro`, `bytedanceSeeddance1Pro`, `bytedanceSeeddance1Lite` | Seedance 1.x / 1.5 Pro: dependable text/image-to-video with clean cuts from simple prose; no references, no native dialogue on 1.x. |
| `elevenLabsMusic` | audio | `elevenLabsMusic` | ElevenLabs Music: prompt-described tracks that follow structure and mood; instrumental by default in Forge. |
| `flux` | image | `flux2Klien9b`, `flux11Pro`, `fluxKontextPro`, `bflFlux3Image` | FLUX (2 Klein is our DEFAULT image model; 1.1 Pro; Kontext and FLUX 3 Image for edits): strong prompt adherence, photoreal or stylized. |
| `geminiOmni` | video | `googleGeminiOmni11` | Gemini Omni 1.1: text, first/last-frame, reference-image or video-edit generation with native audio; the model picks the length (up to ~10 s); 360p draft to 4K. |
| `geminiTts` | audio | `googleGeminiFlashTts` | Gemini 3.1 Flash TTS: expressive speech with a separate style instruction, 30 voices, many languages, and inline delivery tags. |
| `googleLyra2` | audio | `googleLyra2` | Lyria 2: high-fidelity instrumental music from a text prompt, with a negative prompt. |
| `gptImage` | image | `openaiGtpImage1`, `openaiGptImage2` | GPT Image 1.5 and 2: precise instruction-following and the most reliable text rendering; good for layouts, posters, UI mock-ups and instruction edits. |
| `ideogram` | image | `ideogram45`, `ideogram45PreciseEdit` | Ideogram 4.5: text-to-image with strong typography (square only today). Ideogram 4.5 Precise Edit: targeted edits of one image, optionally inside a mask, guided by up to 4 reference images. |
| `imagen` | image | `googleImageGen4` | Imagen 4: photoreal product and portrait shots with clean short text. |
| `kling` | video | `kling16Pro`, `kling16Standard`, `kling2`, `kling21`, `kling21Master`, `kling26` | Older Kling generations (1.6-2.6): dependable image-to-video for animating a still hero shot; 2.6 adds native audio. |
| `klingO1` | video | `klingO1` | Kling O1: edit an existing clip or generate from reference images and a style/camera reference video. |
| `klingV3Video` | video | `klingV3Video`, `klingV3OmniVideo` | Kling V3: 3-15 s text/first-last-frame video with optional native audio and a structured multi-shot mode (up to 6 shots). |
| `lipSync` | video | `tmapppdevLipSync`, `klingLipSync`, `bytedanceLatentSync`, `minimaxH3MaxLipSync` | Lip sync: re-voice a video (tmappp, Kling, LatentSync) or animate a face image to an audio line (H3 Max lip-sync). No text prompt; the inputs decide the result. |
| `ltx23` | video | `ltx23Pro`, `ltx23Fast`, `lightricksLtx25Fast` | LTX 2.3 (Pro/Fast) and 2.5 Fast: high-resolution (1080p-4K) video with generated audio; Fast runs up to 20 s at 1080p. Follows camera-motion wording literally. |
| `lumaPhoton` | image | `lumaPhotonFlash` | Luma Photon Flash: fast stylish images with separate image, style and character reference slots. |
| `minimaxH3` | video | `minimaxH3` | Plain H3 on Replicate: the H3 that takes reference images, videos and audio in the same call as a first/last frame; 4-15 s, up to 2K. |
| `minimaxH3Max` | video | `minimaxH3Max` | H3 Max: same inputs and prompt layout as Turbo (text or first/last frame, 5-15 s) at about twice the price; references go to its reference-to-video sibling. |
| `minimaxH3MaxExtend` | video | `minimaxH3MaxExtend` | H3 Max extend-video: adds 5-15 s of new footage after a source clip (1.625-60 s). The prompt says what happens NEXT. |
| `minimaxH3MaxReference` | video | `minimaxH3MaxReference` | H3 Max reference-to-video: up to 9 images, 3 videos and 3 audio clips (12 files) passed straight to the video model, 5-15 s. No first or last frame. |
| `minimaxH3MaxTurbo` | video | `minimaxH3MaxTurbo` | Our DEFAULT video model: text-to-video or first/last-frame image-to-video, 5-15 s, native sound and dialogue, multi-shot inside one clip. |
| `minimaxHailuo` | video | `minimaxHailuo2`, `minimaxVideo1` | Older MiniMax video (Hailuo 02, Video-01): 6-10 s text/first-frame video with a built-in prompt optimizer; Video-01 takes one subject reference. |
| `minimaxImage` | image | `minimaxImage01` | MiniMax Image-01: text-to-image with a built-in prompt optimizer and one character reference; up to 9 images per call. |
| `minimaxMusic` | audio | `minimaxMusic25`, `minimaxMusic15`, `minimaxMusicCover` | MiniMax Music 2.5 (and 1.5, Cover): full songs with vocals from a style prompt plus structured lyrics; Cover restyles an existing song. |
| `motionControl` | video | `kling26MotionControl`, `kling3MotionControl`, `wan22AnimateReplace` | Motion transfer: a character image performs the motion of a reference video (Kling Motion Control), or replaces the person in a video (Wan 2.2 Animate Replace). |
| `nanoBanana` | image | `googleNanaBanana2`, `googleNanoBanana`, `googleNanaBananaPro`, `googleNanoBanana20`, `googleNanoBanana21` | Nano Banana (original; 2; 2.1; Pro): conversational editing and multi-image composition with strong identity hold. Default for character/location sheets, angles and wardrobe. |
| `qwen3tts` | audio | `qwen3tts` | Qwen3 TTS: preset speakers, a designed voice from a description, or voice cloning from a reference clip, with a plain-language style instruction. |
| `qwenImage` | image | `qwenQwenImage`, `alibabaQwenImage3` | Qwen Image (and 3): strong text rendering, including Chinese, and dense layouts; Qwen Image 3 also edits one input image. |
| `runwayGen45` | video | `runwayGen45`, `runwaymlGen4Turbo`, `runwaymlGen4Aleph` | Runway Gen-4.5 and Gen-4 Turbo: 5 or 10 s from text or a first frame, strong motion control in plain language. Gen-4 Aleph edits or restyles a clip. |
| `seedance25` | video | `seedance25` | Long multimodal narratives (up to 30 s) with native dialogue; reference-to-video, editing, subject replacement, forward extension. |
| `seedance2Fast` | video | `seedance2Fast` | Seedance 2.0 Fast: 4-15 s with native dialogue and references (up to 9 images, 3 videos, 3 audio). Splice's default for voiced shot-sheet takes. |
| `seedream` | image | `bytedanceSeedream5lite`, `byteplusSeedream5` | Seedream 5 (Lite): fast image generation and multi-reference editing, plus a sequential mode that returns a coherent set of images; used for entity sheets. |
| `sfx` | audio | `sepalAudioGenerate`, `zsxkibMmAudio` | Sound effects: AudioGen from text (1-10 s); MMAudio generates sound matched to a video or image. |
| `sora` | video | `openaiSora2` | Sora 2: coherent physical-world clips with sound. Restricted in our catalogue — only allow-listed accounts can run it. |
| `stableDiffusion` | image | `stableDiffusion35LargeTurbo` | Stable Diffusion 3.5 Large Turbo: fast text-to-image and image-to-image with a prompt strength control. |
| `talkingAvatar` | video | `klingAvatarV2`, `bytedanceOmniHuman` | Talking avatars: one image plus an audio track becomes a speaking, gesturing character (Kling Avatar V2 with an optional prompt; OmniHuman from image and audio alone). |
| `veo3` | video | `googleVeo3`, `googleVeo3Fast`, `googleVeo31Fast`, `veo31lite` | Veo 3 / 3.1 (Fast, Lite): short clips with native dialogue, ambience and effects; strong physics and lighting. |
| `zonos` | audio | `jaariZonos` | Zonos: our DEFAULT voice model; natural read-aloud with emotion controls and speaker cloning. |

## Other craft guides

**craft**

- `craft/captions`: On-screen captions and text that read at phone size — line length, timing, safe areas, burned-in vs soft subtitles.
- `craft/hook-writing`: Writing the first 1–3 seconds (the spoken line, the on-screen text and the first frame) so a scrolling viewer stays.
- `craft/motion-design`: The director's craft for motion graphics: personality, principles, choreography, quality gate.
- `craft/motion-personalities`: Six motion personalities, each with its easing family, duration, travel and stagger.
- `craft/motion-principles`: The animation principles that matter for 2D motion graphics, each with a smell test.
- `craft/motion-quality-checklist`: Seven red flags of amateur motion and how to fix each.
- `craft/motion-studio`: Motion compositions (HTML + GSAP rendered to MP4) in Splice: create, edit by ops, render, the HTML contract, pricing and determinism.
- `craft/pacing`: Timing words, shots and holds so a piece hits its length and keeps moving — words per second, shot lengths, reading time.
- `craft/shot-sheet`: Splice's shot-sheet flow: script to shot list, cinematic metadata, stills, then a video per shot.
- `craft/shot-variety`: Coverage and continuity for generated shots — shot sizes, lens and movement vocabulary, cutting between framings, keeping characters and places consistent.
- `craft/sound`: Voice, music, effects and loudness — casting a voice, ducking music under speech, loudness targets, and checking a render's measured audio.
- `craft/variant-design`: Designing the arms of a test: one controlled variable, a real control, and a change big enough to measure but small enough to attribute.
- `craft/video-motion`: Directing movement in generated video — the motion spine, camera language, timed beats, invariants you can see, text, long takes — with MiniMax H3 specifics.

**formats**

- `formats/explainer`: A narrated explainer with nobody on camera (45–120s) — the voiceover carries it, visuals and cards illustrate each point.
- `formats/general-video`: Any multi-scene video that fits no narrower format, and the plan → source → compose → assemble → ship spine every format shares.
- `formats/motion-graphics`: A short design-led clip that is pure Motion — a title card, logo sting, kinetic headline, stat reveal or animated lower-third (10s or less).
- `formats/music-video`: A 15–60s montage cut to a track — the music is the clock and every cut and accent lands on its beat grid.
- `formats/product-launch`: A 30–90s marketing video for a product, feature or site that ends in one clear call to action.
- `formats/remix`: Rebuilding a reference's structure with your own cast and lines — read its pacing and beats, keep the shape, change everything else.
- `formats/slideshow`: Points, a list or a deck turned into a paced run of slides (20–90s), each a Motion composition from one shared frame.

**tasks**

- `tasks/creative-guidelines`: Write creative guidelines a production can shoot to: one look line, palette, lens and light choices, tone, and do/don't rules that survive across shots.
- `tasks/music-lyrics`: Write lyrics and music briefs that music models can sing: section tags, short rhythmic lines, a repeated chorus, style kept out of the lyrics.
- `tasks/packaging-copy`: Write titles and descriptions for projects, episodes and templates: specific, promise-keeping, the key noun first, no hype words.
- `tasks/script-dialogue`: Write dialogue scripts and scenes that play on generated video: every line an action, subtext, short speakable lines, reaction shots.
- `tasks/shot-planning`: Turn story into shootable shots and video prompts: one visible action per shot, shot size + one move, consistent style line, model-ready prompts.
- `tasks/social-copy`: Write social posts, captions and platform metadata: hook in the first line, adapt per platform, few relevant hashtags, one call to action.
- `tasks/story-development`: Develop stories, synopses, loglines and treatments: a specific lead with a want, an active obstacle, rising stakes, and a turn — sized to short-form runtimes.
- `tasks/voiceover-narration`: Write voice-over and narration that reads well aloud: spoken rhythm, words sized to the time, delivery kept out of the text.
- `tasks/world-lore`: Build lore and character bios that generate stories and stay visually consistent: rules with costs, factions that want things, concrete visual tags.

**writing**

- `writing/character-design`: Designing leads and opponents who generate story — want, misbelief, secret, contradiction and voice — and a cast web where every relationship is a source of conflict.
- `writing/cliffhangers`: Suspense across an episode and a series — the opening hook, a knot every 20–30 seconds, a rotating menu of episode endings, and a ladder of questions under one series question.
- `writing/dialogue`: Dialogue as action — subtext, exposition used as ammunition, distinct voices, line length that fits a generated shot and lip-sync — plus the fixes for on-the-nose lines.
- `writing/example-micro-drama-script`: A worked 60-second micro-drama episode from beat outline to Markdown script, with its notes pass and how each line becomes a shot.
- `writing/genre-beats`: The beats each genre promises its audience — romance, revenge, thriller, mystery, horror, comedy, fantasy — and how to mix two or three without breaking the promise.
- `writing/premise-logline`: Turning a vague idea into a premise and a one-sentence logline that names who, what they want, what stands in the way and what it costs.
- `writing/scene-writing`: Writing a scene that turns — objective, obstacle, tactics, a value that flips — entered late, left early, and told in actions a video model can render.
- `writing/screenplay-format`: Writing scripts in Splice's Markdown screenplay format — scene headings, action, character cues, parentheticals, any language — laid out so the shot list can be built from them, with a Fountain mapping.
- `writing/screenwriting`: The writing stages from idea to shootable script — premise, series engine, cast, beat outline, scenes, script, notes — and which skill to load at each.
- `writing/script-notes`: A structured notes pass on a script or outline — story, character, scene, dialogue, series and producibility — with prioritised notes that name a problem and propose a fix, then one rewrite.
- `writing/series-engine`: Designing a series that keeps producing episodes — the engine sentence, the episode pattern, a cast web built for friction, season shape in movements, and adapting a source story into episodes.
- `writing/short-drama`: An episodic micro-drama with recurring characters — universe first, one-sentence shots, and each episode ending on a pull to the next.
- `writing/story-structure`: Beat structure scaled to runtime — hook, inciting incident, escalation, crisis, climax, button — for a 30s scene up to a 15-minute short, with a diagnostic for stories that sag.

**video-motion**

- `video-motion/motion-prompt`: Before any image-to-video or text-to-video prompt, on any model.
- `video-motion/minimax-h3`: Choosing between minimaxH3MaxTurbo, minimaxH3Max and minimaxH3, or setting their parameters.
- `video-motion/camera-language`: Writing the camera part of a video prompt, or a move keeps coming back wrong.
- `video-motion/timed-beats`: Any clip over ~6s, a one-take with several actions, or a motion-design film from a video model.
- `video-motion/text-in-video`: A generated clip needs words on screen, or kinetic type over footage.
- `video-motion/long-takes`: Longer than one generation, a clip that drifts late, or joining two generated clips.
- `video-motion/motion-graphics`: Building a Motion (HTML + GSAP) title, lower-third, kinetic type or overlay — after motion_design_brief.

Read them with `get_craft_guide {topic: "<id>"}` or `splice://guides/<id>`.
