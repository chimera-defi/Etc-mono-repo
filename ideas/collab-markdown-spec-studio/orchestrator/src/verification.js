import { spawn } from "node:child_process";

export const verificationCommands = [
  "bun run lint",
  "bun run test",
  "bun run build",
  "bun run test:e2e",
];

function runCommand(command, cwd) {
  return new Promise((resolve) => {
    const child = spawn("bash", ["-lc", command], {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const value = String(chunk);
      stdout += value;
      process.stdout.write(value);
    });

    child.stderr.on("data", (chunk) => {
      const value = String(chunk);
      stderr += value;
      process.stderr.write(value);
    });

    child.on("close", (status) => {
      resolve({
        command,
        status: status ?? 1,
        stdout,
        stderr,
      });
    });
  });
}

export async function runVerificationSuite(cwd) {
  const results = [];

  for (const command of verificationCommands) {
    const result = await runCommand(command, cwd);
    results.push(result);

    if (result.status !== 0) {
      break;
    }
  }

  return {
    ok: results.every((result) => result.status === 0),
    results,
  };
}
