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

export type TriageStage =
  | 'location_permission'
  | 'symptoms'
  | 'recommendation'
  | 'eps_selection'
  | 'initial';

export type Message = {
  sender: 'ai' | 'user';
  content: string;
};

export type SeverityLevel = 'mild' | 'moderate' | 'severe';

export type UserLocation = {
  lat: number;
  lng: number;
};