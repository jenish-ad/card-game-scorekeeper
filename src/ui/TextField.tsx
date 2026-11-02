import { useState, type ComponentProps } from 'react';
import { TextInput } from 'react-native';
import { useTheme } from '../useTheme';
import { useStyles } from './Screen';
export function TextField({
  style,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof TextInput>) {
  const theme = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={theme.colors.mutedText}
      {...props}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[
        styles.input,
        style,
        {
          borderWidth: focused ? 2 : 1,
          borderColor: focused ? theme.colors.focus : theme.colors.hairline,
        },
      ]}
    />
  );
}
