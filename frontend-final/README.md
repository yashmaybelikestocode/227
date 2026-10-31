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

## Switching From Mock Data to Real Backend

All backend interactions are abstracted behind a single interface in [`src/api.ts`](file:///Users/yash/frontend-final/src/api.ts).

To switch to a live Python backend running on `/api/*`:

1. Open [`src/api.ts`](file:///Users/yash/frontend-final/src/api.ts).
2. Set the `USE_MOCK` boolean flag to `false`:
   ```ts
   export const USE_MOCK = false;
   ```
3. When `USE_MOCK = false`, all async functions make standard `fetch('/api/...')` calls against the REST endpoints. When `USE_MOCK = true`, the application serves realistic mock data with simulated 300–600ms network latency (0ms in test environments).

---

## Folder Structure

```
frontend-final/
├── index.html                 # HTML shell and metadata
├── package.json               # Dependencies and test script
├── tailwind.config.js         # Color theme (ivory, mint, accent, brick, amber)
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # App TypeScript build config
├── vite.config.ts             # Vite build & Vitest test config
└── src/
    ├── api.ts                 # API abstraction layer with USE_MOCK flag
    ├── index.css              # Typography, custom utilities, highlight styling
    ├── main.tsx               # Application entrypoint
    ├── App.tsx                # BrowserRouter and route definitions
    ├── types.ts               # Complete TypeScript data model
    ├── context/
    │   └── CommentPanelContext.tsx # Context provider for original comment drawer
    ├── components/
    │   ├── Common.tsx         # Skeleton, EmptyState, ErrorState
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
