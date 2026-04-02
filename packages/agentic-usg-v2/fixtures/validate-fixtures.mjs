import { readFileSync } from "node:fs";

const fixture = JSON.parse(readFileSync(new URL("./demo-scenario.json", import.meta.url), "utf8"));

if (!fixture.scenarioId || !fixture.activeSourceId) {
  throw new Error("fixture missing required fields");
}

console.log("fixture placeholder validation passed");
