#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import { ProjectAnalyzer } from './analyzer/index.js';
import { formatText, formatJson } from './cli/formatter.js';

const program = new Command();

program
  .name('doccontext')
  .description('Analyzes a Node.js/TypeScript repo, checks documentation health, and generates AI context prompts.')
  .version('1.0.0');

program
  .command('analyze [path]')
  .description('Analyze project documentation health')
  .option('-f, --format <type>', 'output format (text|json)', 'text')
  .option('-v, --verbose', 'include detailed file and evidence information', false)
  .option('--fail-on <level>', 'failure threshold (error|warning|never)', 'error')
  .action(async (targetPath: string = '.', options: { format: string; verbose: boolean; failOn: string }) => {
    if (options.format !== 'text' && options.format !== 'json') {
      console.error(`Error: Invalid format "${options.format}". Allowed values are "text" or "json".`);
      process.exit(1);
    }

    if (options.failOn !== 'error' && options.failOn !== 'warning' && options.failOn !== 'never') {
      console.error(`Error: Invalid fail-on level "${options.failOn}". Allowed values are "error", "warning", or "never".`);
      process.exit(1);
    }

    const resolvedPath = path.resolve(targetPath);
    try {
      const stat = await fs.stat(resolvedPath);
      if (!stat.isDirectory()) {
        console.error(`Error: Path "${targetPath}" is not a directory.`);
        process.exit(1);
      }
    } catch {
      console.error(`Error: Path "${targetPath}" does not exist.`);
      process.exit(1);
    }

    try {
      const analyzer = new ProjectAnalyzer();
      const result = await analyzer.analyze(resolvedPath);

      if (options.format === 'json') {
        console.log(formatJson(result));
      } else {
        console.log(formatText(result, options.verbose));
      }

      let exitCode = 0;
      if (options.failOn === 'error') {
        if (result.summary.errors > 0) exitCode = 1;
      } else if (options.failOn === 'warning') {
        if (result.summary.errors > 0 || result.summary.warnings > 0) exitCode = 1;
      } else if (options.failOn === 'never') {
        exitCode = 0;
      }

      process.exit(exitCode);
    } catch (error: any) {
      console.error(`Unexpected error during analysis: ${error?.message || error}`);
      process.exit(1);
    }
  });

program.parse();
