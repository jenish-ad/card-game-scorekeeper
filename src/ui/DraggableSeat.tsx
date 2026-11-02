import { t } from '../i18n';
import { useMemo, useState, type PropsWithChildren } from 'react';
import { Animated, PanResponder, View } from 'react-native';
import { useTheme } from '../useTheme';
import { Icon } from './Icon';
import { PlayerAvatar } from './PlayerAvatar';

export function DraggableSeat({
  seat,
  name,
  move,
  children,
}: PropsWithChildren<{
  seat: number;
  name: string;
  move: (offset: number) => void;
}>) {
  const theme = useTheme();
  const [offset] = useState(() => new Animated.Value(0));
  const [height, setHeight] = useState(64);
  const [dragging, setDragging] = useState(false);
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => setDragging(true),
        onPanResponderMove: (_, gesture) => offset.setValue(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          move(Math.round(gesture.dy / height));
          offset.setValue(0);
          setDragging(false);
        },
        onPanResponderTerminate: () => {
          offset.setValue(0);
          setDragging(false);
        },
      }),
    [offset, height, move],
  );
  return (
    <Animated.View
      onLayout={({ nativeEvent }) => {
        setHeight(nativeEvent.layout.height + theme.spacing.sm);
      }}
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 8 },
        {
          marginBottom: theme.spacing.sm,
          backgroundColor: dragging
            ? theme.colors.goldTint
            : theme.colors.surface,
          ...theme.shadows.card,
          borderRadius: theme.radius.button,
          paddingHorizontal: theme.spacing.sm,
          transform: [{ translateY: offset }],
          zIndex: dragging ? 1 : 0,
        },
      ]}
    >
      <View
        {...responder.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('Seat {p0}, {p1}. Drag to reorder.', {
          p0: seat,
          p1: name || t('unnamed player'),
        })}
        accessibilityActions={[
          { name: 'increment', label: t('Move down') },
          { name: 'decrement', label: t('Move up') },
        ]}
        onAccessibilityAction={({ nativeEvent }) =>
          move(nativeEvent.actionName === 'increment' ? 1 : -1)
        }
        style={{
          minWidth: theme.touchTarget,
          minHeight: theme.touchTarget,
          flexDirection: 'row',
          gap: theme.spacing.xs,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon name="reorder-two" size={18} color={theme.colors.mutedText} />
      </View>
      <PlayerAvatar name={name} colorIndex={seat - 1} size={36} />
      {children}
    </Animated.View>
  );
}
