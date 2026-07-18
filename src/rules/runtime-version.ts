import { DocumentationRule } from './index.js';
import { Finding, ProjectContext } from '../types/project-context.js';
import { visit } from 'unist-util-visit';

export class RuntimeVersionRule implements DocumentationRule {
  id = 'DOC005';
  async run(context: ProjectContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    const readmeFile = context.files.find(f => f.toLowerCase() === 'readme.md');
    if (!readmeFile || !context.nodeVersion) return [];

    const ast = context.markdownASTs[readmeFile];
    if (!ast) return [];

    let readmeNodeVersion: string | undefined;
    visit(ast, 'text', (node: any) => {
      const match = /node\s+v?(\d+\.\d+(\.\d+)?)/i.exec(node.value);
      if (match) readmeNodeVersion = match[1];
    });

    if (readmeNodeVersion && !context.nodeVersion.includes(readmeNodeVersion)) {
      findings.push({
        ruleId: this.id,
        severity: 'warning',
        message: `Node.js version contradiction: README mentions ${readmeNodeVersion}, but project config (package.json/nvmrc/Dockerfile) says ${context.nodeVersion}.`,
        file: readmeFile,
        evidence: `README: ${readmeNodeVersion}, Config: ${context.nodeVersion}`
      });
    }

    return findings;
  }
}
