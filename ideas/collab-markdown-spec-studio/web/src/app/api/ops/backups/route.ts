import path from "node:path";

import { NextResponse } from "next/server";
import { listBackupManifests } from "../../../../../../orchestrator/src/backups.js";

function getBackupRoot() {
  return path.resolve(process.cwd(), "..", "..", "..", ".backups", "specforge");
}

export async function GET() {
  const backupRoot = getBackupRoot();
  return NextResponse.json({
    backup_root: backupRoot,
    backups: await listBackupManifests(backupRoot),
  });
}
