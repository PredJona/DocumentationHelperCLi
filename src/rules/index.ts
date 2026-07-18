import { Finding, ProjectContext } from '../types/project-context.js';

export interface DocumentationRule {
  id: string;
  run(context: ProjectContext): Promise<Finding[]>;
}
