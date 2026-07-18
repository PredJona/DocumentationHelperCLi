import { FileScanner } from '../scanner/file-scanner.js';

export class PackageJsonExtractor {
  static async extract(rootPath: string) {
    if (!(await FileScanner.exists(rootPath, 'package.json'))) {
      return null;
    }
    const content = await FileScanner.readFile(rootPath, 'package.json');
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
}
