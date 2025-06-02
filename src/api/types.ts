import { z } from 'zod';

export const HospitalImageSchema = z.object({
  hospitalId: z.number(),
  name: z.string(),
  imageUrl: z.string().url(),
  imageAlt: z.string(),
});

export type HospitalImage = z.infer<typeof HospitalImageSchema>;

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}