import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { LogoTile } from '@/components/LogoTile';
import { layout, radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Props = {
  visible: boolean;
  tripTitle: string;
  onPicture: () => void;
  onText: () => void;
  onClose: () => void;
};

/** On-brand replacement for the system dialog: a bottom sheet with two big choices. */
export function ShareChooser({ visible, tripTitle, onPicture, onText, onClose }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();

  const option = (
    icon: IconName,
    title: string,
    sub: string,
    tint: string,
    onPress: () => void,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}`}
      android_ripple={{ color: c.line }}
      onPress={onPress}
      style={[styles.option, { borderColor: c.line }]}
    >
      <View style={[styles.optionIcon, { backgroundColor: tint }]}>
        <Icon name={icon} size={24} color={c.primary} />
      </View>
      <View style={styles.optionText}>
        <AppText variant="title">{title}</AppText>
        <AppText variant="caption" tone="muted">
          {sub}
        </AppText>
      </View>
      <Icon name="chevron" size={18} color={c.muted} />
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" onPress={onClose} style={styles.backdrop}>
        <Pressable
          onPress={() => undefined}
          style={[
            styles.sheet,
            { backgroundColor: c.surface, paddingBottom: insets.bottom + space.lg },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: c.handle }]} />
          <View style={styles.header}>
            <LogoTile size={40} />
            <View style={styles.optionText}>
              <AppText variant="headline">Share this trip</AppText>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {tripTitle}
              </AppText>
            </View>
          </View>
          {option(
            'camera',
            'As a picture',
            'A card for WhatsApp, Instagram stories, or to save',
            c.sunSoft,
            onPicture,
          )}
          {option('share', 'As text', 'Stops and drive times as a message', c.skySoft, onText)}
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <AppText variant="label" tone="muted">
              Not now
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(27,23,17,0.45)' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    gap: space.md,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 72,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1, gap: 2 },
  cancel: {
    alignSelf: 'center',
    minHeight: layout.tapTarget,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
});
