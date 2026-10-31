import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { Statement, Comment, Person } from '../types';

interface CommentPanelContextType {
  isOpen: boolean;
  activeStatement: Statement | null;
  activeComment: Comment | null;
  authorLabel: string;
  authorName: string;
  openComment: (
    statementId: string,
    comments: Comment[],
    statements: Statement[],
    people: Person[],
    triggerEl?: HTMLElement | null
  ) => void;
  closeComment: () => void;
}

const CommentPanelContext = createContext<CommentPanelContextType | null>(null);

export const CommentPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStatement, setActiveStatement] = useState<Statement | null>(null);
  const [activeComment, setActiveComment] = useState<Comment | null>(null);
  const [authorLabel, setAuthorLabel] = useState('');
  const [authorName, setAuthorName] = useState('');
  const triggerRef = useRef<HTMLElement | null>(null);

  const openComment = useCallback(
    (
      statementId: string,
      comments: Comment[],
      statements: Statement[],
      people: Person[],
      triggerEl?: HTMLElement | null
    ) => {
      if (triggerEl) {
        triggerRef.current = triggerEl;
      }

      const stmt = statements.find((s) => s.id === statementId);
      if (!stmt) return;

      const comment = comments.find((c) => c.id === stmt.comment_id);
      if (!comment) return;

      const person = people.find((p) => p.id === comment.person_id);
      const displayName = person ? person.display_name : 'Contributor';
      const firstName = displayName.split(' ')[0] || displayName;

      // Extract day and month, e.g. "14 Mar"
      const dateParts = comment.date.split(' ');
      const dayMonth = dateParts.length >= 2 ? `${dateParts[0]} ${dateParts[1]}` : comment.date;

      setActiveStatement(stmt);
      setActiveComment(comment);
      setAuthorName(displayName);
      setAuthorLabel(`${firstName}, ${dayMonth}`);
      setIsOpen(true);
    },
    []
  );

  const closeComment = useCallback(() => {
    setIsOpen(false);
    if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeComment();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeComment]);

  return (
    <CommentPanelContext.Provider
      value={{
        isOpen,
        activeStatement,
        activeComment,
        authorLabel,
        authorName,
        openComment,
        closeComment,
      }}
    >
      {children}
    </CommentPanelContext.Provider>
  );
};

const defaultContextValue: CommentPanelContextType = {
  isOpen: false,
  activeStatement: null,
  activeComment: null,
  authorLabel: '',
  authorName: '',
  openComment: () => {},
  closeComment: () => {},
};

export const useCommentPanel = (): CommentPanelContextType => {
  const ctx = useContext(CommentPanelContext);
  return ctx || defaultContextValue;
};
