import { Finding } from './project-context.js';

export interface AnalysisSummary {
  totalFindings: number;
  errors: number;
  warnings: number;
  suggestions: number;
}

export interface AnalysisResult {
  score: number;
  summary: AnalysisSummary;
  findings: Finding[];
  analyzedPath: string;
  rulesRun: string[];
}
