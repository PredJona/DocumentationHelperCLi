import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cliPath = path.resolve(__dirname, '../dist/index.js');
const validFixture = path.resolve(__dirname, 'fixtures/valid-project');

describe('CLI Integration', () => {
  it('runs analyze command and outputs valid JSON on valid-project fixture', async () => {
    const { stdout } = await execFileAsync(process.execPath, [cliPath, 'analyze', validFixture, '--format', 'json']);
    const output = JSON.parse(stdout);
    expect(output.score).toBe(100);
    expect(output.summary.totalFindings).toBe(0);
    expect(output.summary.errors).toBe(0);
    expect(output.summary.warnings).toBe(0);
    expect(output.summary.suggestions).toBe(0);
    expect(output.analyzedPath).toBe(validFixture);
    expect(Array.isArray(output.rulesRun)).toBe(true);
  });
});
