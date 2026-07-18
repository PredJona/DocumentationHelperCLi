import path from 'path';
import { FileScanner } from '../scanner/file-scanner.js';
import { PackageJsonExtractor } from '../extractors/package-json.js';
import { EnvironmentExtractor } from '../extractors/environment.js';
import { MarkdownExtractor } from '../extractors/markdown.js';
import { RuntimeExtractor } from '../extractors/runtime.js';
import { ProjectContext, Finding } from '../types/project-context.js';
import { AnalysisResult, AnalysisSummary } from '../types/analysis-result.js';
import { DocumentationRule, getAllRules } from '../rules/index.js';
import { calculateScore } from './score.js';

export class ProjectAnalyzer {
  private rules: DocumentationRule[];

  constructor(rules?: DocumentationRule[]) {
    this.rules = rules || getAllRules();
  }

  async analyze(rootPath: string): Promise<AnalysisResult> {
    const resolvedPath = path.resolve(rootPath);
    const files = await FileScanner.scan(resolvedPath);
    const packageJson = await PackageJsonExtractor.extract(resolvedPath);

    let packageManager: ProjectContext['packageManager'] = 'unknown';
    if (files.some(f => f.endsWith('pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    } else if (files.some(f => f.endsWith('yarn.lock'))) {
      packageManager = 'yarn';
    } else if (files.some(f => f.endsWith('package-lock.json') || f.endsWith('npm-shrinkwrap.json'))) {
      packageManager = 'npm';
    } else if (packageJson?.packageManager) {
      if (typeof packageJson.packageManager === 'string') {
        if (packageJson.packageManager.startsWith('pnpm')) packageManager = 'pnpm';
        else if (packageJson.packageManager.startsWith('yarn')) packageManager = 'yarn';
        else if (packageJson.packageManager.startsWith('npm')) packageManager = 'npm';
      }
    } else if (packageJson !== null) {
      packageManager = 'npm';
    }

    let projectType: ProjectContext['projectType'] = 'unknown';
    if (
      files.some(f => f.endsWith('.ts') || f.endsWith('.tsx')) ||
      files.includes('tsconfig.json') ||
      packageJson?.devDependencies?.typescript ||
      packageJson?.dependencies?.typescript
    ) {
      projectType = 'TypeScript';
    } else if (
      files.some(f => f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.cjs')) ||
      packageJson !== null
    ) {
      projectType = 'Node.js';
    }

    const scripts = packageJson?.scripts ? { ...packageJson.scripts } : {};
    const dependencies = packageJson?.dependencies ? { ...packageJson.dependencies } : {};
    const devDependencies = packageJson?.devDependencies ? { ...packageJson.devDependencies } : {};

    const envVars = await EnvironmentExtractor.extractFromCode(resolvedPath, files);
    const envExampleVars = await EnvironmentExtractor.extractFromExample(resolvedPath);
    const nodeVersion = await RuntimeExtractor.extractNodeVersion(resolvedPath, packageJson);

    const documentationFiles = files.filter(f => f.toLowerCase().endsWith('.md') || f.toLowerCase().endsWith('.mdx'));
    const markdownASTs: Record<string, any> = {};
    const rawFiles: Record<string, string> = {};

    for (const docFile of documentationFiles) {
      try {
        const content = await FileScanner.readFile(resolvedPath, docFile);
        rawFiles[docFile] = content;
        markdownASTs[docFile] = await MarkdownExtractor.parse(content);
      } catch {
        // Skip files that fail to read
      }
    }

    const context: ProjectContext = {
      rootPath: resolvedPath,
      packageManager,
      projectType,
      scripts,
      dependencies,
      devDependencies,
      envVars,
      envExampleVars,
      nodeVersion,
      files,
      documentationFiles,
      markdownASTs,
      rawFiles,
    };

    const findings: Finding[] = [];
    const rulesRun: string[] = [];

    for (const rule of this.rules) {
      rulesRun.push(rule.id);
      try {
        const ruleFindings = await rule.run(context);
        findings.push(...ruleFindings);
      } catch (error) {
        // If a rule fails unexpectedly during execution, do not crash the entire analyzer
      }
    }

    const score = calculateScore(findings);
    const errors = findings.filter(f => f.severity === 'error').length;
    const warnings = findings.filter(f => f.severity === 'warning').length;
    const suggestions = findings.filter(f => f.severity === 'suggestion').length;

    const summary: AnalysisSummary = {
      totalFindings: findings.length,
      errors,
      warnings,
      suggestions,
    };

    return {
      score,
      summary,
      findings,
      analyzedPath: resolvedPath,
      rulesRun,
    };
  }
}
