import { PlayerAvatar } from './PlayerAvatar';
export function Avatar({
  name,
  size = 36,
  colorIndex = 0,
}: {
  name: string;
  size?: 24 | 28 | 36 | 44;
  colorIndex?: number;
}) {
  return <PlayerAvatar name={name} size={size} colorIndex={colorIndex} />;
}
