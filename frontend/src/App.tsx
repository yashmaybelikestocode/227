import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CommentPanelProvider } from './context/CommentPanelContext';
import { Layout } from './components/Layout';
import { StartPage } from './pages/StartPage';
import { ImportPage } from './pages/ImportPage';
import { DecisionsPage } from './pages/DecisionsPage';
import { StatementsPage } from './pages/StatementsPage';
import { CodePage } from './pages/CodePage';
import { PeoplePage } from './pages/PeoplePage';
import { PersonDetailPage } from './pages/PersonDetailPage';
import { EvaluatePage } from './pages/EvaluatePage';
import { HelpPage } from './pages/HelpPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CommentPanelProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<StartPage />} />
            <Route path="import/:id" element={<ImportPage />} />
            <Route path="decisions/:id" element={<DecisionsPage />} />
            <Route path="statements/:id" element={<StatementsPage />} />
            <Route path="code" element={<CodePage />} />
            <Route path="code/*" element={<CodePage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="people/:id" element={<PersonDetailPage />} />
            <Route path="evaluate" element={<EvaluatePage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </CommentPanelProvider>
    </BrowserRouter>
  );
};

export default App;
