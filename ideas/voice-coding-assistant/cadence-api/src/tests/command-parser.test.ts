import { describe, it, expect } from 'vitest';
import { CommandParser } from '../services/command-parser.js';

describe('CommandParser', () => {
  const parser = new CommandParser();

  describe('create_task intent', () => {
    it('parses "add dark mode to the settings page"', async () => {
      const result = await parser.parse('add dark mode to the settings page');
      expect(result.intent).toBe('create_task');
      expect(result.task).toContain('dark mode');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('parses "create a new login form"', async () => {
      const result = await parser.parse('create a new login form');
      expect(result.intent).toBe('create_task');
    });

    it('parses "fix the bug in the checkout process"', async () => {
      const result = await parser.parse('fix the bug in the checkout process');
      expect(result.intent).toBe('create_task');
    });

    it('parses "implement error handling for the API"', async () => {
      const result = await parser.parse('implement error handling for the API');
      expect(result.intent).toBe('create_task');
    });

    it('extracts GitHub URL from command', async () => {
      const result = await parser.parse(
        'add tests to https://github.com/user/my-repo'
      );
      expect(result.intent).toBe('create_task');
      expect(result.repoUrl).toBe('https://github.com/user/my-repo');
    });
  });

  describe('check_status intent', () => {
    it('parses "what is the status"', async () => {
      const result = await parser.parse('what is the status');
      expect(result.intent).toBe('check_status');
    });

    it('parses "how is the task doing"', async () => {
      const result = await parser.parse('how is the task doing');
      expect(result.intent).toBe('check_status');
    });

    it('parses "check progress"', async () => {
      const result = await parser.parse('check progress');
      expect(result.intent).toBe('check_status');
    });
  });

  describe('cancel_task intent', () => {
    it('parses "cancel the task"', async () => {
      const result = await parser.parse('cancel the task');
      expect(result.intent).toBe('cancel_task');
    });

    it('parses "stop the agent"', async () => {
      const result = await parser.parse('stop the agent');
      expect(result.intent).toBe('cancel_task');
    });
  });

  describe('list_tasks intent', () => {
    it('parses "list all tasks"', async () => {
      const result = await parser.parse('list all tasks');
      expect(result.intent).toBe('list_tasks');
    });

    it('parses "show all agents"', async () => {
      const result = await parser.parse('show all agents');
      expect(result.intent).toBe('list_tasks');
    });

    it('parses "list my tasks"', async () => {
      const result = await parser.parse('list my tasks');
      expect(result.intent).toBe('list_tasks');
    });
  });

  describe('unknown intent', () => {
    it('returns unknown for gibberish', async () => {
      const result = await parser.parse('asdfghjkl');
      expect(result.intent).toBe('unknown');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('returns unknown for greetings', async () => {
      const result = await parser.parse('hello there');
      expect(result.intent).toBe('unknown');
    });
  });
});
