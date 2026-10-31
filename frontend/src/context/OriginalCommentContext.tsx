import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { Post } from "../types";

interface OriginalCommentContextType {
  isOpen: boolean;
  activeEvidenceId: string | null;
  activePosts: Post[];
  openPanel: (evidenceId: string, posts: Post[], triggerElement?: HTMLElement | null) => void;
  closePanel: () => void;
  triggerElement: HTMLElement | null;
}

const OriginalCommentContext = createContext<OriginalCommentContextType | undefined>(undefined);

export const OriginalCommentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null);
  const [activePosts, setActivePosts] = useState<Post[]>([]);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openPanel = useCallback((evidenceId: string, posts: Post[], triggerElement?: HTMLElement | null) => {
    setActiveEvidenceId(evidenceId);
    setActivePosts(posts);
    if (triggerElement) {
      triggerRef.current = triggerElement;
    }
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, []);

  return (
    <OriginalCommentContext.Provider
      value={{
        isOpen,
        activeEvidenceId,
        activePosts,
        openPanel,
        closePanel,
        triggerElement: triggerRef.current,
      }}
    >
      {children}
    </OriginalCommentContext.Provider>
  );
};

export function useOriginalComment() {
  const context = useContext(OriginalCommentContext);
  if (!context) {
    throw new Error("useOriginalComment must be used within an OriginalCommentProvider");
  }
  return context;
}
