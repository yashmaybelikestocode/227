import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedAnswers, removeSavedAnswer } from '../saved';
import { SavedAnswer } from '../types';
import { EmptyState } from '../components/EmptyState';

export const SavedPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedList, setSavedList] = useState<SavedAnswer[]>([]);

  const loadSaved = () => {
    setSavedList(getSavedAnswers());
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = (answerId: string) => {
    removeSavedAnswer(answerId);
    loadSaved();
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight">
          Saved answers
        </h1>
        <p className="text-muted text-[15px] mt-1">
          Reference your bookmarked decision summaries and project histories offline.
        </p>
      </div>

      {savedList.length === 0 ? (
        <EmptyState
          message="Nothing saved yet. Press Save on any answer to keep it here."
          actionText="Find answers"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="space-y-3">
          {savedList.map((item) => (
            <div
              key={item.answer_id}
              className="bg-surface rounded-card border border-line p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono font-medium text-muted mb-1">
                  {item.repo} · Saved {item.saved_at}
                </div>
                <h2 className="font-serif text-[18px] font-semibold text-ink leading-snug">
                  {item.title}
                </h2>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/answer/${item.answer_id}`)}
                  className="px-4 py-2 bg-accent text-white text-xs font-medium rounded-btn hover:opacity-90 transition-opacity"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.answer_id)}
                  className="px-3.5 py-2 border-[1.5px] border-line text-muted text-xs font-medium rounded-btn hover:text-brick hover:border-brick/40 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
