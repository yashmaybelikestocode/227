# Cypher — Final Frontend

> Understand **WHY** code is the way it is, and **WHO** did **WHAT** and **WHEN**.

Cypher helps open-source maintainers and contributors understand the decisions and historical reasoning embedded across a GitHub repository.

For one repository, Cypher fetches pull requests, issues, comments, and commits in a read-only mode, splits discussions into discrete verifiable statements (each linked to an author, date, and GitHub comment ID), identifies real decisions, groups duplicate statements about the same idea, and explains in plain English what was decided, what was decided against, what was postponed, and what remains open. Every statement is traceable to the exact original comment with character-offset highlighting. File renames and moves are traced with a "Formerly at" trail, and contributor identities across commits, GitHub logins, and alternate handles are consolidated into single profiles.

---

## Features

- **Read-Only GitHub Extraction**: Fetches pull requests, issues, comments, and commits without altering anything on GitHub.
- **Verbatim Statement Traceability**: Splits discussions into discrete statements where every statement has an exact quote and opens the original comment with character-offset highlighting.
- **Left-Out Audit Trail**: Comments that cannot be quoted verbatim (e.g. simple emoji reactions, post-fetch edits) are excluded and counted so nothing is hidden.
- **Categorized Decisions**: Maps discussion consensus into four verified statuses: Decided, Decided against, Postponed, and Still open.
- **Later-Change Tracking**: Flags decisions modified or reversed in later pull requests.
- **Code Attachment & Rename Trails**: Attaches decisions to specific line ranges and traces file moves and renames across repository history.
- **Unified Contributor Identity**: Merges commit emails, GitHub usernames, and third-party handles into a single profile with an instantaneous "Not the same person?" split and undo capability.
- **Blind Benchmark Verification**: Verifies extraction accuracy against sealed maintainer benchmarks before revealing ground truth scores.
- **Markdown Export**: Exports Architectural Decision Records (MADR) directly in Markdown with verbatim statement citations.
- **Completely Offline**: Zero external network calls, CDNs, or AI API dependencies.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Commands

```bash
cd frontend-final

# Install dependencies
npm install

# Start development server
npm run dev

# Run Vitest test suite
npm test

# Build production bundle
npm run build
```

---

## Running With the Real Backend

By default the app uses the bundled sample data (`VITE_USE_MOCK=true`), so `npm run dev`, `npm test`
and `npm run build` work fully offline. To use the Cypher Python backend in `backend-code/` (which runs
Gemma 4, `gemma4:e2b`, locally through Ollama), use three terminals from the repository root:

```bash
# Terminal 1: the local model server
ollama serve

# Terminal 2: the Cypher backend on http://127.0.0.1:8000 (no install needed)
cd backend-code && PYTHONPATH=src python3 -m cypher.cli serve

# Terminal 3: this frontend, talking to the backend
cd frontend-final && VITE_USE_MOCK=false npm run dev
```

Then open http://localhost:5173 and press **Try a sample project**.

How it works:

- All backend calls live in [`src/api.ts`](src/api.ts). They use relative `/api/...` URLs; the Vite dev
  server proxies `/api` to `http://127.0.0.1:8000` (see [`vite.config.ts`](vite.config.ts)).
- `VITE_USE_MOCK` (see [`.env.example`](.env.example)): anything other than `false` uses sample data and
  makes no network calls. With `false`, every function calls the backend.
- Parts the backend has not built yet answer HTTP 404 or 501 (files, person details, split, undo-split).
  Only that one function then uses sample data and logs `using sample data for <function>` once in the
  browser console. Any other failure (backend not running, HTTP 500, unreadable data) shows the page's
  error state with a **Try again** button; it never silently shows sample data.
- The chip next to the project name in the page header shows **Live data** when the last data call used
  the backend and **Sample data** when it used sample data.
- The Import page polls `GET /api/imports/{id}/summary` every second until the import is done, then
  enables **See the decisions**. The first run on a project can take a few minutes because Gemma runs on
  this computer; answers are cached, so later runs are quick.
- The Blind test page seals Cypher's findings (`POST /api/analyses/{id}/blind/seal`) when it opens, and
  opens the maintainers' list (`POST /api/analyses/{id}/blind/reveal`) only when you press
  **Open the maintainers' list**.
- Pages without an analysis id in their address (People, Code, Blind test) use the most recent analysis
  started in this browser tab.

| Function | Backend endpoint |
| :--- | :--- |
| `listRecentRepos` | `GET /api/repos` |
| `startImport` | `POST /api/imports` (`{repo, question, range}`; sample projects send `{fixture}`) |
| `getImportSummary` | `GET /api/imports/{id}/summary` |
| `getAnalysis` | `GET /api/analyses/{id}` |
| `sealFindings` | `POST /api/analyses/{id}/blind/seal` |
| `getEvalResult` | `POST /api/analyses/{id}/blind/reveal` |
| `listFiles`, `getFileView` | `GET /api/analyses/{id}/files[/path]` (not built yet, sample data) |
| `getPerson` | `GET /api/analyses/{id}/people/{person}` (not built yet; uses the person from the backend's analysis) |
| `splitPerson`, `undoSplit` | `POST /api/analyses/{id}/people/{person}/split` / `undo-split` (not built yet, sample data) |

---

## Folder Structure

```
frontend-final/
├── index.html                 # HTML shell and metadata
├── package.json               # Dependencies and test script
├── tailwind.config.js         # Color theme (ivory, mint, accent, brick, amber)
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # App TypeScript build config
├── vite.config.ts             # Vite build, /api dev proxy & Vitest test config
├── .env.example               # VITE_USE_MOCK setting
└── src/
    ├── api.ts                 # API layer: backend calls or sample data (VITE_USE_MOCK)
    ├── index.css              # Typography, custom utilities, highlight styling
    ├── main.tsx               # Application entrypoint
    ├── App.tsx                # BrowserRouter and route definitions
    ├── types.ts               # Complete TypeScript data model
    ├── context/
    │   └── CommentPanelContext.tsx # Context provider for original comment drawer
    ├── components/
    │   ├── Common.tsx         # Skeleton, EmptyState, ErrorState
    │   ├── DataSourceChip.tsx # "Live data" / "Sample data" chip in the page header
    │   ├── DecisionRow.tsx    # Decision display row with status and chips
    │   ├── EffectPill.tsx     # Adjusted later / Undone later badges
    │   ├── GroupedStatements.tsx # Expandable duplicate statement group
    │   ├── Layout.tsx         # Responsive container with Sidebar and PageHeader
    │   ├── OriginalCommentPanel.tsx # 380px slide-over with offset <mark> highlights
    │   ├── PageHeader.tsx     # 56px sticky top bar with project chip
    │   ├── PersonComponents.tsx # Contributor rows, identity pills, avatar initials
    │   ├── RenameTrail.tsx    # "Formerly at" horizontal chain chips
    │   ├── ScoreCard.tsx      # Blind benchmark accuracy and precision card
    │   ├── Sidebar.tsx        # Navigation sidebar with active page indicators
    │   ├── SourceChip.tsx     # Verbatim citation chip (<name>, <day> <month>)
    │   ├── StatusPill.tsx     # Decision status badge with icons
    │   ├── ThreadNote.tsx     # Code viewer contextual decision notes
    │   └── Timeline.tsx       # Vertical chronological evolution across PRs
    ├── mock/
    │   └── data.ts            # Realistic mock data (comments, statements, people)
    ├── pages/
    │   ├── StartPage.tsx      # Repository selection and question input
    │   ├── ImportPage.tsx     # Step-by-step progress and count checklist
    │   ├── DecisionsPage.tsx  # Main decision overview and timeline
    │   ├── StatementsPage.tsx # Used and Left-out statements table
    │   ├── CodePage.tsx       # Code viewer with line annotations and rename trail
    │   ├── PeoplePage.tsx     # Contributor directory with merged identities
    │   ├── PersonDetailPage.tsx # Contributor profile with split and undo
    │   ├── EvaluatePage.tsx   # Blind benchmark comparison
    │   └── HelpPage.tsx       # Plain language documentation and label guide
    ├── test/
    │   ├── setup.ts           # Vitest DOM matchers setup
    │   └── cypher.test.tsx    # Comprehensive test suite covering all 15 scenarios
    └── utils/
        └── madr.ts            # MADR markdown generator and file downloader
```

---

## Data Types Summary

| Type | Description |
| :--- | :--- |
| `Person` | Consolidated contributor entity with merged `identities` (commit email, GitHub login, other handle). |
| `Comment` | Verbatim text from PRs, issues, or commits with date, location, and GitHub comment ID. |
| `Statement` | Exact quote extracted from a comment with start and end character offsets. |
| `LeftOut` | Comment excluded from analysis with a plain-English explanation. |
| `Claim` | A verified plain-English sentence backed by one or more `statement_ids`. |
| `Decision` | Consensus outcome with status (`accepted`, `rejected`, `deferred`, `unresolved`), reason, and later changes. |
| `LaterChange` | Evolution of a decision in a later PR with effect (`modified` or `reversed`). |
| `RenameStep` | History step of a file move or rename with commit hash, date, and PR number. |
| `CodeThread` | Association between a line range in code and the decisions explaining it. |
| `FileView` | Source file representation with code lines, threads, and `formerly` rename trail. |
| `EvalResult` | Blind benchmark baseline comparison containing accuracy and precision metrics. |

---

## Label Mapping Table

Meaning is always conveyed with **both an icon and text**, never color alone:

| Data Value | UI Label | Icon | Style | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| `accepted` | **Decided** | Check mark (`✓`) | Green-teal pill (`#0D5B46`), white text | What the team agreed to do. |
| `rejected` | **Decided against** | Cross (`✕`) | Brick pill (`#9B3224`), white text | What the team deliberated and rejected. |
| `deferred` | **Postponed** | Clock (`⏱`) | Amber pill (`#D8931A`), dark brown text | An idea delayed for future need or scale. |
| `unresolved` | **Still open** | Question mark (`?`) | Gray-green pill (`#D8DFD5`), muted text | Unresolved topic without consensus yet. |
| `modified` | **Adjusted later** | Arrow/Refresh | Amber badge | Parameters or boundaries changed in a subsequent PR. |
| `reversed` | **Undone later** | Undo arrow | Brick badge | An earlier decision was undone or retired in a later PR. |
