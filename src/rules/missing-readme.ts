import { DocumentationRule } from './index.js';
import { Finding, ProjectContext } from '../types/project-context.js';

export class MissingReadmeRule implements DocumentationRule {
  id = 'DOC001';
  async run(context: ProjectContext): Promise<Finding[]> {
    const readmeExists = context.files.some(f => f.toLowerCase() === 'readme.md');
    if (!readmeExists) {
      return [{
        ruleId: this.id,
        severity: 'error',
        message: 'README.md does not exist.',
      }];
    }
    return [];
  }
}
