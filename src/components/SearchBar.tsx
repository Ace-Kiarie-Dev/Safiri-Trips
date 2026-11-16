import { StyleSheet, TextInput, View } from 'react-native';

import { fonts, layout, radius, shadow, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { Icon } from './Icon';

const MAX_QUERY_LENGTH = 80;

type Props = { value: string; onChangeText: (text: string) => void; onSubmit?: () => void };

export function SearchBar({ value, onChangeText, onSubmit }: Props) {
  const c = useColors();
  return (
    <View style={[styles.bar, { backgroundColor: c.surface }]}>
      <Icon name="search" size={22} color={c.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        maxLength={MAX_QUERY_LENGTH}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Search places in Kenya"
        placeholder="Search places in Kenya"
        placeholderTextColor={c.muted}
        style={[styles.input, { color: c.ink }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: layout.searchBarHeight,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    ...shadow.card,
  },
  input: { flex: 1, minHeight: layout.tapTarget, fontFamily: fonts.body, fontSize: 16 },
});
