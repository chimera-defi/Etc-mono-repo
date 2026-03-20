import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export async function listBackupManifests(backupRoot, maxEntries = 10) {
  try {
    const entries = await readdir(backupRoot, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

    return await Promise.all(
      directories
        .sort((left, right) => right.localeCompare(left))
        .slice(0, maxEntries)
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
  } catch {
    return [];
  }
}
