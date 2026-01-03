import { FastifyPluginAsync } from 'fastify';
import { TranscribeRequestSchema, TranscribeResponse, ParsedCommand } from '../types.js';
import { WhisperService } from '../services/whisper.js';
import { CommandParser } from '../services/command-parser.js';

export const voiceRoutes: FastifyPluginAsync = async (app) => {
  const whisper = new WhisperService();
  const parser = new CommandParser();

  // Transcribe audio to text
  app.post('/voice/transcribe', async (request, reply) => {
    const parseResult = TranscribeRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid request',
        details: parseResult.error.issues,
      });
    }

    const { audio, format } = parseResult.data;

    try {
      const result = await whisper.transcribe(audio, format);
      return result;
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: 'Transcription failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Parse voice command into structured intent
  app.post<{ Body: { text: string } }>('/voice/parse', async (request, reply) => {
    const { text } = request.body;

    if (!text || typeof text !== 'string') {
      return reply.status(400).send({ error: 'text is required' });
    }

    try {
      const result = await parser.parse(text);
      return result;
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: 'Parsing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Combined: transcribe + parse
  app.post('/voice/command', async (request, reply) => {
    const parseResult = TranscribeRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid request',
        details: parseResult.error.issues,
      });
    }

    const { audio, format } = parseResult.data;

    try {
      // Step 1: Transcribe
      const transcription = await whisper.transcribe(audio, format);

      // Step 2: Parse
      const command = await parser.parse(transcription.text);

      return {
        transcription,
        command,
      };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: 'Voice command processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
};
