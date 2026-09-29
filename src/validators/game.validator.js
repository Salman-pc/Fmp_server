import { z } from 'zod';

export const createGameSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required').max(100),
    description: z.string().optional(),
    type: z.enum(['MULTIPLAYER', 'SINGLEPLAYER']).default('SINGLEPLAYER'),
    enabled: z.boolean().default(true),
    maxPlayers: z.number().min(1).max(10).default(4)
  })
});
