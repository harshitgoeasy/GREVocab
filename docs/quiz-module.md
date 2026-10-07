# Quiz Module Guide

This document records the quiz architecture, module responsibilities, behavior contracts, decisions, and implementation progress. Update it when a module boundary, public contract, or user-visible behavior changes.

## Feature Flow

1. The learner chooses one or more groups manually, or chooses `ALL` to use every group as the source pool.
2. The learner chooses 5, 10, 15, 30, or a custom number of questions and a per-question timer of 8, 10, 15, 20, 30 seconds, or a custom duration.
3. The backend samples distinct vocabulary words from the selected pool and builds five-choice sentence-completion questions.
4. The frontend times each question, records the outcome, reveals the answer, and advances through the round.
5. The final analysis shows score, accuracy, outcomes, group results, and words to revisit.

## Module Responsibilities

### Backend

- `backend/app/main.py` owns HTTP routes, request validation, status codes, and group-list endpoints. `POST /api/quiz` accepts `group_ids` and `question_count` and returns a quiz payload.
- `backend/app/quiz.py` owns quiz-pool selection, distinct word sampling, prompt construction, and five-choice generation. Route handlers should delegate domain behavior here rather than accumulate quiz rules in `main.py`.
- `backend/app/data.py` loads and normalizes source vocabulary. Keep source parsing and normalization separate from quiz generation.
- `backend/scripts/extract_vocab_pdf.py` extracts source entries and joins wrapped definition/example lines. It separates multiple examples for one word with ` | ` so quiz generation can choose among them.
- `backend/data/vocab_groups.json` is the extracted vocabulary source. It contains 959 entries and 958 distinct words; 955 entries currently have at least one complete example sentence with a matching base or regular inflected form.

### Frontend

- `frontend/src/App.jsx` owns application navigation, API calls, and integration with existing cumulative local progress and streak state. Keep quiz-specific rendering and state transitions in the quiz modules.
- `frontend/src/quiz/QuizSetup.jsx` owns manual group selection, `ALL` pool selection, question-count presets/custom input, timer presets/custom input, and client-side validation.
- `frontend/src/quiz/useQuizSession.js` owns the active question index, timer, reveal delay, session outcomes, skip/advance behavior, and completion state. Timer effects must be cleaned up when a question changes or the quiz exits.
- `frontend/src/quiz/VocabularyQuestion.jsx` renders one prompt and its choices, exposes the answer/skip actions, shows feedback, and fires `canvas-confetti` once for an accepted correct answer.
- `frontend/src/quiz/ConfirmQuitDialog.jsx` confirms intentional exit from an active round. Continuing closes the dialog without pausing the timer; quitting stops the round and returns to the dashboard.
- `frontend/src/quiz/QuizSummary.jsx` derives session metrics and the review list from the session outcome records. It does not own or mutate cumulative local progress.
- `frontend/src/quiz/quiz.css` contains isolated responsive quiz styling and reduced-motion behavior.
- `frontend/package.json` declares frontend dependencies, including `canvas-confetti`.

The welcome dashboard is rendered by `renderWelcomeBoard` in `App.jsx`. Its styles are scoped under `.welcome-board` in `App.css`: the masthead owns the primary quiz action, the stat/summary strips show progress, the focus panel shows the selected group, and the group board supports browsing. Keep these dashboard styles separate from reader and quiz component styles.

The application footer is hidden during quiz setup and active quiz/result views, and remains available on the main dashboard and study screens.

## API Contract

Request:

```json
{
  "group_ids": [1, 2],
  "question_count": 5
}
```

Response shape:

```json
{
  "question_count": 5,
  "available_count": 58,
  "questions": [
    {
      "id": "1:Abound",
      "group_id": 1,
      "group_name": "Group 1",
      "word": "Abound",
      "part_of_speech": ["verb"],
      "prompt": "Wildfires ________ in the lush green.",
      "prompt_type": "example",
      "definition": "be present in large quantities",
      "correct_answer": "Abound",
      "choices": ["Abound", "Belie", "Candid", "Daunting", "Eloquent"]
    }
  ]
}
```

Unknown groups, empty pools, and question counts outside the selected pool return a client error. Consumers should use `available_count` as the authoritative pool size.

## Session Outcomes

Each answered question produces one session record with its question/group identifiers, correct word, selected word, and one outcome: `correct`, `incorrect`, `skipped`, or `timed_out`.

- Correct answers add one point and increment the existing per-group score/attempt totals.
- Incorrect answers increment attempts but not score.
- Skips and timeouts are separate analysis outcomes, do not earn points, and reveal the correct word for five seconds before advancing.
- Accuracy is `correct / (correct + incorrect)`; skipped and timed-out questions are displayed separately.
- Session analysis is in-memory for the current round. Existing cumulative group progress remains in localStorage.

## Decisions and Data Limits

- `ALL` means all groups are eligible for sampling; quiz length is the learner-selected count. It does not mean a fixed 100-question quiz.
- Sampling is random and does not claim to prioritize the most frequently tested GRE words. No verified frequency ranking is present in the current dataset.
- The parser joins PDF line wraps and separates example sentences by sense. The quiz builder selects a complete example containing the headword or a supported regular inflection, then blanks that form and inflects distractors to match. If no source example can be safely used, it falls back to a definition clue. Re-run `backend/scripts/extract_vocab_pdf.py` after parser changes to regenerate the dataset.
- Prompt selection is randomized among matching source examples, so repeated quizzes can use different contexts for words with multiple examples.
- Group 1 currently has 29 distinct words, so a 30-question request for only that group is rejected with the actual available count.

## Verification

From `backend/`:

```sh
.venv/bin/python -m unittest discover -s tests
```

From `frontend/`:

```sh
npm run lint
npm run build
```

The backend tests cover distinct sampling, five unique choices, prompt fallback, and API validation. Lint currently reports unrelated existing warnings in `App.jsx` and `VocabularyReader.jsx`; update this note if those warnings change.

## Implementation Log

### 2026-10-06

- Added a backend quiz builder and `POST /api/quiz` for sampling and cloze-style question payloads.
- Fixed PDF parsing to join wrapped definition and example lines, separated multiple examples by sense, and regenerated the 959-entry vocabulary data; complete target contexts increased from 42 to 955.
- Updated quiz prompts to select matching source sentences, handle common regular inflections, and match distractor part of speech/form where the pool allows.
- Added setup, session, question, and summary frontend modules; connected them through `App.jsx`.
- Added configurable per-question timing, skip/timeout answer reveal, outcome analysis, and correct-answer confetti.
- Hid the footer during quiz setup/play and added an accessible quit confirmation. The timer continues while the dialog is open; Escape and Continue dismiss it, while Quit stops the round.
- Fixed Quit navigation by exposing `stop()` from `useQuizSession.js`; the quit handler now clears the session and returns to the dashboard.
- Refreshed the dashboard with a clear masthead action, consistent green/amber tokens, deeper but restrained card depth, focus states, and responsive group/stat layouts; removed the duplicate quiz launch card.
- Added backend regression tests and frontend confetti dependency.
- Verification: backend quiz tests passed; frontend lint and production build passed. Existing lint warnings remain in `App.jsx` and `VocabularyReader.jsx`; production dependency audit is clean.