import { DocumentationRule } from './index.js';
import { Finding, ProjectContext } from '../types/project-context.js';
import { visit } from 'unist-util-visit';

export class ReadmeQualityRule implements DocumentationRule {
  id = 'DOC007';
  async run(context: ProjectContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    const readmeFile = context.files.find(f => f.toLowerCase() === 'readme.md');
    if (!readmeFile) return [];

    const rawContent = context.rawFiles[readmeFile];
    if (rawContent === undefined || rawContent.trim().length === 0) {
      findings.push({
        ruleId: this.id,
        severity: 'suggestion',
        message: 'README.md is empty. Consider adding project overview, installation, and usage documentation.',
        file: readmeFile,
      });
      return findings;
    }

    if (rawContent.trim().length < 100) {
      findings.push({
        ruleId: this.id,
        severity: 'suggestion',
        message: 'README.md is very short (< 100 characters). Consider adding more comprehensive documentation.',
        file: readmeFile,
      });
    }

    const ast = context.markdownASTs[readmeFile];
    let hasInstallOrUsageSection = false;

    if (ast) {
      visit(ast, 'heading', (node: any) => {
        let headingText = '';
        visit(node, 'text', (textNode: any) => {
          headingText += ' ' + (textNode.value || '');
        });
        const normalized = headingText.toLowerCase();
        if (
          normalized.includes('install') ||
          normalized.includes('instalación') ||
          normalized.includes('setup') ||
          normalized.includes('getting started') ||
          normalized.includes('quick start') ||
          normalized.includes('usage') ||
          normalized.includes('uso') ||
          normalized.includes('run')
        ) {
          hasInstallOrUsageSection = true;
        }
      });
    }

    if (!hasInstallOrUsageSection) {
      const normalizedContent = rawContent.toLowerCase();
      if (
        normalizedContent.includes('npm i') ||
        normalizedContent.includes('npm install') ||
        normalizedContent.includes('yarn add') ||
        normalizedContent.includes('pnpm add') ||
        normalizedContent.includes('npm run') ||
        normalizedContent.includes('installation') ||
        normalizedContent.includes('instalación') ||
        normalizedContent.includes('usage') ||
        normalizedContent.includes('uso')
      ) {
        hasInstallOrUsageSection = true;
      }
    }

    if (!hasInstallOrUsageSection) {
      findings.push({
        ruleId: this.id,
        severity: 'suggestion',
        message: 'README.md lacks a clear installation or usage section.',
        file: readmeFile,
      });
    }

    return findings;
  }
}
