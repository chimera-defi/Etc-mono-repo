# Spec Kit Demo - Task Planner

A minimal viable demo of **spec-driven development** using a task planning assistant.

## 🎯 What This Demo Shows

1. **Specification-First**: The AI behavior is defined in `specs/task-planner.md`
2. **Validation**: Responses are validated against the spec
3. **Re-prompting**: Failed validations can guide correction
4. **Integration with Cursor/Opus 4.5**: Generates prompts for manual use

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate a prompt for Cursor/Opus 4.5
npx tsx src/index.ts prompt "Build a todo list web app with React"

# Copy the prompt to your AI, get a response, save as response.json

# Validate the response
npx tsx src/index.ts validate response.json
```

## 📁 Project Structure

```
demo/
├── specs/
│   └── task-planner.md     # The specification (source of truth)
├── src/
│   ├── index.ts            # CLI entry point
│   ├── planner.ts          # Core planning logic
│   ├── validator.ts        # Spec-based validation
│   └── types.ts            # TypeScript types
├── test/
│   ├── sample-response.json    # Valid example
│   └── invalid-response.json   # Invalid example for testing
└── package.json
```

## 📋 Commands

### Generate Prompt
```bash
npx tsx src/index.ts prompt "Your project description here"
```
Outputs a complete prompt including the spec for use with Cursor/Opus 4.5.

### Validate Response
```bash
npx tsx src/index.ts validate path/to/response.json
```
Validates a JSON response against the task-planner spec.

### View Specification
```bash
npx tsx src/index.ts spec
```
Displays the complete task-planner specification.

## 🧪 Testing Validation

```bash
# Test with valid response
npx tsx src/index.ts validate test/sample-response.json

# Test with invalid response (should fail)
npx tsx src/index.ts validate test/invalid-response.json
```

## 📖 The Specification

The spec (`specs/task-planner.md`) defines:

- **Intent**: What the AI should do
- **Inputs**: Expected input format
- **Outputs**: Required JSON schema
- **Constraints**: Rules that must be followed
- **Validation Rules**: How to check correctness
- **Examples**: Sample inputs and outputs

## 🔄 Workflow

1. **Write Spec** → Define behavior in Markdown
2. **Generate Prompt** → Include spec in AI prompt  
3. **Get Response** → AI generates structured output
4. **Validate** → Check against spec constraints
5. **Iterate** → Fix issues and re-validate

## 🤝 Integration with Cursor/Opus 4.5

This demo is designed to work with Cursor's AI features:

1. Run `npx tsx src/index.ts prompt "your project"` 
2. Copy the generated prompt
3. Paste into Cursor's AI chat (Cmd/Ctrl + L)
4. Save the JSON response to a file
5. Validate with `npx tsx src/index.ts validate response.json`

## 📊 Spec-Driven Benefits

- **Consistency**: Same spec = same expectations
- **Testability**: Automated validation of AI outputs
- **Traceability**: Clear link between requirements and behavior
- **Iteration**: Validation errors guide improvement
- **Documentation**: Spec serves as living documentation
