/**
 * AI Prompt Templates for Task Planner
 * 
 * B-MAD Method - Developer Agent Output
 * Prompts are derived from PRD and Architecture docs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load a document from the docs folder
 */
function loadDoc(filename: string): string {
  const docPath = join(__dirname, '..', 'docs', filename);
  try {
    return readFileSync(docPath, 'utf-8');
  } catch {
    return `[Document ${filename} not found]`;
  }
}

/**
 * System prompt that establishes the AI's role and constraints
 */
export function getSystemPrompt(): string {
  return `You are a task planning assistant following the B-MAD methodology.

Your role is to break down project descriptions into structured, actionable tasks.

KEY CONSTRAINTS (from PRD):
- Maximum 10 tasks per plan
- Each task needs: id (TASK-N), title, description, priority, estimated_hours
- Priority must be: high, medium, or low
- Estimated hours: 0.5 to 40
- Task IDs must be unique and sequential
- Dependencies must reference valid task IDs

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "project_summary": "string (max 500 chars)",
  "tasks": [
    {
      "id": "TASK-1",
      "title": "string (max 100 chars)",
      "description": "string (max 500 chars)",
      "priority": "high | medium | low",
      "estimated_hours": number,
      "dependencies": ["TASK-N"],
      "tags": ["string"]
    }
  ],
  "total_estimated_hours": number
}`;
}

/**
 * User prompt template for plan generation
 */
export function getUserPrompt(projectDescription: string): string {
  return `PROJECT TO PLAN:
${projectDescription}

Generate a structured task breakdown following the constraints above.
Respond with ONLY the JSON object.`;
}

/**
 * Retry prompt when validation fails
 */
export function getRetryPrompt(projectDescription: string, errors: string): string {
  return `PROJECT TO PLAN:
${projectDescription}

PREVIOUS ATTEMPT FAILED VALIDATION:
${errors}

Fix these issues and try again. Respond with ONLY the JSON object.`;
}

/**
 * Get full prompt for manual use (includes system + user)
 */
export function getFullPrompt(projectDescription: string, errors?: string): string {
  const systemPrompt = getSystemPrompt();
  const userPrompt = errors 
    ? getRetryPrompt(projectDescription, errors)
    : getUserPrompt(projectDescription);
  
  return `${systemPrompt}

---

${userPrompt}`;
}

/**
 * Get PRD-aware prompt that references the actual PRD document
 */
export function getPrdAwarePrompt(projectDescription: string): string {
  const prd = loadDoc('prd.md');
  
  return `You are implementing features according to the following PRD:

${prd}

---

Now, for this specific project:
${projectDescription}

Generate a task breakdown that follows ALL requirements in the PRD above.
Respond with ONLY valid JSON matching the Output Specifications in section 4.2.`;
}
