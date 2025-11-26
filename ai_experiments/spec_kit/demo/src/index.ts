#!/usr/bin/env node
/**
 * Task Planner CLI - Spec-Driven Development Demo
 * 
 * This CLI demonstrates how to use specifications to guide AI behavior.
 * 
 * Usage:
 *   npx tsx src/index.ts prompt "Build a todo app"    # Generate prompt for AI
 *   npx tsx src/index.ts validate <response.json>     # Validate AI response
 *   npx tsx src/index.ts spec                         # Show the spec
 */

import { readFileSync } from 'fs';
import {
  loadSpec,
  generatePromptForManualUse,
  validateResponse,
} from './planner.js';
import { formatValidationErrors } from './validator.js';

const HELP = `
Task Planner CLI - Spec-Driven Development Demo

USAGE:
  npx tsx src/index.ts <command> [args]

COMMANDS:
  prompt <description>   Generate a prompt for use with AI
  validate <file>        Validate a JSON response file against the spec
  validate-inline        Validate JSON from stdin
  spec                   Display the task planner specification
  help                   Show this help message

EXAMPLES:
  # Generate a prompt to use with Cursor/Opus 4.5:
  npx tsx src/index.ts prompt "Build a todo list web app with React"

  # Validate an AI response:
  npx tsx src/index.ts validate response.json

  # View the specification:
  npx tsx src/index.ts spec

WORKFLOW:
  1. Use 'prompt' command to generate a spec-driven prompt
  2. Copy the prompt to Cursor/Opus 4.5
  3. Save the AI response to a JSON file
  4. Use 'validate' command to check the response
  5. If validation fails, use the errors to refine the response
`;

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'prompt': {
      const description = args.slice(1).join(' ');
      if (!description) {
        console.error('❌ Error: Please provide a project description');
        console.error('Usage: npx tsx src/index.ts prompt "Your project description"');
        process.exit(1);
      }
      
      console.log('═'.repeat(70));
      console.log('📋 SPEC-DRIVEN PROMPT FOR CURSOR/OPUS 4.5');
      console.log('═'.repeat(70));
      console.log('\nCopy the following prompt and paste it into your AI assistant:\n');
      console.log('─'.repeat(70));
      console.log(generatePromptForManualUse(description));
      console.log('─'.repeat(70));
      console.log('\n✅ After getting a response, validate it with:');
      console.log('   npx tsx src/index.ts validate <response-file.json>\n');
      break;
    }

    case 'validate': {
      const filePath = args[1];
      if (!filePath) {
        console.error('❌ Error: Please provide a JSON file path');
        console.error('Usage: npx tsx src/index.ts validate response.json');
        process.exit(1);
      }
      
      try {
        const content = readFileSync(filePath, 'utf-8');
        const result = validateResponse(content);
        
        console.log('═'.repeat(70));
        console.log('🔍 VALIDATION RESULT');
        console.log('═'.repeat(70));
        
        if (result.valid) {
          console.log('\n✅ Validation PASSED!\n');
          console.log('The response matches the task-planner specification.');
          
          if (result.parsed) {
            const plan = result.parsed as { tasks?: unknown[]; total_estimated_hours?: number };
            console.log(`\n📊 Summary:`);
            console.log(`   Tasks: ${plan.tasks?.length ?? 0}`);
            console.log(`   Total hours: ${plan.total_estimated_hours ?? 'N/A'}`);
          }
        } else {
          console.log('\n❌ Validation FAILED\n');
          console.log('Errors found:');
          console.log(formatValidationErrors(result.errors));
          console.log('\n💡 Fix these issues and validate again.');
          process.exit(1);
        }
      } catch (error) {
        console.error(`❌ Error reading file: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
      break;
    }

    case 'validate-inline': {
      let input = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => { input += chunk; });
      process.stdin.on('end', () => {
        const result = validateResponse(input);
        
        if (result.valid) {
          console.log('✅ Valid');
          process.exit(0);
        } else {
          console.log('❌ Invalid');
          console.log(formatValidationErrors(result.errors));
          process.exit(1);
        }
      });
      break;
    }

    case 'spec': {
      console.log('═'.repeat(70));
      console.log('📖 TASK PLANNER SPECIFICATION');
      console.log('═'.repeat(70));
      console.log();
      console.log(loadSpec());
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
