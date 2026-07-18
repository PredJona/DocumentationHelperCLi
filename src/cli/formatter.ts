import { AnalysisResult } from '../types/analysis-result.js';

export function formatJson(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}

export function formatText(result: AnalysisResult, verbose: boolean = false): string {
  const lines: string[] = [];
  lines.push('Documentation Health Analysis');
  lines.push('==================================================');
  lines.push(`Analyzed Path: ${result.analyzedPath}`);
  lines.push(`Score: ${result.score} / 100`);
  lines.push(
    `Summary: ${result.summary.totalFindings} total finding(s) (${result.summary.errors} error(s), ${result.summary.warnings} warning(s), ${result.summary.suggestions} suggestion(s))`
  );
  lines.push('');

  if (result.findings.length === 0) {
    lines.push('No issues found! Great job on your documentation.');
  } else {
    lines.push('Findings:');
    for (const finding of result.findings) {
      const severityUpper = finding.severity.toUpperCase();
      lines.push(`  [${severityUpper}] [${finding.ruleId}] ${finding.message}`);
      if (verbose) {
        if (finding.file) {
          lines.push(`    File: ${finding.file}${finding.line ? `:${finding.line}` : ''}`);
        }
        if (finding.evidence) {
          lines.push(`    Evidence: ${finding.evidence}`);
        }
      }
    }
  }

  return lines.join('\n');
}
