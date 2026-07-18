import { DocumentationRule } from './index.js';
import { Finding, ProjectContext } from '../types/project-context.js';

export class UndocumentedEnvRule implements DocumentationRule {
  id = 'DOC004';
  async run(context: ProjectContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    const missingInExample = context.envVars.filter(v => !context.envExampleVars.includes(v));

    for (const v of missingInExample) {
      findings.push({
        ruleId: this.id,
        severity: 'warning',
        message: `Environment variable "${v}" is used in code but missing in .env.example.`,
        evidence: v
      });
    }

    return findings;
  }
}
