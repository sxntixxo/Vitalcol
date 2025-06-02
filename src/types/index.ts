export type TriageStage = 'location_permission' | 'initial' | 'symptoms' | 'recommendation';

export type SeverityLevel = 'mild' | 'moderate' | 'severe';

export interface Message {
  sender: 'user' | 'ai';
  content: string;
  status?: 'sent' | 'delivered' | 'read' | 'pending' | 'error';
}

export interface Recommendation {
  title: string;
  description: string;
  action: string;
  icon?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}