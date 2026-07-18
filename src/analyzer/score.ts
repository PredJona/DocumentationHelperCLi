import { Finding } from '../types/project-context.js';

export function calculateScore(findings: Finding[]): number {
  let score = 100;
  for (const finding of findings) {
    if (finding.severity === 'error') {
      score -= 15;
    } else if (finding.severity === 'warning') {
      score -= 7;
    } else if (finding.severity === 'suggestion') {
      score -= 3;
    }
  }
  return Math.max(0, score);
}
