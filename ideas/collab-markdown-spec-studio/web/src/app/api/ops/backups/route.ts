import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

function getBackupRoot() {
  return path.resolve(process.cwd(), "..", "..", "..", ".backups", "specforge");
}

export async function GET() {
  const backupRoot = getBackupRoot();

  try {
    const entries = await readdir(backupRoot, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    const backups = await Promise.all(
      directories
        .sort((left, right) => right.localeCompare(left))
        .slice(0, 10)
        .map(async (directory) => {
          const manifestPath = path.join(backupRoot, directory, "manifest.json");
          const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

          return {
            name: directory,
            created_at: manifest.created_at,
            copied: manifest.copied,
            skipped: manifest.skipped,
          };
        }),
    );

    return NextResponse.json({
      backup_root: backupRoot,
      backups,
    });
  } catch {
    return NextResponse.json({
      backup_root: backupRoot,
      backups: [],
    });
  }
}
