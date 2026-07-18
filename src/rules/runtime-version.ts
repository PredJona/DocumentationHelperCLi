import { DocumentationRule } from './index.js';
import { Finding, ProjectContext } from '../types/project-context.js';
import { visit } from 'unist-util-visit';

/**
 * Limited version specification comparison without external semver dependency.
 * Extracts version parts (major, minor, patch) and relational operators to check
 * if a README node version recommendation contradicts project config (.nvmrc/engines/Dockerfile).
 */
export class RuntimeVersionRule implements DocumentationRule {
  id = 'DOC005';
  async run(context: ProjectContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    const readmeFile = context.files.find(f => f.toLowerCase() === 'readme.md');
    if (!readmeFile || !context.nodeVersion) return [];

    const ast = context.markdownASTs[readmeFile];
    if (!ast) return [];

    const readmeNodeVersions: string[] = [];
    visit(ast, 'text', (node: any) => {
      const matches = node.value.matchAll(/node(?:\.js)?\s+(?:version\s+)?([>=<^~]*\s*v?\d+(?:\.[\dx*]+)?(?:\.[\dx*]+)?(?:[\s||>=<^~v\d.*x]*)?)/gi);
      for (const match of matches) {
        if (match[1]) {
          readmeNodeVersions.push(match[1].trim());
        }
      }
    });

    if (readmeNodeVersions.length === 0) return [];

    const configItems = this.parseVersions(context.nodeVersion);
    if (configItems.length === 0) return [];

    for (const readmeVerStr of readmeNodeVersions) {
      const readmeItems = this.parseVersions(readmeVerStr);
      if (readmeItems.length === 0) continue;

      let compatible = false;
      for (const r of readmeItems) {
        for (const c of configItems) {
          if (this.isCompatible(r, c)) {
            compatible = true;
            break;
          }
        }
        if (compatible) break;
      }

      if (!compatible) {
        findings.push({
          ruleId: this.id,
          severity: 'warning',
          message: `Node.js version contradiction: README mentions "${readmeVerStr}", but project config specifies "${context.nodeVersion}".`,
          file: readmeFile,
          evidence: `README: ${readmeVerStr}, Config: ${context.nodeVersion}`
        });
      }
    }

    return findings;
  }

  private parseVersions(verStr: string): Array<{ op: string; major: number; minor?: number; patch?: number }> {
    const items: Array<{ op: string; major: number; minor?: number; patch?: number }> = [];
    const regex = /(>=|<=|>|<|\^|~|=)?\s*v?(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?/gi;
    let match;
    while ((match = regex.exec(verStr)) !== null) {
      const op = (match[1] || '').trim();
      const major = parseInt(match[2], 10);
      if (isNaN(major)) continue;
      const minor = match[3] && !isNaN(parseInt(match[3], 10)) ? parseInt(match[3], 10) : undefined;
      const patch = match[4] && !isNaN(parseInt(match[4], 10)) ? parseInt(match[4], 10) : undefined;
      items.push({ op, major, minor, patch });
    }
    return items;
  }

  private isCompatible(
    r: { op: string; major: number; minor?: number; patch?: number },
    c: { op: string; major: number; minor?: number; patch?: number }
  ): boolean {
    if (r.major === c.major) {
      return true;
    }

    if (c.op === '>=' || c.op === '>') {
      if (r.major >= c.major) return true;
    }
    if (c.op === '<=' || c.op === '<') {
      if (r.major <= c.major) return true;
    }
    if (r.op === '>=' || r.op === '>') {
      if (c.major >= r.major) return true;
    }
    if (r.op === '<=' || r.op === '<') {
      if (c.major <= r.major) return true;
    }

    return false;
  }
}
