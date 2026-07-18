import { Finding, ProjectContext } from '../types/project-context.js';
import { MissingReadmeRule } from './missing-readme.js';
import { BrokenLinksRule } from './broken-links.js';
import { UndocumentedScriptsRule } from './undocumented-scripts.js';
import { UndocumentedEnvRule } from './undocumented-env.js';
import { RuntimeVersionRule } from './runtime-version.js';
import { MentionedScriptExistsRule } from './mentioned-scripts.js';
import { ReadmeQualityRule } from './readme-quality.js';

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
    new MentionedScriptExistsRule(),
    new ReadmeQualityRule(),
  ];
}

export {
  MissingReadmeRule,
  BrokenLinksRule,
  UndocumentedScriptsRule,
  UndocumentedEnvRule,
  RuntimeVersionRule,
  MentionedScriptExistsRule,
  ReadmeQualityRule,
};
