import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectAnalyzer, calculateScore } from '../src/analyzer/index.js';
import { MissingReadmeRule, BrokenLinksRule, UndocumentedEnvRule, UndocumentedScriptsRule } from '../src/rules/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (name: string) => path.resolve(__dirname, 'fixtures', name);

describe('Documentation Rules', () => {
  it('detects missing README (DOC001)', async () => {
    const analyzer = new ProjectAnalyzer([new MissingReadmeRule()]);
    const result = await analyzer.analyze(getFixturePath('missing-readme'));
    const doc001 = result.findings.filter(f => f.ruleId === 'DOC001');
    expect(doc001).toHaveLength(1);
    expect(doc001[0].severity).toBe('error');
    expect(doc001[0].message).toContain('README.md does not exist.');
  });

  it('detects broken local links and allows valid anchors/relative links (DOC002)', async () => {
    const analyzer = new ProjectAnalyzer([new BrokenLinksRule()]);
    const result = await analyzer.analyze(getFixturePath('broken-links'));
    const doc002 = result.findings.filter(f => f.ruleId === 'DOC002');
    expect(doc002).toHaveLength(1);
    expect(doc002[0].evidence).toBe('./docs/missing.md');
  });

  it('detects undocumented environment variables (DOC004)', async () => {
    const analyzer = new ProjectAnalyzer([new UndocumentedEnvRule()]);
    const result = await analyzer.analyze(getFixturePath('undocumented-env'));
    const doc004 = result.findings.filter(f => f.ruleId === 'DOC004');
    expect(doc004).toHaveLength(1);
    expect(doc004[0].evidence).toBe('BAR');
  });

  it('detects scripts defined in package.json not documented in README (DOC003)', async () => {
    const analyzer = new ProjectAnalyzer([new UndocumentedScriptsRule()]);
    const result = await analyzer.analyze(getFixturePath('undocumented-scripts'));
    const doc003 = result.findings.filter(f => f.ruleId === 'DOC003');
    expect(doc003).toHaveLength(1);
    expect(doc003[0].evidence).toBe('secret');
  });
});

describe('calculateScore', () => {
  it('starts at 100 and applies correct deductions per severity', () => {
    expect(calculateScore([])).toBe(100);
    expect(calculateScore([{ ruleId: 'R1', severity: 'error', message: 'err' }])).toBe(85);
    expect(calculateScore([{ ruleId: 'R2', severity: 'warning', message: 'warn' }])).toBe(93);
    expect(calculateScore([{ ruleId: 'R3', severity: 'suggestion', message: 'sugg' }])).toBe(97);
    expect(calculateScore([
      { ruleId: 'R1', severity: 'error', message: 'err' },
      { ruleId: 'R2', severity: 'warning', message: 'warn' },
      { ruleId: 'R3', severity: 'suggestion', message: 'sugg' },
    ])).toBe(100 - 15 - 7 - 3);
  });

  it('never returns below 0', () => {
    const findings = Array.from({ length: 10 }, () => ({
      ruleId: 'R',
      severity: 'error' as const,
      message: 'many errors'
    }));
    expect(calculateScore(findings)).toBe(0);
  });
});
