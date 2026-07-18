import { DocumentationRule } from './index.js';
import { Finding, ProjectContext } from '../types/project-context.js';
import { visit } from 'unist-util-visit';

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class UndocumentedScriptsRule implements DocumentationRule {
  id = 'DOC003';
  async run(context: ProjectContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    const readmeFile = context.files.find(f => f.toLowerCase() === 'readme.md');
    if (!readmeFile) return [];

    const ast = context.markdownASTs[readmeFile];
    const rawContent = context.rawFiles[readmeFile] || '';

    const ignoredScripts = new Set([
      'prepare', 'preinstall', 'postinstall', 'prepack', 'postpack',
      'prebuild', 'postbuild', 'pretest', 'posttest', 'predev', 'postdev',
      'prestart', 'poststart'
    ]);

    for (const [scriptName, _cmd] of Object.entries(context.scripts)) {
      if (ignoredScripts.has(scriptName)) continue;
      if (scriptName.startsWith('pre') || scriptName.startsWith('post')) continue;

      let mentioned = false;

      // Check raw content for common execution phrases
      if (
        rawContent.includes(`npm run ${scriptName}`) ||
        rawContent.includes(`yarn run ${scriptName}`) ||
        rawContent.includes(`yarn ${scriptName}`) ||
        rawContent.includes(`pnpm run ${scriptName}`) ||
        rawContent.includes(`pnpm ${scriptName}`) ||
        rawContent.includes(`bun run ${scriptName}`)
      ) {
        mentioned = true;
      }

      if (!mentioned && (scriptName === 'start' || scriptName === 'test')) {
        if (rawContent.includes(`npm ${scriptName}`) || rawContent.includes(`bun ${scriptName}`)) {
          mentioned = true;
        }
      }

      // Check AST nodes (code, inlineCode, headings, tableCell, listItem)
      if (!mentioned && ast) {
        const wordRegex = new RegExp(`\\b${escapeRegExp(scriptName)}\\b`);
        visit(ast, ['code', 'inlineCode', 'heading', 'tableCell', 'listItem'], (node: any) => {
          if (mentioned) return;
          let nodeText = node.value || '';
          if (!nodeText && node.children) {
            visit(node, 'text', (t: any) => {
              nodeText += ' ' + (t.value || '');
            });
          }
          if (wordRegex.test(nodeText)) {
            mentioned = true;
          }
        });
      }

      if (!mentioned) {
        findings.push({
          ruleId: this.id,
          severity: 'warning',
          message: `Script "${scriptName}" is defined in package.json but not documented in README.md.`,
          file: readmeFile,
          evidence: scriptName
        });
      }
    }

    return findings;
  }
}
