/**
 * Task Planner - Spec-Driven AI Integration
 * 
 * This module demonstrates spec-driven development by:
 * 1. Loading the specification from specs/task-planner.md
 * 2. Using the spec to guide AI responses
 * 3. Validating responses against the spec
 * 4. Re-prompting if validation fails
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { TaskPlanResponse, PlannerOptions, ValidationResult } from './types.js';
import { validateTaskPlan, formatValidationErrors } from './validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load the task planner specification
 */
export function loadSpec(): string {
  const specPath = join(__dirname, '..', 'specs', 'task-planner.md');
  return readFileSync(specPath, 'utf-8');
}

/**
 * Build a prompt that includes the spec for AI guidance
 */
export function buildPrompt(projectDescription: string, validationErrors?: string): string {
  const spec = loadSpec();
  
  let prompt = `You are a task planning assistant. Follow this specification exactly:

${spec}

---

PROJECT TO PLAN:
${projectDescription}

---

INSTRUCTIONS:
1. Analyze the project description
2. Create a task breakdown following the spec above
3. Ensure your response is valid JSON matching the schema
4. Follow all constraints (max 10 tasks, required fields, valid priorities, etc.)

Respond with ONLY the JSON object, no markdown code blocks or extra text.`;

  if (validationErrors) {
    prompt += `

---

PREVIOUS ATTEMPT FAILED VALIDATION:
${validationErrors}

Please fix these issues and try again.`;
  }

  return prompt;
}

/**
 * Parse AI response to extract JSON
 */
export function parseResponse(response: string): unknown {
  // Try to parse directly first
  try {
    return JSON.parse(response);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    
    // Try to find JSON object in the response
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    
    throw new Error('Could not extract valid JSON from response');
  }
}

/**
 * Simulate AI call (replace with actual AI integration)
 * 
 * In real usage, this would call the AI API with the prompt.
 * For demo purposes, this returns a mock response.
 */
export async function callAI(prompt: string): Promise<string> {
  // This is a placeholder for actual AI integration
  // In Cursor/Opus 4.5, you would use the AI API here
  
  console.log('\n📝 Prompt sent to AI (first 500 chars):');
  console.log(prompt.substring(0, 500) + '...\n');
  
  // Return a mock response for testing
  // In real usage, replace this with actual AI call
  throw new Error(
    'AI integration not implemented. To use this demo:\n' +
    '1. Replace callAI() with your AI provider integration\n' +
    '2. Or use the prompt output with Cursor/Opus 4.5 directly'
  );
}

/**
 * Plan tasks for a project using spec-driven AI
 */
export async function planTasks(
  projectDescription: string,
  options: PlannerOptions = {}
): Promise<{ result: TaskPlanResponse; retries: number }> {
  const { maxRetries = 3, verbose = false } = options;
  
  let lastErrors: string | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (verbose) {
      console.log(`\n🔄 Attempt ${attempt + 1}/${maxRetries + 1}`);
    }
    
    // Build prompt with spec (and errors if retrying)
    const prompt = buildPrompt(projectDescription, lastErrors);
    
    try {
      // Call AI
      const response = await callAI(prompt);
      
      // Parse response
      const parsed = parseResponse(response);
      
      // Validate against spec
      const validation = validateTaskPlan(parsed);
      
      if (validation.valid) {
        if (verbose) {
          console.log('✅ Validation passed!');
        }
        return {
          result: parsed as TaskPlanResponse,
          retries: attempt,
        };
      }
      
      // Validation failed - prepare for retry
      lastErrors = formatValidationErrors(validation.errors);
      if (verbose) {
        console.log('❌ Validation failed:');
        console.log(lastErrors);
      }
      
    } catch (error) {
      if (verbose) {
        console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      lastErrors = `Parse error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  throw new Error(`Failed to generate valid plan after ${maxRetries + 1} attempts.\nLast errors:\n${lastErrors}`);
}

/**
 * Generate a prompt for manual use with Cursor/Opus 4.5
 */
export function generatePromptForManualUse(projectDescription: string): string {
  return buildPrompt(projectDescription);
}

/**
 * Validate a response manually (useful for testing AI outputs)
 */
export function validateResponse(response: string): ValidationResult & { parsed?: unknown } {
  try {
    const parsed = parseResponse(response);
    const validation = validateTaskPlan(parsed);
    return { ...validation, parsed };
  } catch (error) {
    return {
      valid: false,
      errors: [{
        path: '',
        message: `Parse error: ${error instanceof Error ? error.message : String(error)}`,
      }],
    };
  }
}
