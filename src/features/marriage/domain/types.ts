import type { MatchSettings, MarriageRoundInput } from './scoring';
export interface SavedPlayer {
  id: number;
  name: string;
  seat: number;
  colorIndex?: number;
  active: boolean;
}
export interface SavedRound {
  id: number;
  createdAt: string;
  input: MarriageRoundInput;
}
export interface SavedMatch {
  id: number;
  title: string;
  settings: MatchSettings;
  ruleVersion: string;
  createdAt: string;
  finishedAt: string | null;
  players: SavedPlayer[];
  rounds: SavedRound[];
}
