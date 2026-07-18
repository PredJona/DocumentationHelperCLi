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
        if (
          url &&
          !url.startsWith('http://') &&
          !url.startsWith('https://') &&
          !url.startsWith('#') &&
          !url.startsWith('mailto:') &&
          !url.startsWith('ftp://') &&
          !url.startsWith('tel:') &&
          !url.startsWith('data:')
        ) {
          // Support relative links with anchors or query strings (e.g. docs/setup.md#install)
          const cleanUrl = url.split('#')[0].split('?')[0];
          if (!cleanUrl) return; // purely anchor or empty after split

          const dir = path.dirname(file);
          let target = path.join(dir, cleanUrl).replace(/\\/g, '/');
          if (target.startsWith('./')) target = target.slice(2);

          let normalizedUrl = cleanUrl.replace(/\\/g, '/');
          if (normalizedUrl.startsWith('./')) normalizedUrl = normalizedUrl.slice(2);

          const exists =
            context.files.includes(target) ||
            context.files.includes(normalizedUrl) ||
            context.files.some(f => f.startsWith(target + '/') || f.startsWith(normalizedUrl + '/'));

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
