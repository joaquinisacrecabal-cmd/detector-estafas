
export interface ScamAnalysis {
  probability: number;
  verdict: 'SEGURO' | 'SOSPECHOSO' | 'PELIGRO';
  redFlags: string[];
  socialEngineeringTricks: string[];
  visualInconsistencies: string[];
  recommendation: string;
  summary: string;
}

export interface AnalysisState {
  loading: boolean;
  result: ScamAnalysis | null;
  error: string | null;
  image: string | null;
}

export enum AnalysisType {
  CONVERSATION = 'CONVERSATION',
  RECEIPT = 'RECEIPT',
  PROFILE = 'PROFILE'
}
