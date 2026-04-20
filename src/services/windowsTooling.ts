import { execFile, execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export function findVsWherePath(): string | undefined {
  const programFilesX86 = process.env['ProgramFiles(x86)'] ?? process.env.ProgramFiles;
  if (!programFilesX86) {
    return undefined;
  }

  const vswherePath = path.join(programFilesX86, 'Microsoft Visual Studio', 'Installer', 'vswhere.exe');
  return fs.existsSync(vswherePath) ? vswherePath : undefined;
}

export function findVsWhereMatchSync(args: string[]): string | undefined {
  const vswherePath = findVsWherePath();
  if (!vswherePath) {
    return undefined;
  }

  try {
    const output = execFileSync(vswherePath, args, {
      encoding: 'utf8',
      windowsHide: true,
    });
    return firstNonEmptyLine(output);
  } catch {
    return undefined;
  }
}

export async function findVsWhereMatch(args: string[]): Promise<string | undefined> {
  const vswherePath = findVsWherePath();
  if (!vswherePath) {
    return undefined;
  }

  try {
    const { stdout } = await execFileAsync(vswherePath, args, {
      windowsHide: true,
    });
    return firstNonEmptyLine(stdout);
  } catch {
    return undefined;
  }
}

function firstNonEmptyLine(output: string): string | undefined {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);
}
