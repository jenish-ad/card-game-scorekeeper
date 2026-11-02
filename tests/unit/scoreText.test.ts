/* eslint-disable @typescript-eslint/no-require-imports -- Native mocks must be registered before loading components. */
import { test, expect, jest } from '@jest/globals';
import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { lightTheme } from '@/theme/tokens';

jest.mock('react-native', () => ({
  Text: 'Text',
  AccessibilityInfo: {
    isReduceMotionEnabled: jest.fn(async () => false),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));
jest.mock('@/theme/useTheme', () => ({ useTheme: () => lightTheme }));
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { Text: 'Text' },
  cancelAnimation: jest.fn(),
  withTiming: jest.fn((value: number) => value),
  useAnimatedStyle: (factory: () => unknown) => factory(),
  useSharedValue: (value: number) => {
    const { useRef } = require('react');
    return useRef({ get: () => value, set: jest.fn() }).current;
  },
}));
const { ScoreText } =
  require('@/ui/ScoreText') as typeof import('@/ui/ScoreText');
const { MotionContext, MotionProvider } =
  require('@/theme/MotionProvider') as typeof import('@/theme/MotionProvider');
const { AccessibilityInfo } =
  require('react-native') as typeof import('react-native');
const { withTiming } = require('react-native-reanimated');
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

test('ScoreText immediately renders +25 on mount, and animates only opted-in updates', async () => {
  let tree!: ReactTestRenderer;
  const element = (value: number, animate = false, reduced = false) =>
    React.createElement(
      MotionContext.Provider,
      { value: { reduced, loaded: true } },
      React.createElement(ScoreText, { value, animate }),
    );
  jest.mocked(withTiming).mockClear();
  await act(async () => {
    tree = create(element(25, true));
  });
  expect(tree.root.findByType('Text' as never).props.children).toBe('+25');
  expect(withTiming).not.toHaveBeenCalled();
  await act(async () => tree.update(element(30)));
  expect(tree.root.findByType('Text' as never).props.children).toBe('+30');
  expect(withTiming).not.toHaveBeenCalled();
  await act(async () => tree.update(element(40, true)));
  expect(withTiming).toHaveBeenCalledTimes(1);
  await act(async () => tree.update(element(50, true, true)));
  expect(tree.root.findByType('Text' as never).props.children).toBe('+50');
  expect(withTiming).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});
test('MotionProvider reads and subscribes once for multiple consumers', async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockClear();
  jest.mocked(AccessibilityInfo.addEventListener).mockClear();
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(
      React.createElement(
        MotionProvider,
        null,
        React.createElement(ScoreText, { value: 1 }),
        React.createElement(ScoreText, { value: 2 }),
      ),
    );
  });
  expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalledTimes(1);
  expect(AccessibilityInfo.addEventListener).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});
