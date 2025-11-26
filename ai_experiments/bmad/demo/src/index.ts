#!/usr/bin/env node
/**
 * Task Planner CLI - B-MAD Method Demo
 * 
 * This CLI demonstrates B-MAD's spec-driven approach using PRD and Architecture docs.
 * 
 * Usage:
 *   npx tsx src/index.ts prompt "Build a todo app"    # Generate prompt
 *   npx tsx src/index.ts prd-prompt "Build a todo app" # Generate PRD-aware prompt
 *   npx tsx src/index.ts validate response.json       # Validate response
 *   npx tsx src/index.ts docs                         # Show PRD and Architecture
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getFullPrompt, getPrdAwarePrompt } from './prompts.js';
import { validateTaskPlan, formatErrors } from './validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HELP = `
Task Planner CLI - B-MAD Method Demo

USAGE:
  npx tsx src/index.ts <command> [args]

COMMANDS:
  prompt <description>      Generate a basic spec-driven prompt
  prd-prompt <description>  Generate a prompt that includes the full PRD
  validate <file>           Validate a JSON response against PRD specs
  docs                      Display the PRD and Architecture documents
  help                      Show this help message

B-MAD METHODOLOGY:
  This demo follows B-MAD's spec-driven approach:
  1. PRD (docs/prd.md) defines product requirements
  2. Architecture (docs/architecture.md) defines technical design
  3. Implementation follows both documents
  4. Validation ensures compliance with PRD specs

EXAMPLES:
  # Generate a prompt with embedded specs:
  npx tsx src/index.ts prompt "Build a todo list web app"

  # Generate a prompt with full PRD:
  npx tsx src/index.ts prd-prompt "Build a todo list web app"

  # Validate an AI response:
  npx tsx src/index.ts validate response.json

  # View the specification documents:
  npx tsx src/index.ts docs
`;

function loadDoc(filename: string): string {
  const docPath = join(__dirname, '..', 'docs', filename);
  try {
    return readFileSync(docPath, 'utf-8');
  } catch {
    return `[Document ${filename} not found]`;
  }
}

function parseResponse(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[1] || match[0]);
    }
    throw new Error('Could not extract JSON from response');
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'prompt': {
      const description = args.slice(1).join(' ');
      if (!description) {
        console.error('❌ Error: Please provide a project description');
        process.exit(1);
      }
      
      console.log('═'.repeat(70));
      console.log('📋 B-MAD SPEC-DRIVEN PROMPT');
      console.log('═'.repeat(70));
      console.log('\nCopy this prompt to Cursor/Opus 4.5:\n');
      console.log('─'.repeat(70));
      console.log(getFullPrompt(description));
      console.log('─'.repeat(70));
      console.log('\n✅ Validate response with: npx tsx src/index.ts validate <file.json>\n');
      break;
    }

    case 'prd-prompt': {
      const description = args.slice(1).join(' ');
      if (!description) {
        console.error('❌ Error: Please provide a project description');
        process.exit(1);
      }
      
      console.log('═'.repeat(70));
      console.log('📋 B-MAD PRD-AWARE PROMPT');
      console.log('═'.repeat(70));
      console.log('\nThis prompt includes the full PRD for complete context:\n');
      console.log('─'.repeat(70));
      console.log(getPrdAwarePrompt(description));
      console.log('─'.repeat(70));
      break;
    }

    case 'validate': {
      const filePath = args[1];
      if (!filePath) {
        console.error('❌ Error: Please provide a JSON file path');
        process.exit(1);
      }
      
      try {
        const content = readFileSync(filePath, 'utf-8');
        const parsed = parseResponse(content);
        const result = validateTaskPlan(parsed);
        
        console.log('═'.repeat(70));
        console.log('🔍 B-MAD VALIDATION (PRD Compliance Check)');
        console.log('═'.repeat(70));
        
        if (result.valid) {
          console.log('\n✅ Validation PASSED!\n');
          console.log('The response complies with PRD section 4.2 (Output Specifications)');
          const plan = parsed as { tasks?: unknown[]; total_estimated_hours?: number };
          console.log(`\n📊 Summary:`);
          console.log(`   Tasks: ${plan.tasks?.length ?? 0}`);
          console.log(`   Total hours: ${plan.total_estimated_hours ?? 'N/A'}`);
        } else {
          console.log('\n❌ Validation FAILED\n');
          console.log('PRD compliance errors (see section 4.3):');
          console.log(formatErrors(result.errors));
          process.exit(1);
        }
      } catch (error) {
        console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
      break;
    }

    case 'docs': {
      console.log('═'.repeat(70));
      console.log('📖 B-MAD SPECIFICATION DOCUMENTS');
      console.log('═'.repeat(70));
      
      console.log('\n## PRD (Product Requirements Document)\n');
      console.log(loadDoc('prd.md'));
      
      console.log('\n' + '═'.repeat(70));
      console.log('\n## Architecture Document\n');
      console.log(loadDoc('architecture.md'));
      break;
    }

    case 'help':
    case '--help':
    case '-h':
    case undefined: {
      console.log(HELP);
      break;
    }

    default: {
      console.error(`❌ Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
    }
  }
}

main();
