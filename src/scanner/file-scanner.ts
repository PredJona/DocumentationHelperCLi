import fg from 'fast-glob';
import path from 'path';
import fs from 'fs/promises';

export class FileScanner {
  static async scan(rootPath: string): Promise<string[]> {
    const entries = await fg(['**/*'], {
      cwd: rootPath,
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/*.pem',
        '**/*.key',
        '**/*.p12',
        '**/*.bin',
        '**/*.exe',
        '**/*.jpg',
        '**/*.png',
        '**/*.gif',
        '**/*.pdf',
      ],
      dot: true,
      absolute: false,
    });
    return entries;
  }

  static async readFile(rootPath: string, relativePath: string): Promise<string> {
    const fullPath = path.join(rootPath, relativePath);
    return fs.readFile(fullPath, 'utf-8');
  }

  static async exists(rootPath: string, relativePath: string): Promise<boolean> {
    try {
      await fs.access(path.join(rootPath, relativePath));
      return true;
    } catch {
      return false;
    }
  }
}
