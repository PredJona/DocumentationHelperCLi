import { FileScanner } from '../scanner/file-scanner.js';

export class RuntimeExtractor {
  static async extractNodeVersion(rootPath: string, packageJson: any): Promise<string | undefined> {
    // 1. Check .nvmrc
    if (await FileScanner.exists(rootPath, '.nvmrc')) {
      const content = await FileScanner.readFile(rootPath, '.nvmrc');
      return content.trim();
    }

    // 2. Check package.json engines
    if (packageJson?.engines?.node) {
      return packageJson.engines.node;
    }

    // 3. Check Dockerfile
    if (await FileScanner.exists(rootPath, 'Dockerfile')) {
      const content = await FileScanner.readFile(rootPath, 'Dockerfile');
      const match = /FROM\s+node:([\d.]+)/i.exec(content);
      if (match) return match[1];
    }

    return undefined;
  }
}
