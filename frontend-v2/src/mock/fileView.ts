import { FileView } from '../types';
import { mainAnswer } from './answers';
import { mockPosts } from './posts';

export const mockRetryFileView: FileView = {
  path: 'src/retry.py',
  lines: [
    'import time',
    'from .errors import RetryError, Timeout',
    '',
    'def fetch_with_retry(request, max_attempts=3):',
    '    delay = 0.5',
    '    for attempt in range(max_attempts):',
    '        try:',
    '            return request.send()',
    '        except Timeout:',
    '            time.sleep(delay)',
    '            delay *= 2',
    '    raise RetryError("Max retry attempts reached")',
    '',
    'def health_check(service):',
    '    return service.ping()',
  ],
  threads: [
    {
      id: 'thread-1',
      file: 'src/retry.py',
      line_start: 4,
      line_end: 11,
      in_short: {
        text: 'We wait longer after each failed try to give overloaded servers room to recover.',
        evidence_ids: ['p1.s2'],
      },
      decisions: mainAnswer.decisions,
      story: mainAnswer.timeline,
      confidence: 'high',
      left_out: 0,
      based_on_comments: 5,
      posts: mockPosts,
    },
  ],
  later_notes: [
    {
      line_start: 14,
      line_end: 15,
      effect: 'reversed',
      title: 'Health checks no longer retry',
      explanation: {
        text: 'Health checks fail immediately so load balancers can pull unhealthy pods without waiting.',
        evidence_ids: ['p5.s3'],
      },
      pr_numbers: [118, 231],
    },
  ],
};
