import { spawn } from "node:child_process";

async function runCommand(command, args, cwd) {
  return await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", () => {
      resolve({ status: 1, stdout, stderr });
    });

    child.on("close", (status) => {
      resolve({ status: status ?? 1, stdout, stderr });
    });
  });
}

export async function captureRepoState(cwd) {
  const [head, status] = await Promise.all([
    runCommand("git", ["rev-parse", "HEAD"], cwd),
    runCommand("git", ["status", "--short"], cwd),
  ]);

  const statusLines = status.status === 0
    ? status.stdout
        .split("\n")
        .map((line) => line.trimEnd())
        .filter(Boolean)
    : [];

  return {
    head: head.status === 0 ? head.stdout.trim() : null,
    status_lines: statusLines,
    changed_files: statusLines.map((line) => line.slice(3)).filter(Boolean),
  };
}
