import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StartPage } from './pages/StartPage';
import { ResultsPage } from './pages/ResultsPage';
import { AnswerPage } from './pages/AnswerPage';
import { ActivityPage } from './pages/ActivityPage';
import { PeoplePage } from './pages/PeoplePage';
import { PersonDetailPage } from './pages/PersonDetailPage';
import { HotspotsPage } from './pages/HotspotsPage';
import { CodePage } from './pages/CodePage';
import { PullsPage } from './pages/PullsPage';
import { PullDetailPage } from './pages/PullDetailPage';
import { CheckPage } from './pages/CheckPage';
import { EvaluatePage } from './pages/EvaluatePage';
import { SavedPage } from './pages/SavedPage';
import { HelpPage } from './pages/HelpPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<StartPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="answer/:id" element={<AnswerPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="people" element={<PeoplePage />} />
        <Route path="people/:name" element={<PersonDetailPage />} />
        <Route path="hotspots" element={<HotspotsPage />} />
        <Route path="code" element={<CodePage />} />
        <Route path="code/*" element={<CodePage />} />
        <Route path="pulls" element={<PullsPage />} />
        <Route path="pull/:number" element={<PullDetailPage />} />
        <Route path="check" element={<CheckPage />} />
        <Route path="evaluate" element={<EvaluatePage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
