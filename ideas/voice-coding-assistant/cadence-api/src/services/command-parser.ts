import { ParsedCommand } from '../types.js';

/**
 * Simple rule-based command parser.
 * In production, this could use Claude Haiku for more sophisticated parsing.
 */
export class CommandParser {
  // Patterns for different intents
  // Note: Order matters! More specific patterns should come before general ones
  private patterns = {
    create_task: [
      /^(start|create|run|execute|do|make|add|implement|fix|build|write|generate)/i,
      /on (?:the )?(?:repo(?:sitory)?|project|codebase)/i,
    ],
    list_tasks: [
      /^(list|show|display|get) ?(all|my)? ?(tasks|agents|jobs)/i,
      /what (tasks|agents|jobs)/i,
    ],
    cancel_task: [
      /^(cancel|stop|abort|kill|end|terminate)/i,
    ],
    check_status: [
      /^(what('s| is)|how('s| is)|check|status)/i,
      /(status|progress|state|doing|happening)/i,
    ],
  };

  async parse(text: string): Promise<ParsedCommand> {
    const normalizedText = text.toLowerCase().trim();

    // Check each intent pattern
    for (const [intent, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedText)) {
          return {
            intent: intent as ParsedCommand['intent'],
            task: this.extractTask(text, intent),
            repoUrl: this.extractRepoUrl(text),
            confidence: 0.8,
          };
        }
      }
    }

    // If no pattern matched but it looks like a task description
    if (normalizedText.length > 10 && this.looksLikeTask(normalizedText)) {
      return {
        intent: 'create_task',
        task: text,
        confidence: 0.6,
      };
    }

    return {
      intent: 'unknown',
      confidence: 0.3,
    };
  }

  private extractTask(text: string, intent: string): string | undefined {
    if (intent !== 'create_task') return undefined;

    // Remove common prefixes
    const prefixes = [
      /^(please |can you |could you |i want to |i need to )/i,
      /^(start |create |run |execute |do |make |add |implement |fix |build |write |generate )/i,
      /^(a |an |the )/i,
      /^(new )?(?:task|agent|job) (?:to |that |which )/i,
    ];

    let task = text;
    for (const prefix of prefixes) {
      task = task.replace(prefix, '');
    }

    return task.trim();
  }

  private extractRepoUrl(text: string): string | undefined {
    // Match GitHub URLs
    const githubPattern = /https?:\/\/github\.com\/[\w-]+\/[\w.-]+/i;
    const match = text.match(githubPattern);
    return match?.[0];
  }

  private looksLikeTask(text: string): boolean {
    // Contains action verbs commonly used in development tasks
    const actionVerbs = [
      'add', 'create', 'implement', 'fix', 'update', 'refactor',
      'remove', 'delete', 'change', 'modify', 'improve', 'optimize',
      'write', 'build', 'test', 'debug', 'deploy', 'configure',
    ];
    return actionVerbs.some(verb => text.includes(verb));
  }
}
