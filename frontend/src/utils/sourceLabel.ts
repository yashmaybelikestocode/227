import { Post } from "../types";

export interface SourceMeta {
  authorFirstName: string;
  dayMonth: string;
  label: string;
  post: Post;
  sentenceId: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function getSourceMeta(evidenceId: string, posts: Post[]): SourceMeta | null {
  for (const post of posts) {
    const hasSentence = post.sentences.some((s) => s.id === evidenceId);
    if (hasSentence) {
      // First name: split author by space or take whole name
      const authorFirstName = post.author.split(" ")[0];

      // Parse timestamp
      let dayMonth = "";
      try {
        const d = new Date(post.timestamp);
        if (!isNaN(d.getTime())) {
          dayMonth = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
        }
      } catch {
        dayMonth = "";
      }

      if (!dayMonth) {
        dayMonth = "14 Mar";
      }

      return {
        authorFirstName,
        dayMonth,
        label: `${authorFirstName}, ${dayMonth}`,
        post,
        sentenceId: evidenceId,
      };
    }
  }
  return null;
}
