# Cypher Frontend v2

Cypher helps open-source maintainers and contributors understand **WHY** code is the way it is, and **WHO** did **WHAT** and **WHEN**. For a GitHub project, it finds the discussions in pull requests and issues and the related commits and comments, then explains in plain English: what was decided, what was decided against, what was postponed, who took part, when, and whether a later change adjusted or undid the decision. Every statement is traceable to the exact original comment down to the sentence. Cypher is strictly read-only and never posts or alters anything on GitHub.

---

## How this version differs from frontend/

Frontend v2 is a complete alternative client designed around continuous exploration and workflow efficiency:
- **Fixed Left Sidebar Navigation (248px)**: Collapses behind an accessible overlay menu below 1100px.
- **Dedicated Activity Timeline (`/activity`)**: Daily grouped feed of commits, issue comments, pull request comments, and code reviews with live plain-words summary sentence calculation.
- **People Directory and Profiles (`/people`, `/people/:name`)**: Overview table of contributors, their proposed decisions, arguments against ideas, and personal activity logs.
- **Hot Spots View (`/hotspots`)**: Interactive sortable table highlighting files where teams argued, adjusted, or reversed decisions the most, with CSS proportion bars.
- **Code View with Thread Notes (`/code`, `/code/*path`)**: Monospace code viewer with a mint-soft gutter, tinted discussion lines, folded undone notes, and an instant toggle to isolate discussion lines.
- **Saved Answers (`/saved`)**: Client-side offline bookmarks stored securely in `localStorage`.
- **Easy / Detailed Reading Switch**: Switch between concise decision overviews and detailed consensus stance histories with verbatim source quotes.
- **Clean Print View**: Dedicated print stylesheet that strips navigation, controls, and colors for crisp black-and-white reports.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
cd frontend-v2
npm install
```

### Development Server
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

---

## Folder Structure

```
frontend-v2/
├── public/                 # Static assets (favicons, icons)
├── src/
│   ├── __tests__/          # Vitest & Testing Library test suite (15 tests)
│   ├── components/         # Reusable design system components
│   │   ├── ActivityRow.tsx
│   │   ├── BarCell.tsx
│   │   ├── DecisionRow.tsx
│   │   ├── EffectPill.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── Layout.tsx
│   │   ├── OriginalCommentPanel.tsx
│   │   ├── PageHeader.tsx
│   │   ├── PersonCard.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Skeleton.tsx
│   │   ├── SourceButton.tsx
│   │   ├── StatusPill.tsx
│   │   ├── ThreadNote.tsx
│   │   └── Timeline.tsx
│   ├── context/            # React contexts (CommentPanelContext)
│   ├── mock/               # Mock data fixtures (answers, posts, activity, hotspots, pulls)
│   ├── pages/              # Application route pages
│   │   ├── ActivityPage.tsx
│   │   ├── AnswerPage.tsx
│   │   ├── CheckPage.tsx
│   │   ├── CodePage.tsx
│   │   ├── EvaluatePage.tsx
│   │   ├── HelpPage.tsx
│   │   ├── HotspotsPage.tsx
│   │   ├── PeoplePage.tsx
│   │   ├── PersonDetailPage.tsx
│   │   ├── PullDetailPage.tsx
│   │   ├── PullsPage.tsx
│   │   ├── ResultsPage.tsx
│   │   ├── SavedPage.tsx
│   │   └── StartPage.tsx
│   ├── utils/              # Decision record export & source button helpers
│   ├── api.ts              # API layer with USE_MOCK flag and simulated delay
│   ├── saved.ts            # LocalStorage persistence utility
│   ├── types.ts            # TypeScript interfaces and domain models
│   ├── App.tsx             # Route declarations
│   ├── index.css           # Tailwind base, CSS variables, and print styles
│   └── main.tsx            # React application entry point
├── tailwind.config.js      # Color tokens & typography configuration
└── vite.config.ts          # Vite & Vitest configuration
```

---

## Switching to the Real Backend API

The application is architected behind a single API abstraction file: `src/api.ts`.
To connect frontend-v2 to a live Python backend in `src/`:
1. Open `src/api.ts`.
2. Change the `USE_MOCK` boolean flag to `false`:
   ```typescript
   export const USE_MOCK = false;
   ```
3. Ensure your backend server is running and proxied or serving endpoints on `/api/...`.

---

## Label Mapping

All statuses and effects are rendered with an icon AND plain words (never color alone):

| Data Value | UI Text | Visual Appearance | Meaning |
| :--- | :--- | :--- | :--- |
| `status: "accepted"` | **Decided** | Green-teal pill (`#1F5E4E`), white text, check icon | Approved and merged into the project |
| `status: "rejected"` | **Decided against** | Brick pill (`#A8432F`), white text, cross icon | Considered and explicitly rejected |
| `status: "deferred"` | **Postponed** | Amber pill (`#F0D8A0`), dark text (`#5A4310`), clock icon | Postponed to a future milestone |
| `status: "unresolved"` | **Still open** | Neutral gray-green pill (`#E4EAE5`), muted text, question icon | Ongoing discussion without consensus |
| `effect: "modified"` | **Adjusted later** | Amber badge (`#F0D8A0`), dark text (`#5A4310`), edit icon | Later pull request modified the decision |
| `effect: "reversed"` | **Undone later** | Brick badge (`#A8432F`), white text, undo icon | Later pull request reversed the decision |
| `effect: "unrelated"` | **Not related** | Neutral badge (`#E4EAE5`), muted text | Unrelated follow-up change |
| `effect: "unclear"` | **Unclear** | Neutral badge (`#E4EAE5`), muted text | Status could not be determined |
| `confidence: "high"` | **Well supported** | Accent text (`#1F5E4E`), bold | Every statement proven by cited comment sentences |
| `confidence: "medium"` | **Partly supported** | Accent text (`#1F5E4E`), bold | Core statements proven; minor claims dropped |
| `confidence: "low"` | **Weakly supported** | Muted text (`#4F6B63`), bold | Sparse comment proof available |
