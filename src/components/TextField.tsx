import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fonts, layout, radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';

type Props = Omit<TextInputProps, 'style'> & { label: string };

export function TextField({ label, ...input }: Props) {
  const c = useColors();
  return (
    <View style={styles.wrap}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        {...input}
        style={[styles.input, { color: c.ink, backgroundColor: c.surface, borderColor: c.line }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  input: {
    minHeight: layout.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    fontFamily: fonts.body,
    fontSize: 16,
  },
});
