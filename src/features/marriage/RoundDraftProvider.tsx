import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';
import type { MarriageRoundInput } from './scoring';

export interface RoundDraft {
  matchId: number;
  roundId?: number;
  input: MarriageRoundInput;
}
const DraftContext = createContext<{
  draft: RoundDraft | null;
  setDraft: (draft: RoundDraft | null) => void;
} | null>(null);
export function RoundDraftProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<RoundDraft | null>(null);
  return (
    <DraftContext.Provider value={{ draft, setDraft }}>
      {children}
    </DraftContext.Provider>
  );
}
export function useRoundDraft() {
  const context = useContext(DraftContext);
  if (!context) throw new Error('Round draft provider is missing.');
  return context;
}
