import { ScoreText } from './ScoreText';
export function Score({
  value,
  compact = false,
}: {
  value: number;
  compact?: boolean;
}) {
  return <ScoreText value={value} size={compact ? 'sm' : 'lg'} />;
}
