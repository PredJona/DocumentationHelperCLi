import { DocumentationRule } from './index.js';
import { Finding, ProjectContext } from '../types/project-context.js';
import { visit } from 'unist-util-visit';

export class UndocumentedScriptsRule implements DocumentationRule {
  id = 'DOC003';
  async run(context: ProjectContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    const readmeFile = context.files.find(f => f.toLowerCase() === 'readme.md');
    if (!readmeFile) return [];

    const ast = context.markdownASTs[readmeFile];
    if (!ast) return [];

    const mentionedScripts = new Set<string>();
    visit(ast, 'inlineCode', (node: any) => {
      const value = node.value;
      const match = /npm run ([a-z0-9:-]+)/.exec(value);
      if (match) mentionedScripts.add(match[1]);
    });

    visit(ast, 'code', (node: any) => {
      const value = node.value;
      const lines = value.split('\n');
      for (const line of lines) {
        const match = /npm run ([a-z0-9:-]+)/.exec(line);
        if (match) mentionedScripts.add(match[1]);
      }
    });

    for (const script of mentionedScripts) {
      if (!context.scripts[script]) {
        findings.push({
          ruleId: this.id,
          severity: 'error',
          message: `Mentioned script "npm run ${script}" in README does not exist in package.json.`,
          file: readmeFile,
          evidence: script
        });
      }
    }

    return findings;
  }
}
