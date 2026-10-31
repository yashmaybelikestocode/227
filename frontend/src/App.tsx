import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OriginalCommentProvider } from "./context/OriginalCommentContext";
import { TopBar } from "./components/TopBar";
import { OriginalCommentPanel } from "./components/OriginalCommentPanel";
import { StartPage } from "./pages/StartPage";
import { ResultsPage } from "./pages/ResultsPage";
import { AnswerPage } from "./pages/AnswerPage";
import { CodePage } from "./pages/CodePage";
import { PullsListPage } from "./pages/PullsListPage";
import { PullDetailPage } from "./pages/PullDetailPage";
import { CheckPage } from "./pages/CheckPage";
import { EvaluatePage } from "./pages/EvaluatePage";
import { HelpPage } from "./pages/HelpPage";

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-midnight flex flex-col font-sans">
      <TopBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/answer/:id" element={<AnswerPage />} />
          <Route path="/code" element={<CodePage />} />
          <Route path="/code/*" element={<CodePage />} />
          <Route path="/pulls" element={<PullsListPage />} />
          <Route path="/pull/:number" element={<PullDetailPage />} />
          <Route path="/check" element={<CheckPage />} />
          <Route path="/evaluate" element={<EvaluatePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <OriginalCommentPanel />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <OriginalCommentProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </OriginalCommentProvider>
  );
};

export default App;
