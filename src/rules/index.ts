import { Finding, ProjectContext } from '../types/project-context.js';
import { MissingReadmeRule } from './missing-readme.js';
import { BrokenLinksRule } from './broken-links.js';
import { UndocumentedScriptsRule } from './undocumented-scripts.js';
import { UndocumentedEnvRule } from './undocumented-env.js';
import { RuntimeVersionRule } from './runtime-version.js';

export interface DocumentationRule {
  id: string;
  run(context: ProjectContext): Promise<Finding[]>;
}

export function getAllRules(): DocumentationRule[] {
  return [
    new MissingReadmeRule(),
    new BrokenLinksRule(),
    new UndocumentedScriptsRule(),
    new UndocumentedEnvRule(),
    new RuntimeVersionRule(),
  ];
}

export {
  MissingReadmeRule,
  BrokenLinksRule,
  UndocumentedScriptsRule,
  UndocumentedEnvRule,
  RuntimeVersionRule,
};
