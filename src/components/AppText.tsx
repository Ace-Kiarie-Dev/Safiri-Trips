import { Text, type TextProps } from 'react-native';

import { typography, type ColorTokens, type TextVariant } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Props = TextProps & {
  variant?: TextVariant;
  tone?: keyof Pick<ColorTokens, 'ink' | 'muted' | 'primary' | 'onPrimary' | 'onAccent' | 'danger'>;
};

export function AppText({ variant = 'body', tone = 'ink', style, ...rest }: Props) {
  const colors = useColors();
  return <Text {...rest} style={[typography[variant], { color: colors[tone] }, style]} />;
}
