import fastifyFactory from 'fastify';

export const fastify = fastifyFactory({ logger: process.env.NODE_ENV !== 'test' })