import {
  createContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { AccessibilityInfo } from 'react-native';
export const MotionContext = createContext({ reduced: false, loaded: false });
export function MotionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState({ reduced: false, loaded: false });
  useEffect(() => {
    let live = true;
    let eventReceived = false;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (reduced) => {
        eventReceived = true;
        setState({ reduced, loaded: true });
      },
    );
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (live && !eventReceived) setState({ reduced, loaded: true });
      })
      .catch(() => {
        if (live && !eventReceived) setState({ reduced: true, loaded: true });
      });
    return () => {
      live = false;
      subscription.remove();
    };
  }, []);
  return (
    <MotionContext.Provider value={state}>{children}</MotionContext.Provider>
  );
}
