import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Post } from '../types';
import { getSourceLabel } from '../utils/sourceHelper';

interface CommentPanelState {
  isOpen: boolean;
  activeSentenceId: string | null;
  activePost: Post | null;
  sourceLabel: string;
  openComment: (sentenceId: string, post: Post, triggerEl?: HTMLElement | null) => void;
  closeComment: () => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
}

const CommentPanelContext = createContext<CommentPanelState | undefined>(undefined);

export const CommentPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [sourceLabel, setSourceLabel] = useState('');
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const openComment = useCallback((sentenceId: string, post: Post, triggerEl?: HTMLElement | null) => {
    if (triggerEl) {
      triggerRef.current = triggerEl;
    }
    setActiveSentenceId(sentenceId);
    setActivePost(post);
    setSourceLabel(getSourceLabel(post));
    setIsOpen(true);
  }, []);

  const closeComment = useCallback(() => {
    setIsOpen(false);
    setActiveSentenceId(null);
    setActivePost(null);
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, []);

  return (
    <CommentPanelContext.Provider
      value={{
        isOpen,
        activeSentenceId,
        activePost,
        sourceLabel,
        openComment,
        closeComment,
        panelRef,
      }}
    >
      {children}
    </CommentPanelContext.Provider>
  );
};

export function useCommentPanel(): CommentPanelState {
  const context = useContext(CommentPanelContext);
  if (!context) {
    throw new Error('useCommentPanel must be used within a CommentPanelProvider');
  }
  return context;
}
