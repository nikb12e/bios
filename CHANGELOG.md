# Changelog

All notable changes to Bios. The hosted app lives at [bios.xtrslab.com](https://bios.xtrslab.com); this repository is the open source build (browser only, English, AI with your own key). Items marked *hosted app* need a server and are not part of this build.

## 7.1 · 22 November 2026

**Added**
* Version history in the app (Progress → Version history) and a card on the home screen with what is new after each update.
* This open source build updated to 7.0 and 7.1, fully in English.

**Fixed**
* Practice went blank for a new user with no saved mistakes (an endless re-render caused by a new empty object on every read of the mistake notebook). Fixed here on 20 November, now also in the hosted app.
* Long lesson titles no longer run into the back button in the top bar.
* The summary ring said "pravilno" instead of "correct".

## 7.0 · 22 November 2026

**Added**
* **Difficulty from 1 to 5** for every task and a **knowledge level from 1 to 5** for every concept (Rasch model and Elo, see `src/engine/adapt.ts`). The difficulty is shown on every task; after each answer you see how your level for the concept changed.
* **I don't know** button (key N): counts as a mistake, shows the answer and opens an explanation.
* **Explanations only when you struggle.** The "Let's explain" card appears when you say I don't know, miss the same concept twice in a session, miss a concept you are still learning, miss an easy task, or when your recent answers go badly. It shows your answer next to the correct one, an animation, a personal AI explanation (with your key, cached in the browser; otherwise the explanation from the notes) and a Listen button.
* **Learning from mistakes:** Check your understanding (two tasks after an explanation), Another way (the same concept in a different format, never the same task) and a Review round at the end of a session.
* **Testing first:** new concepts are tested right away, known ones only now and then with a harder task, so most of the time goes to what you do not know yet. The same task does not come back for at least 20 hours.
* **388 AI written tasks** (`src/data/aibank.json`), each kept only when a second, independent model call gave the same answer. About half of a session comes from them, half from the hand written bank.
* **New material:** introduction to biology, science and research, transport across membranes, lab work and a larger microscope topic: 51 concepts, 103 hand written tasks, lessons for every topic.
* **Seven animations** (`src/art/Explainers.tsx`): osmosis in three solutions for a plant and an animal cell, passive and active transport, the inverted microscope image, working out cell size, depth of field, objectives, the steps of research.
* **Sound engine** (`src/ui/sfx.ts`): a bell that climbs with a streak of correct answers, a soft sound for mistakes, a friendly one for I don't know, a warm chord for explanations, a closing sound that depends on how the session went.
* **Voice for explanations:** OpenAI (`gpt-4o-mini-tts`) or OpenRouter (ElevenLabs) with your key, otherwise the browser's own speech synthesis. A Read explanations aloud switch in Settings.
* Knowledge level per topic in Progress; the session summary shows average difficulty, the hardest task solved, I don't know count and how each concept's level changed.

**Fixed**
* A session can no longer grow without limit: at most half again as many tasks and five explanations.
* A new user no longer gets a free explanation task (difficulty 4.6) as the very first task.
* Odd one out no longer shows a double full stop and a repeated explanation; true or false shows the whole statement.

**Hosted app only:** a shared task bank on the server with difficulty calibrated from everyone's answers, new tasks written by the server as you practise, a natural Slovenian voice.

## 6.1 · 20 November 2026

* Every answer is saved right away; an unfinished session can be resumed at the same task.
* The close button during a session shows your statistics so far.
* Coloured bands at the top of the screens fade into the background.
* **First open source build:** English interface, explanations and code comments, no server, AI with your own OpenRouter, Anthropic or OpenAI key.

## 6.0 · 19 November 2026

* Six animated explanations in the 3D cell: protein pathway, cellular respiration, photosynthesis, digestion in the cell, turgor, cilia.
* A mistake notebook and a glossary of 71 terms.
* Sign in with an email code (*hosted app*).
* Fixed: sheets under the tab bar, the width of a code field, the welcome notice covering the cell tools.

## 5.0 to 5.2 · 19 November 2026

* Live Arena with quick games, private rooms, AI questions, rating and leaderboard, opponents that react (*hosted app*).
* Fixed: on iPhone (Safari) the Next button did not appear after Check.

## 4 · 18 November 2026

* The Živa design language, a 3D and an improved 2D prokaryotic cell, animated explanations in lessons.

## 3 · 18 November 2026

* iPhone first redesign in the style of iOS 26: four tabs, a Duolingo style practice session, lessons that slide in; all 16 task types adapted to the phone.

## 2 · 18 November 2026

* Accounts and progress in the cloud (*hosted app*).

## 1 · 18 November 2026

* First version: a 3D cell, tasks from the notes, FSRS spaced repetition, AI grading of explanations and an oral exam.
