# Bios

Biology you can see. A visual learning app for the cell: organelles, cell theory, the microscope and cell processes, with an interactive 3D cell, animated explanations and 16 task types built around spaced repetition.

This is the **open source build** of [Bios](https://bios.xtrslab.com). It runs entirely in the browser: no accounts, no server and no API keys built in. Progress is saved in `localStorage`.

AI features are **optional**: add your own OpenRouter, Anthropic or OpenAI key and they switch on. Without a key everything else works offline.

<p align="center">
  <img src="docs/home.png" width="280" alt="Home screen">
  &nbsp;&nbsp;
  <img src="docs/lesson.png" width="280" alt="Lesson with the labelled cell">
</p>

## Features

* **Interactive 3D cell** (Three.js): animal, plant and prokaryotic cells, cartoon style with outlines, cutaway and labels, tap an organelle to open its card
* **Animated explanations**: protein pathway, cellular respiration, photosynthesis, digestion in the cell, vacuole and turgor, cilia
* **16 task types**: multiple choice, true or false, type the term, identify the marked part, locate on the cell, odd one out, fix the mistake, cloze, ordering, zoom, explain in your own words and more
* **Daily training** with FSRS spaced repetition and a limit of new concepts per session
* **Lessons and notebook** that follow the source notes page by page
* **Tests with a grade** and a progress view with mastery per topic and per organelle
* **Bring your own AI key** (OpenRouter, Anthropic or OpenAI): grading of free explanations against the key points, an oral exam with an AI teacher, freshly generated and double checked tasks
* Light and dark mode, works on phone and desktop, installable PWA

## What is different from the hosted version

| Hosted version | Open source build |
|---|---|
| Login (Google, email code, password) and cloud progress | No accounts, progress stays in this browser |
| AI on the server, paid by the app | AI with your own key, called straight from your browser; without a key, explanations use self rating with key point hints |
| Server speech to text | OpenAI transcription with an OpenAI key, otherwise the browser's own speech recognition where available |
| Live Arena with real players | Not available (needs a realtime server) |

Server code, deployment scripts and infrastructure identifiers are not part of this repository.

## AI with your own key

Open **Progress → Settings → AI key**, pick a provider, paste your key and press **Test and save**.

<p align="center"><img src="docs/ai-key.png" width="280" alt="AI key settings"></p>

| Provider | Default model | Where to get a key |
|---|---|---|
| OpenRouter | `openai/gpt-6-luna` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| Anthropic | `claude-haiku-5-5` | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| OpenAI | `gpt-6-luna` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

You can type any other model ID your account has access to.

* The key is stored only in your browser (`localStorage`) and sent only to the provider you picked, directly from the browser. No server of mine ever sees it.
* Usage is billed to your own account with that provider.
* Anyone with access to the browser profile can read the key, so do not save it on a shared device. **Remove key** deletes it.
* Providers live in `src/engine/llm.ts`, prompts in `src/engine/ai.ts`. Every AI feature has an offline fallback.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static files in dist/
npm run check    # type check
```

Deploy `dist/` to any static host.

## Stack

React 19, TypeScript, Vite, Three.js, Motion, Lucide.

## License

MIT, see [LICENSE](LICENSE). Made by [Nik Bogataj](https://github.com/nikb12e) · [XTRSlab](https://xtrslab.com).
