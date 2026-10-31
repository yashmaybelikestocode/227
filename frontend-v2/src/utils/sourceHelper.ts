import { Post } from '../types';

export function getSourceLabel(post: Post): string {
  const firstName = post.author.split(' ')[0];
  const dateObj = new Date(post.timestamp);
  const day = dateObj.getUTCDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = monthNames[dateObj.getUTCMonth()];
  return `${firstName}, ${day} ${mon}`;
}

export function findPostBySentenceId(posts: Post[], sentenceId: string): Post | undefined {
  return posts.find((p) => p.sentences.some((s) => s.id === sentenceId));
}
