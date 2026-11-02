import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { devanagariFonts } from '@/theme/tokens';
import { feedback } from '@/lib/feedback';
export function SegmentedControl<T extends string | boolean>({
  value,
  options,
  onChange,
  label,
  filled = false,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
  filled?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radius.chip,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((option) => (
        <Pressable
          key={String(option.value)}
          accessibilityRole="radio"
          accessibilityState={{ checked: option.value === value }}
          onPress={() => {
            void feedback('selection');
            onChange(option.value);
          }}
          style={({ pressed }) => [
            {
              flex: 1,
              minWidth: 0,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 8,
              paddingVertical: 8,
              borderRadius: theme.radius.chip,
              backgroundColor:
                option.value === value
                  ? filled
                    ? theme.colors.ink
                    : theme.colors.surface
                  : 'transparent',
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            option.value === value && theme.shadows.card,
          ]}
        >
          <Text
            style={{
              fontFamily: /[\u0900-\u0965\u0970-\u097f]/.test(option.label)
                ? devanagariFonts.semibold
                : theme.fonts.semibold,
              fontSize: /[\u0900-\u097f]/.test(option.label)
                ? 17
                : theme.type.label,
              textAlign: 'center',
              color:
                option.value === value
                  ? filled
                    ? theme.colors.onInk
                    : theme.colors.ink
                  : theme.colors.mutedText,
            }}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
