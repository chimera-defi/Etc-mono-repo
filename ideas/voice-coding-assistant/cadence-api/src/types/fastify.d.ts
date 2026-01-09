import '@fastify/jwt';
import { JWT } from '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    jwt: JWT;
  }
}
