/* Bios version history: what was new and what was fixed. Newest first.
   The same history (in Slovenian) is in the hosted app, and in English on xtrslab.com. */
export interface Version {
  v: string
  date: string // ISO date
  title: string
  sub: string
  added: string[]
  fixed?: string[]
}

export const CURRENT = '7.1'

export const VERSIONS: Version[] = [
  {
    v: '7.1', date: '2026-11-22', title: 'Version history', sub: 'Every update in one place, and a fix for Practice',
    added: [
      'Version history in the app (Progress) and a card with what is new after each update.',
      'Open source build updated to 7.0 and 7.1, fully in English.',
    ],
    fixed: [
      'Practice went blank for a new user with no mistakes saved yet. A new empty object on every read of the notebook caused an endless re-render. (Fixed in the open source build on 20 November, now also in the hosted app.)',
      'Long lesson titles no longer run into the back button in the top bar.',
    ],
  },
  {
    v: '7.0', date: '2026-11-22', title: 'Adaptive learning', sub: 'Difficulty 1 to 5, I don\'t know, explanations when you struggle, new material',
    added: [
      'Every task has a difficulty from 1 to 5 and every concept a knowledge level from 1 to 5 (Rasch model and Elo), shown during practice and in the summary.',
      'An I don\'t know button (key N) that shows the answer and opens an explanation.',
      'Explanations only when you struggle: an animation, your answer next to the correct one, a personal AI explanation and a voice.',
      'Learning from mistakes: Another way, Check your understanding and a Review round at the end of a session.',
      'Testing first: the app finds out what you already know and spends more time on what you do not.',
      'A bank of 388 AI written tasks, each checked by a second, independent model call.',
      'New material: introduction to biology, science and research, transport across membranes, lab work and a larger microscope topic (51 concepts, 103 hand written tasks).',
      'Seven new animations: osmosis, membrane transport, the inverted image, cell size, depth of field, objectives, the steps of research.',
      'A new sound engine, a Read explanations aloud switch and a knowledge level per topic in Progress.',
    ],
    fixed: [
      'A session no longer grows without limit: at most half again as many tasks and five explanations.',
      'A new user no longer gets a free explanation task of difficulty 4.6 as the very first task.',
      'Odd one out no longer shows a double full stop and a repeated explanation; true or false shows the whole statement.',
    ],
  },
  {
    v: '6.1', date: '2026-11-20', title: 'Nothing gets lost', sub: 'Saving as you go, resuming a session, open source',
    added: [
      'Every answer is saved on the device right away and in the cloud within 1.2 s (hosted app).',
      'An unfinished session can be resumed at the same task, even after a reload.',
      'The close button during a session shows your statistics so far.',
      'The coloured bands at the top of the screens fade softly into the background.',
      'Open source build on GitHub: in English, runs in the browser, AI with your own OpenRouter, Anthropic or OpenAI key.',
    ],
  },
  {
    v: '6.0', date: '2026-11-19', title: 'Explanations in 3D', sub: 'Six animated processes, a mistake notebook, a glossary',
    added: [
      'Six animated explanations in the 3D cell: protein pathway, cellular respiration, photosynthesis, digestion in the cell, turgor, cilia.',
      'A mistake notebook with practice of only your mistakes, and a glossary of 71 terms.',
      'Sign in with a code sent by email (hosted app).',
      'Deep links into the cell and notices that dismiss themselves.',
    ],
    fixed: [
      'Sheets (for example the topic picker) sat under the tab bar; they now open above it.',
      'The third code field had the wrong width.',
      'The welcome notice covered the tools in the cell view.',
    ],
  },
  {
    v: '5.2', date: '2026-11-19', title: 'A livelier Arena', sub: 'Opponents react, a longer lobby (hosted app)',
    added: ['Opponents react during the game.', 'The quick game lobby lasts about 20 s so friends can join.'],
  },
  {
    v: '5.1', date: '2026-11-19', title: 'Opponents like in English Lab', sub: 'The same computer opponents (hosted app)',
    added: ['Computer opponents in the Arena behave exactly as in English Lab.'],
  },
  {
    v: '5.0', date: '2026-11-19', title: 'Live Arena', sub: 'Real time competition (hosted app)',
    added: ['Quick games and private rooms with a code.', 'AI questions written and rated by a model, a rating and a leaderboard.'],
    fixed: ['On iPhone (Safari) the Next button did not appear after Check.'],
  },
  {
    v: '4', date: '2026-11-18', title: 'The Živa design language', sub: 'A new look and a better prokaryotic cell',
    added: ['Bios\' own design language, Živa.', 'A 3D and an improved 2D prokaryotic cell.', 'Animated explanations in the lessons.'],
  },
  {
    v: '3', date: '2026-11-18', title: 'iPhone first', sub: 'A redesign in the style of iOS 26',
    added: ['Four tabs, a practice session in the style of Duolingo, lessons that slide in.', 'All 16 task types adapted to the phone.'],
  },
  {
    v: '2', date: '2026-11-18', title: 'Accounts', sub: 'Sign in and progress in the cloud (hosted app)',
    added: ['Sign in with Google or with email and a password.', 'Progress in the cloud, merged across devices.'],
  },
  {
    v: '1', date: '2026-11-18', title: 'First version', sub: 'A cell you can cut open',
    added: ['A 3D cell, tasks from the notes on the cell, FSRS spaced repetition, AI grading of explanations and an oral exam.'],
  },
]

export const fmtDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
