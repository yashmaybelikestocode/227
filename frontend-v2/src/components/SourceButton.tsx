import React from 'react';
import { Post } from '../types';
import { useCommentPanel } from '../context/CommentPanelContext';
import { getSourceLabel, findPostBySentenceId } from '../utils/sourceHelper';
import { mockPosts } from '../mock/posts';

interface SourceButtonProps {
  evidenceId: string;
  posts?: Post[];
  className?: string;
}

export const SourceButton: React.FC<SourceButtonProps> = ({ evidenceId, posts = mockPosts, className = '' }) => {
  const { openComment } = useCommentPanel();

  const post = findPostBySentenceId(posts, evidenceId);
  if (!post) {
    // If not found in provided posts, check global mockPosts
    const fallbackPost = findPostBySentenceId(mockPosts, evidenceId);
    if (!fallbackPost) return null;
    const label = getSourceLabel(fallbackPost);
    return (
      <button
        type="button"
        onClick={(e) => openComment(evidenceId, fallbackPost, e.currentTarget)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-accent bg-mint-soft border border-mint-deep hover:bg-mint rounded-btn transition-colors focus:ring-2 focus:ring-accent ${className}`}
        title={`View evidence sentence from ${label}`}
      >
        <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <span>{label}</span>
      </button>
    );
  }

  const label = getSourceLabel(post);

  return (
    <button
      type="button"
      onClick={(e) => openComment(evidenceId, post, e.currentTarget)}
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-accent bg-mint-soft border border-mint-deep hover:bg-mint rounded-btn transition-colors focus:ring-2 focus:ring-accent ${className}`}
      title={`View evidence sentence from ${label}`}
    >
      <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <span>{label}</span>
    </button>
  );
};
