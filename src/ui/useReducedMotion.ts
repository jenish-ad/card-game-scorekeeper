import { useContext } from 'react';
import { MotionContext } from './MotionProvider';
export function useReducedMotion() {
  return useContext(MotionContext).reduced;
}

export function useMotionEnabled() {
  const { reduced, loaded } = useContext(MotionContext);
  return loaded && !reduced;
}
