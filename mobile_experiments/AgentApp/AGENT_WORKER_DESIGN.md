# Agent Worker Design

The Worker is the core intelligence - it runs inside a Docker container and executes AI-driven coding tasks.

## Table of Contents
1. [Overview](#overview)
2. [Entry Point](#entry-point)
3. [Agent Loop](#agent-loop)
4. [Tool Specifications](#tool-specifications)
5. [Claude API Integration](#claude-api-integration)
6. [Error Handling](#error-handling)
7. [Progress Reporting](#progress-reporting)
8. [Security Considerations](#security-considerations)

---

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Worker Container                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Agent Process                         │   │
│  │                                                          │   │
│  │   ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │   │
│  │   │  Entry   │───►│  Agent   │───►│ Progress Reporter│  │   │
│  │   │  Point   │    │   Loop   │    │                  │  │   │
│  │   └──────────┘    └────┬─────┘    └──────────────────┘  │   │
│  │                        │                                 │   │
│  │              ┌─────────┼─────────┐                       │   │
│  │              ▼         ▼         ▼                       │   │
│  │         ┌────────┐ ┌────────┐ ┌────────┐                │   │
│  │         │ Claude │ │  Tool  │ │  Git   │                │   │
│  │         │ Client │ │Executor│ │  Ops   │                │   │
│  │         └────────┘ └────────┘ └────────┘                │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /workspace (mounted volume)                             │   │
│  │  └── [cloned repository files]                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Entry Point

The worker receives configuration via environment variables:

```typescript
// Environment variables passed by coordinator
interface WorkerConfig {
  TASK_ID: string;              // Unique task identifier
  REPO_URL: string;             // GitHub repo URL (with token in URL)
  BRANCH: string;               // Branch to create (e.g., "agent/task-123")
  PROMPT: string;               // User's prompt
  CLAUDE_API_KEY: string;       // User's API key (decrypted)
  COORDINATOR_URL: string;      // Where to report progress
  WORKER_SECRET: string;        // Auth token for progress reports
  TIMEOUT_MS: string;           // Max execution time
}
```

### Startup Sequence

```typescript
// agent/index.ts
async function main() {
  const config = loadConfig();
  
  // 1. Report starting
  await reportProgress('starting', 'Agent starting...');
  
  try {
    // 2. Clone repository
    await reportProgress('cloning', `Cloning ${config.repoUrl}...`);
    await gitClone(config.repoUrl, '/workspace');
    
    // 3. Create branch
    await reportProgress('branching', `Creating branch ${config.branch}...`);
    await gitCheckout(config.branch);
    
    // 4. Run agent loop
    const result = await runAgentLoop(config.prompt);
    
    // 5. If changes made, commit and push
    if (result.filesChanged.length > 0) {
      await reportProgress('committing', 'Committing changes...');
      await gitCommit(result.commitMessage);
      
      await reportProgress('pushing', 'Pushing to remote...');
      await gitPush();
      
      await reportProgress('creating_pr', 'Creating pull request...');
      const prUrl = await createPullRequest(result);
      
      await reportComplete({
        success: true,
        summary: result.summary,
        filesChanged: result.filesChanged,
        prUrl,
      });
    } else {
      await reportComplete({
        success: true,
        summary: 'No changes needed.',
        filesChanged: [],
      });
    }
  } catch (error) {
    await reportError(error.message);
    process.exit(1);
  }
}

main();
```

---

## Agent Loop

The core loop that interacts with Claude:

```typescript
// agent/loop.ts
interface AgentResult {
  summary: string;
  filesChanged: string[];
  commitMessage: string;
}

async function runAgentLoop(prompt: string): Promise<AgentResult> {
  const messages: Message[] = [
    {
      role: 'user',
      content: buildSystemPrompt() + '\n\n' + prompt,
    },
  ];
  
  const filesChanged = new Set<string>();
  let iterationCount = 0;
  const maxIterations = 50; // Safety limit
  
  while (iterationCount < maxIterations) {
    iterationCount++;
    
    // Call Claude
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      tools: TOOL_DEFINITIONS,
      messages,
    });
    
    // Process response
    const assistantContent = response.content;
    messages.push({ role: 'assistant', content: assistantContent });
    
    // Check for tool use
    const toolUses = assistantContent.filter(
      (block) => block.type === 'tool_use'
    );
    
    if (toolUses.length === 0) {
      // No more tools, agent is done
      const textBlock = assistantContent.find((b) => b.type === 'text');
      return {
        summary: textBlock?.text || 'Task completed.',
        filesChanged: Array.from(filesChanged),
        commitMessage: generateCommitMessage(prompt, filesChanged),
      };
    }
    
    // Execute tools
    const toolResults: ToolResultBlock[] = [];
    
    for (const toolUse of toolUses) {
      await reportProgress('tool', `Running ${toolUse.name}...`, {
        tool: toolUse.name,
        input: toolUse.input,
      });
      
      try {
        const result = await executeTool(toolUse.name, toolUse.input);
        
        // Track file changes
        if (toolUse.name === 'write_file') {
          filesChanged.add(toolUse.input.path);
        }
        
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: result,
        });
      } catch (error) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: `Error: ${error.message}`,
          is_error: true,
        });
      }
    }
    
    // Add tool results to conversation
    messages.push({ role: 'user', content: toolResults });
  }
  
  throw new Error('Agent exceeded maximum iterations');
}
```

### System Prompt

```typescript
function buildSystemPrompt(): string {
  return `You are an expert software engineer working on a codebase.

You have access to the following tools:
- read_file: Read the contents of a file
- write_file: Write or overwrite a file
- list_directory: List files in a directory
- run_command: Run a shell command
- search_files: Search for text patterns in files

Guidelines:
1. Start by understanding the codebase structure (list_directory, read key files)
2. Make minimal, focused changes that address the user's request
3. Follow existing code style and conventions
4. Write clear commit messages
5. If you're unsure about something, state your assumptions

The repository has been cloned to /workspace. Work within this directory.

When you're done, provide a brief summary of what you changed and why.`;
}
```

---

## Tool Specifications

### read_file

```typescript
const readFileTool = {
  name: 'read_file',
  description: 'Read the contents of a file at the specified path.',
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Absolute path to the file (must start with /workspace)',
      },
      offset: {
        type: 'number',
        description: 'Line number to start reading from (1-indexed, optional)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of lines to read (optional, default 500)',
      },
    },
    required: ['path'],
  },
};

async function readFile(input: { 
  path: string; 
  offset?: number; 
  limit?: number; 
}): Promise<string> {
  // Validate path is within workspace
  if (!input.path.startsWith('/workspace')) {
    throw new Error('Path must be within /workspace');
  }
  
  const content = await fs.readFile(input.path, 'utf-8');
  const lines = content.split('\n');
  
  const offset = input.offset ? input.offset - 1 : 0;
  const limit = input.limit || 500;
  
  // Truncate if too large
  if (lines.length > limit) {
    const selected = lines.slice(offset, offset + limit);
    return selected.map((line, i) => `${offset + i + 1}|${line}`).join('\n')
      + `\n\n[Truncated: showing lines ${offset + 1}-${offset + limit} of ${lines.length}]`;
  }
  
  return lines.map((line, i) => `${i + 1}|${line}`).join('\n');
}
```

### write_file

```typescript
const writeFileTool = {
  name: 'write_file',
  description: 'Write content to a file, creating it if it doesn\'t exist or overwriting if it does.',
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Absolute path to the file (must start with /workspace)',
      },
      content: {
        type: 'string',
        description: 'The full content to write to the file',
      },
    },
    required: ['path', 'content'],
  },
};

async function writeFile(input: { path: string; content: string }): Promise<string> {
  if (!input.path.startsWith('/workspace')) {
    throw new Error('Path must be within /workspace');
  }
  
  // Create directory if needed
  const dir = path.dirname(input.path);
  await fs.mkdir(dir, { recursive: true });
  
  await fs.writeFile(input.path, input.content, 'utf-8');
  
  return `Successfully wrote ${input.content.length} bytes to ${input.path}`;
}
```

### list_directory

```typescript
const listDirectoryTool = {
  name: 'list_directory',
  description: 'List files and directories at the specified path.',
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Absolute path to the directory (must start with /workspace)',
      },
      recursive: {
        type: 'boolean',
        description: 'Whether to list recursively (default: false)',
      },
      ignore: {
        type: 'array',
        items: { type: 'string' },
        description: 'Glob patterns to ignore (e.g., ["node_modules", ".git"])',
      },
    },
    required: ['path'],
  },
};

async function listDirectory(input: { 
  path: string; 
  recursive?: boolean;
  ignore?: string[];
}): Promise<string> {
  if (!input.path.startsWith('/workspace')) {
    throw new Error('Path must be within /workspace');
  }
  
  const ignore = input.ignore || ['node_modules', '.git', 'dist', 'build'];
  
  if (input.recursive) {
    // Use fast-glob for recursive listing
    const files = await glob('**/*', {
      cwd: input.path,
      ignore,
      onlyFiles: false,
      markDirectories: true,
    });
    return files.slice(0, 500).join('\n'); // Limit output
  } else {
    const entries = await fs.readdir(input.path, { withFileTypes: true });
    return entries
      .filter((e) => !ignore.some((i) => e.name.includes(i)))
      .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
      .join('\n');
  }
}
```

### run_command

```typescript
const runCommandTool = {
  name: 'run_command',
  description: 'Run a shell command in the workspace. Use for tasks like running tests, installing dependencies, etc.',
  input_schema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The shell command to run',
      },
      cwd: {
        type: 'string',
        description: 'Working directory (default: /workspace)',
      },
      timeout: {
        type: 'number',
        description: 'Timeout in seconds (default: 60)',
      },
    },
    required: ['command'],
  },
};

async function runCommand(input: { 
  command: string; 
  cwd?: string;
  timeout?: number;
}): Promise<string> {
  const cwd = input.cwd || '/workspace';
  
  if (!cwd.startsWith('/workspace')) {
    throw new Error('Working directory must be within /workspace');
  }
  
  // Block dangerous commands
  const blocked = ['rm -rf /', 'sudo', 'chmod 777', ':(){', 'mkfs'];
  if (blocked.some((b) => input.command.includes(b))) {
    throw new Error('Command blocked for security reasons');
  }
  
  const timeout = (input.timeout || 60) * 1000;
  
  try {
    const { stdout, stderr } = await execAsync(input.command, {
      cwd,
      timeout,
      maxBuffer: 1024 * 1024, // 1MB
    });
    
    let output = '';
    if (stdout) output += `stdout:\n${stdout}\n`;
    if (stderr) output += `stderr:\n${stderr}\n`;
    return output || 'Command completed with no output.';
  } catch (error) {
    if (error.killed) {
      throw new Error(`Command timed out after ${input.timeout}s`);
    }
    throw new Error(`Command failed: ${error.message}\n${error.stderr || ''}`);
  }
}
```

### search_files

```typescript
const searchFilesTool = {
  name: 'search_files',
  description: 'Search for a pattern in files using ripgrep.',
  input_schema: {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'The regex pattern to search for',
      },
      path: {
        type: 'string',
        description: 'Directory to search in (default: /workspace)',
      },
      file_pattern: {
        type: 'string',
        description: 'Glob pattern for files to include (e.g., "*.ts")',
      },
      case_sensitive: {
        type: 'boolean',
        description: 'Whether search is case-sensitive (default: false)',
      },
    },
    required: ['pattern'],
  },
};

async function searchFiles(input: {
  pattern: string;
  path?: string;
  file_pattern?: string;
  case_sensitive?: boolean;
}): Promise<string> {
  const searchPath = input.path || '/workspace';
  
  if (!searchPath.startsWith('/workspace')) {
    throw new Error('Path must be within /workspace');
  }
  
  const args = ['rg', '--json'];
  
  if (!input.case_sensitive) {
    args.push('-i');
  }
  
  if (input.file_pattern) {
    args.push('-g', input.file_pattern);
  }
  
  args.push('--', input.pattern, searchPath);
  
  try {
    const { stdout } = await execAsync(args.join(' '), {
      maxBuffer: 2 * 1024 * 1024, // 2MB
    });
    
    // Parse JSON output and format nicely
    const lines = stdout.trim().split('\n').filter(Boolean);
    const matches = lines
      .map((l) => JSON.parse(l))
      .filter((m) => m.type === 'match')
      .slice(0, 100); // Limit results
    
    return matches
      .map((m) => `${m.data.path.text}:${m.data.line_number}:${m.data.lines.text.trim()}`)
      .join('\n') || 'No matches found.';
  } catch (error) {
    if (error.code === 1) {
      return 'No matches found.';
    }
    throw error;
  }
}
```

### Tool Registry

```typescript
const TOOLS = {
  read_file: readFile,
  write_file: writeFile,
  list_directory: listDirectory,
  run_command: runCommand,
  search_files: searchFiles,
};

const TOOL_DEFINITIONS = [
  readFileTool,
  writeFileTool,
  listDirectoryTool,
  runCommandTool,
  searchFilesTool,
];

async function executeTool(name: string, input: any): Promise<string> {
  const tool = TOOLS[name];
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return await tool(input);
}
```

---

## Claude API Integration

### Client Setup

```typescript
import Anthropic from '@anthropic-ai/sdk';

const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
```

### Streaming (Optional Enhancement)

```typescript
async function streamResponse(messages: Message[]): AsyncGenerator<string> {
  const stream = await claude.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    tools: TOOL_DEFINITIONS,
    messages,
  });
  
  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      if (event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}
```

### Rate Limit Handling

```typescript
async function callClaudeWithRetry(
  messages: Message[],
  maxRetries = 3
): Promise<Anthropic.Message> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        tools: TOOL_DEFINITIONS,
        messages,
      });
    } catch (error) {
      lastError = error;
      
      if (error.status === 429) {
        // Rate limited - wait and retry
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await reportProgress('waiting', `Rate limited, waiting ${waitTime / 1000}s...`);
        await sleep(waitTime);
      } else if (error.status >= 500) {
        // Server error - retry
        await sleep(1000);
      } else {
        // Client error - don't retry
        throw error;
      }
    }
  }
  
  throw lastError;
}
```

---

## Error Handling

### Error Types

```typescript
class AgentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = false
  ) {
    super(message);
  }
}

const ErrorCodes = {
  CLONE_FAILED: 'CLONE_FAILED',
  TOOL_FAILED: 'TOOL_FAILED',
  API_ERROR: 'API_ERROR',
  TIMEOUT: 'TIMEOUT',
  MAX_ITERATIONS: 'MAX_ITERATIONS',
  PUSH_FAILED: 'PUSH_FAILED',
  PR_FAILED: 'PR_FAILED',
};
```

### Error Recovery

```typescript
async function runAgentLoopWithRecovery(prompt: string): Promise<AgentResult> {
  try {
    return await runAgentLoop(prompt);
  } catch (error) {
    // Log the full error
    console.error('Agent error:', error);
    
    // Try to commit partial changes if any
    const status = await git.status();
    if (status.modified.length > 0 || status.not_added.length > 0) {
      await reportProgress('recovering', 'Saving partial changes...');
      await gitCommit('[WIP] Partial changes before error');
      await gitPush();
    }
    
    throw error;
  }
}
```

---

## Progress Reporting

### Report Structure

```typescript
interface ProgressReport {
  task_id: string;
  status: string;
  message?: string;
  tool_call?: {
    name: string;
    input: Record<string, any>;
  };
  timestamp: string;
}

async function reportProgress(
  status: string,
  message?: string,
  toolCall?: { name: string; input: any }
): Promise<void> {
  const report: ProgressReport = {
    task_id: process.env.TASK_ID,
    status,
    message,
    tool_call: toolCall,
    timestamp: new Date().toISOString(),
  };
  
  try {
    await fetch(`${process.env.COORDINATOR_URL}/internal/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Worker-Secret': process.env.WORKER_SECRET,
      },
      body: JSON.stringify(report),
    });
  } catch (error) {
    // Log but don't fail - progress reporting is best-effort
    console.error('Failed to report progress:', error.message);
  }
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `starting` | Agent is initializing |
| `cloning` | Cloning repository |
| `branching` | Creating branch |
| `thinking` | Claude is generating response |
| `tool` | Executing a tool |
| `waiting` | Waiting (e.g., rate limit) |
| `committing` | Creating commit |
| `pushing` | Pushing to remote |
| `creating_pr` | Creating pull request |
| `recovering` | Recovering from error |

---

## Security Considerations

### Path Traversal Prevention

```typescript
function validatePath(userPath: string): string {
  const resolved = path.resolve('/workspace', userPath);
  
  if (!resolved.startsWith('/workspace/')) {
    throw new Error('Path traversal attempt blocked');
  }
  
  return resolved;
}
```

### Command Injection Prevention

```typescript
function sanitizeCommand(command: string): string {
  // Block shell metacharacters in interpolated values
  // Note: We allow the full command, but block obvious attacks
  
  const dangerous = [
    /;\s*rm\s+-rf/i,
    /\|\s*sh/i,
    /`.*`/,
    /\$\(.*\)/,
    />\s*\/etc/i,
    /curl.*\|\s*(ba)?sh/i,
  ];
  
  for (const pattern of dangerous) {
    if (pattern.test(command)) {
      throw new Error('Potentially dangerous command blocked');
    }
  }
  
  return command;
}
```

### API Key Handling

```typescript
// API key is passed via env var, never logged
const apiKey = process.env.CLAUDE_API_KEY;

// Redact in error messages
function safeError(error: Error): Error {
  let message = error.message;
  if (apiKey) {
    message = message.replace(apiKey, '[REDACTED]');
  }
  return new Error(message);
}
```

### Resource Limits

The container is started with limits:

```typescript
// In coordinator's spawner.ts
const container = await docker.createContainer({
  Image: 'agent-worker:latest',
  Env: envVars,
  HostConfig: {
    Memory: 2 * 1024 * 1024 * 1024,  // 2GB
    MemorySwap: 2 * 1024 * 1024 * 1024, // No swap
    CpuPeriod: 100000,
    CpuQuota: 100000, // 1 CPU
    PidsLimit: 100,   // Max 100 processes
    NetworkMode: 'agent-network', // Restricted network
  },
});
```

---

## File Structure

```
docker/worker/
├── Dockerfile
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts           # Entry point
    ├── config.ts          # Load environment config
    ├── loop.ts            # Agent loop
    ├── claude.ts          # Claude API client
    ├── tools/
    │   ├── index.ts       # Tool registry
    │   ├── readFile.ts
    │   ├── writeFile.ts
    │   ├── listDirectory.ts
    │   ├── runCommand.ts
    │   └── searchFiles.ts
    ├── git/
    │   ├── clone.ts
    │   ├── commit.ts
    │   ├── push.ts
    │   └── pr.ts
    ├── progress.ts        # Progress reporting
    └── errors.ts          # Error types
```

---

## Dockerfile

```dockerfile
FROM node:20-alpine

# Install git and ripgrep
RUN apk add --no-cache git ripgrep

# Create non-root user
RUN adduser -D agent
USER agent
WORKDIR /home/agent

# Copy package files
COPY --chown=agent:agent package*.json ./
RUN npm ci --production

# Copy source
COPY --chown=agent:agent src/ ./src/
COPY --chown=agent:agent tsconfig.json ./

# Build TypeScript
RUN npm run build

# Create workspace directory
RUN mkdir /workspace
WORKDIR /workspace

# Run agent
CMD ["node", "/home/agent/dist/index.js"]
```

---

**Document Status**: Ready for Review  
**Last Updated**: December 2025
