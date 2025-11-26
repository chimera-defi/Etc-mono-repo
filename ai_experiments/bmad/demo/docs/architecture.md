# Technical Architecture: Task Planner

> **B-MAD Method** - Architect Agent Output
> 
> This architecture document was created following B-MAD methodology.

## 1. Architecture Overview

### 1.1 System Context

```
┌─────────────────────────────────────────────────────────┐
│                      User                                │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │                Task Planner CLI                  │   │
│  │  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │   │
│  │  │  CLI    │→ │ Planner  │→ │   Validator   │  │   │
│  │  │ Parser  │  │  Module  │  │    Module     │  │   │
│  │  └─────────┘  └──────────┘  └───────────────┘  │   │
│  │                     │                           │   │
│  │                     ▼                           │   │
│  │              ┌──────────────┐                   │   │
│  │              │ AI Provider  │                   │   │
│  │              │(Cursor/Opus) │                   │   │
│  │              └──────────────┘                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Component Diagram

```
src/
├── index.ts          # CLI entry point
├── cli.ts            # Command parsing
├── planner.ts        # Core planning logic
├── validator.ts      # Schema validation
├── types.ts          # TypeScript types
└── prompts/
    └── task-planner.ts   # AI prompt templates
```

## 2. Component Design

### 2.1 CLI Module (`cli.ts`)

**Responsibility**: Parse command-line arguments and route to handlers.

**Interface**:
```typescript
interface CLIOptions {
  command: 'plan' | 'validate' | 'help';
  input?: string;
  file?: string;
  verbose?: boolean;
}

function parseArgs(args: string[]): CLIOptions;
function run(options: CLIOptions): Promise<void>;
```

**Commands**:
| Command | Arguments | Description |
|---------|-----------|-------------|
| `plan` | `<description>` | Generate task plan |
| `validate` | `<file>` | Validate JSON file |
| `help` | - | Show help |

### 2.2 Planner Module (`planner.ts`)

**Responsibility**: Generate task plans from project descriptions.

**Interface**:
```typescript
interface PlannerConfig {
  maxRetries: number;
  verbose: boolean;
}

async function planTasks(
  description: string, 
  config?: PlannerConfig
): Promise<TaskPlan>;

function buildPrompt(
  description: string, 
  errors?: string
): string;
```

**Algorithm**:
1. Build prompt with PRD constraints
2. Call AI provider
3. Parse JSON response
4. Validate against schema
5. If invalid, retry with errors
6. Return validated plan

### 2.3 Validator Module (`validator.ts`)

**Responsibility**: Validate task plans against schema.

**Interface**:
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function validateTaskPlan(plan: unknown): ValidationResult;
function formatErrors(errors: ValidationError[]): string;
```

**Validation Rules**:
1. Schema structure
2. Field constraints (length, range)
3. Business rules (unique IDs, valid dependencies)
4. Semantic rules (no circular dependencies)

### 2.4 Types Module (`types.ts`)

**Responsibility**: TypeScript type definitions.

```typescript
// Core types matching PRD specifications
type Priority = 'high' | 'medium' | 'low';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  estimated_hours: number;
  dependencies?: string[];
  tags?: string[];
}

interface TaskPlan {
  project_summary: string;
  tasks: Task[];
  total_estimated_hours: number;
}
```

### 2.5 Prompts Module (`prompts/task-planner.ts`)

**Responsibility**: AI prompt templates.

**Template Structure**:
```typescript
const SYSTEM_PROMPT = `
You are a task planning assistant.
Follow the PRD specifications exactly...
`;

const USER_PROMPT_TEMPLATE = `
Project: {description}

Generate a task breakdown following the schema...
`;

const RETRY_PROMPT_TEMPLATE = `
Previous attempt failed validation:
{errors}

Fix these issues and try again.
`;
```

## 3. Data Flow

### 3.1 Plan Generation Flow

```
User Input → CLI Parser → Planner → AI Provider → Response Parser 
                                                        ↓
                                                   Validator
                                                        ↓
                                              ┌─────────┴─────────┐
                                              │                   │
                                           Valid              Invalid
                                              │                   │
                                              ↓                   ↓
                                         Return Plan        Retry with
                                                           error feedback
```

### 3.2 Validation Flow

```
JSON Input → Parse → Schema Validation → Field Validation 
                                              ↓
                                     Business Rule Validation
                                              ↓
                                    ┌─────────┴─────────┐
                                    │                   │
                                  Pass                Fail
                                    │                   │
                                    ↓                   ↓
                             Return Success      Return Errors
```

## 4. Error Handling

### 4.1 Error Types

| Error Type | Handling Strategy |
|------------|-------------------|
| Parse Error | Return specific parse message |
| Validation Error | Return list of validation errors |
| AI Error | Retry up to max attempts |
| Network Error | Fail with connection message |

### 4.2 Retry Strategy

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: 1000,
  errorFeedback: true,  // Include errors in retry prompt
};
```

## 5. Configuration

### 5.1 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TASK_PLANNER_MAX_RETRIES` | Max retry attempts | 3 |
| `TASK_PLANNER_VERBOSE` | Enable verbose logging | false |

### 5.2 Default Configuration

```typescript
const DEFAULT_CONFIG = {
  maxRetries: 3,
  verbose: false,
  maxTasks: 10,
  minHours: 0.5,
  maxHours: 40,
};
```

## 6. Testing Strategy

### 6.1 Unit Tests

| Module | Test Coverage |
|--------|---------------|
| validator.ts | Schema validation, edge cases |
| cli.ts | Argument parsing |
| planner.ts | Prompt building, retry logic |

### 6.2 Integration Tests

| Scenario | Description |
|----------|-------------|
| Happy path | Valid input → valid output |
| Validation failure | Invalid schema → proper errors |
| Retry success | Fail first, succeed on retry |

## 7. Dependencies

### 7.1 Production
- None (pure Node.js)

### 7.2 Development
- `typescript`: Type checking
- `tsx`: Development runner
- `@types/node`: Node.js types

## 8. Security Considerations

1. **Input Sanitization**: Escape special characters in project descriptions
2. **Output Validation**: Always validate AI responses before use
3. **No Secrets**: No API keys or secrets in code

## 9. Performance Considerations

1. **Lazy Loading**: Load prompts only when needed
2. **Validation Short-circuit**: Fail fast on first critical error
3. **Streaming**: Consider streaming for large responses

---

*Generated by B-MAD Architect Agent • Version 1.0*
