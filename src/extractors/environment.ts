import { FileScanner } from '../scanner/file-scanner.js';

export class EnvironmentExtractor {
  static async extractFromCode(rootPath: string, files: string[]): Promise<string[]> {
    const envVars = new Set<string>();
    const envRegex = /process\.env\.([A-Z0-9_]+)/g;

    const sourceFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.js'));

    for (const file of sourceFiles) {
      try {
        const content = await FileScanner.readFile(rootPath, file);
        let match;
        while ((match = envRegex.exec(content)) !== null) {
          envVars.add(match[1]);
        }
      } catch {
        // Skip files that fail to read
      }
    }
    return Array.from(envVars);
  }

  static async extractFromExample(rootPath: string): Promise<string[]> {
    if (!(await FileScanner.exists(rootPath, '.env.example'))) {
      return [];
    }
    const content = await FileScanner.readFile(rootPath, '.env.example');
    const vars: string[] = [];
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key] = trimmed.split('=');
        if (key) vars.push(key.trim());
      }
    }
    return vars;
  }
}
