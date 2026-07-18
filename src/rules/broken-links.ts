import { DocumentationRule } from './index.js';
import { Finding, ProjectContext } from '../types/project-context.js';
import { visit } from 'unist-util-visit';
import path from 'path';

export class BrokenLinksRule implements DocumentationRule {
  id = 'DOC002';
  async run(context: ProjectContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    for (const [file, ast] of Object.entries(context.markdownASTs)) {
      visit(ast, 'link', (node: any) => {
        const url = node.url;
        if (url && !url.startsWith('http') && !url.startsWith('#') && !url.startsWith('mailto:')) {
          // Local link
          const dir = path.dirname(file);
          const target = path.join(dir, url).replace(/\\/g, '/');
          const exists = context.files.includes(target) || context.files.includes(url);
          
          if (!exists) {
            findings.push({
              ruleId: this.id,
              severity: 'error',
              message: `Broken local link: "${url}" in ${file}`,
              file,
              evidence: url
            });
          }
        }
      });
    }
    return findings;
  }
}
