# Cypher Frontend

Cypher helps open-source maintainers and contributors understand **why** code is the way it is. For a GitHub project, it explores discussions across pull requests and issues, then explains in plain English: what was decided, what was decided against, what was postponed, who took part, when, and whether a later change adjusted or undid the decision. Every statement is traceable to the exact original comment.

Cypher is completely read-only and never posts or modifies anything on GitHub. It operates fully offline with no external network calls, no analytics, no CDNs, and no remote AI APIs.

---

## Getting Started

### Prerequisites

- Node.js (v18+ or v20+)
- npm

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:5173` to explore the Cypher application.

### Running Tests

```bash
npm test
```

Runs the test suite using Vitest and Testing Library.

### Production Build

```bash
npm run build
```

Performs TypeScript type checking (`tsc -b`) and generates production assets in `frontend/dist/`.

---

## Switching Between Mock Data and Real Backend API

All API communication is centralized in `src/api.ts`.

To switch from mock data to real backend endpoints:

1. Open `src/api.ts`.
2. Find the configuration constant:
   ```typescript
   export const USE_MOCK = true;
   ```
3. Change it to:
   ```typescript
   export const USE_MOCK = false;
   ```

When `USE_MOCK = false`, all calls fetch directly from `/api/...` endpoints (`/api/repos`, `/api/search`, `/api/answer/:id`, `/api/files`, `/api/file`, `/api/pulls`, `/api/pull/:number`, `/api/check`, `/api/evaluate`). In mock mode, calls simulate a short delay (300–800 ms) to demonstrate realistic loading and skeleton states.

---

## Label Mapping

Every data label maps to a clear, friendly, and accessible UI label with an icon and text (never color alone):

| Data Value | Category | UI Label | Visual Styling & Icon |
| :--- | :--- | :--- | :--- |
| `accepted` | Decision status | **Decided** | Navy pill (`#1A2F5C`) with white text, check mark icon |
| `rejected` | Decision status | **Decided against** | Rose pill (`#A8325A`) with white text, cross icon |
| `deferred` | Decision status | **Postponed** | Blush pill (`#F7D3DB`) with dark text (`#5B1F33`), clock icon |
| `unresolved` | Decision status | **Still open** | Neutral cool-gray pill (`#E8ECF3`) with muted text (`#55607A`), question mark icon |
| `modified` | Later-change effect | **Adjusted later** | Blush pill (`#F7D3DB`) with dark text (`#5B1F33`), pencil/edit icon |
| `reversed` | Later-change effect | **Undone later** | Rose pill (`#A8325A`) with white text, undo icon |
| `unrelated` | Later-change effect | **Not related** | Neutral cool-gray pill (`#E8ECF3`) with muted text (`#55607A`), slash icon |
| `unclear` | Later-change effect | **Unclear** | Neutral cool-gray pill (`#E8ECF3`) with muted text (`#55607A`), question mark icon |
| `high` | Confidence level | **Well supported** | Navy bold text |
| `medium` | Confidence level | **Partly supported** | Navy text |
| `low` | Confidence level | **Weakly supported** | Muted text |

### Source Buttons & Evidence Citation

Evidence is presented as a **Source Button** formatted as `<Author First Name>, <Day> <Month>` (for example, `Priya, 14 Mar`). Clicking a source button slides in the "Original Comment" side panel from the right. The exact cited sentence is highlighted in blush-deep (`#EDB8C4` at 65% opacity) with a 3px navy border on the left, driven directly by sentence IDs in the data.

---

## Folder Structure

```
frontend/
├── index.html                   # HTML entry point with Cypher branding and favicon
├── package.json                 # Project dependencies and npm scripts
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Design system tokens and palette
├── tsconfig.json                # TypeScript root configuration
├── tsconfig.app.json            # TypeScript app build configuration
├── vite.config.ts               # Vite & Vitest configuration
├── public/                      # Static assets (logo.png, etc.)
└── src/
    ├── __tests__/               # Vitest + Testing Library test suites
    │   ├── CheckPage.test.tsx
    │   ├── CodeView.test.tsx
    │   ├── DecisionRecord.test.ts
    │   ├── ResultsFilter.test.tsx
    │   ├── SourceButtonAndPanel.test.tsx
    │   ├── StartPage.test.tsx
    │   └── StatusPill.test.tsx
    ├── api.ts                   # Centralized API layer with USE_MOCK flag
    ├── types.ts                 # TypeScript data contracts and models
    ├── main.tsx                 # React entry point
    ├── App.tsx                  # App routing and shell layout
    ├── index.css                # Tailwind directives and CSS variables
    ├── setupTests.ts            # Vitest testing library configuration
    ├── components/              # Modular, reusable UI components
    │   ├── DecisionRow.tsx      # Fixed 150px status column + approach + why + sources
    │   ├── EffectPill.tsx       # Later effect badge (Adjusted later, Undone later, etc.)
    │   ├── EmptyState.tsx       # Friendly empty state display
    │   ├── ErrorState.tsx       # Error state display with retry trigger
    │   ├── OriginalCommentPanel.tsx # Slide-in drawer with highlighted evidence
    │   ├── PersonCard.tsx       # Participant avatar, name, and comment role
    │   ├── Skeleton.tsx         # Skeleton loading rows in blush-soft
    │   ├── SourceButton.tsx     # Evidence citation button (<Name, Date>)
    │   ├── StatusPill.tsx       # Decided, Decided against, Postponed, Still open
    │   ├── Timeline.tsx         # Vertical history timeline
    │   └── TopBar.tsx           # 64px white header with navigation and brand
    ├── context/
    │   └── OriginalCommentContext.tsx # Context for slide-in evidence panel
    ├── mock/
    │   └── data.ts              # Realistic mock repositories, discussions, and code
    ├── pages/
    │   ├── AnswerPage.tsx       # Main explanation output (/answer/:id)
    │   ├── CheckPage.tsx        # Pre-PR idea verification (/check)
    │   ├── CodePage.tsx         # Code view and file decision history (/code)
    │   ├── EvaluatePage.tsx     # Blind benchmark test (/evaluate)
    │   ├── HelpPage.tsx         # Guide and label explanation (/help)
    │   ├── PullDetailPage.tsx   # Pull request overview (/pull/:number)
    │   ├── PullsListPage.tsx    # Pull requests directory (/pulls)
    │   ├── ResultsPage.tsx      # Keyword search discussions (/results)
    │   └── StartPage.tsx        # Project & keyword search start (/ )
    └── utils/
        ├── downloadDecisionRecord.ts # MADR Markdown decision record generator
        └── sourceLabel.ts       # Source button label and metadata extraction
```

---

## Design System & Accessibility

- **Color Palette**: Midnight blue (`#12203F`), navy (`#1A2F5C`), blush pink (`#FBE4E9`), blush-deep (`#EDB8C4`), rose (`#A8325A`), mist (`#F3F6FB`), and crisp white (`#FFFFFF`).
- **Typography**: Editorial serif headings in Georgia (fallback Times New Roman) and clean system UI typography for body content; monospace restricted to code, file paths, and PR numbers.
- **Accessibility**: Keyboard navigable (Escape closes the drawer and restores focus, visible `focus-visible` rings on all interactive elements, WCAG AA contrast compliant pairs, ARIA landmarks, dialog roles, and screen-reader labels).
