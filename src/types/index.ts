export interface DiseaseProbability {
  disease: string;
  probability: number;
  description: string;
}

export interface AnalysisResult {
  id: string;
  date: string;
  imageUrl: string;
  riskLevel: 'low' | 'medium' | 'high';
  abcde: {
    asymmetry: { description: string; score: number };
    border: { description: string; score: number };
    color: { description: string; score: number };
    diameter: { description: string; score: number };
    evolving: { description: string; score: number };
  };
  summary: string;
  recommendation: string;
  recommendedTreatment?: string;
  dailyCare?: string;
  medicalAdvice?: string;
  diseases?: DiseaseProbability[];
  initialQuestion?: string;
  patientInfo?: {
    age?: string;
    gender?: string;
    blood_type?: string;
    height?: string;
    weight?: string;
  };
}

export interface UserProfile {
  name: string;
  age: number;
  skinType: string;
  history: AnalysisResult[];
}

export interface Knowledge {
  id: number;
  title: string;
  category?: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}
