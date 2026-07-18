export type Severity = "error" | "warning" | "suggestion";

export interface Finding {
  ruleId: string;
  severity: Severity;
  message: string;
  file?: string;
  line?: number;
  evidence?: string;
}

export interface ProjectContext {
  rootPath: string;
  packageManager: "npm" | "yarn" | "pnpm" | "unknown";
  projectType: "Node.js" | "TypeScript" | "unknown";
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  envVars: string[];
  envExampleVars: string[];
  nodeVersion?: string;
  files: string[];
  documentationFiles: string[];
  markdownASTs: Record<string, any>;
  rawFiles: Record<string, string>;
}
