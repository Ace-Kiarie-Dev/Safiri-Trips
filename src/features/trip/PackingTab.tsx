import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Skeleton } from '@/components/Skeleton';
import { TextField } from '@/components/TextField';
import { addPacking, listPacking, removePacking, syncPacking, togglePacking } from '@/lib/packing';
import { layout, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Props = { tripId: string; suggested: string[]; note: string };

export function PackingTab({ tripId, suggested, note }: Props) {
  const c = useColors();
  const qc = useQueryClient();
  const key = ['packing', tripId];
  const items = useQuery({ queryKey: key, queryFn: () => listPacking(tripId) });
  const [draft, setDraft] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  // Keep the suggested part of the list in step with the forecast and stops.
  const current = items.data;
  const signature = suggested.join('|');
  useEffect(() => {
    if (!current) return;
    const existing = current
      .filter((i) => !i.custom)
      .map((i) => i.label)
      .join('|');
    if (existing === signature) return;
    void syncPacking(tripId, signature ? signature.split('|') : []).then(() =>
      qc.invalidateQueries({ queryKey: ['packing', tripId] }),
    );
  }, [current, signature, tripId, qc]);

  if (items.isPending) return <Skeleton height={200} />;

  const list = items.data ?? [];
  const done = list.filter((i) => i.checked).length;

  return (
    <View>
      <AppText variant="caption" tone="muted">
        {note} {done} of {list.length} packed.
      </AppText>
      {list.map((item) => (
        <View key={item.id} style={[styles.row, { borderBottomColor: c.line }]}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.checked }}
            accessibilityLabel={item.label}
            onPress={() => void togglePacking(item.id, !item.checked).then(refresh)}
            style={styles.check}
          >
            <View
              style={[
                styles.box,
                {
                  borderColor: c.primary,
                  backgroundColor: item.checked ? c.primary : 'transparent',
                },
              ]}
            >
              {item.checked ? <Icon name="check" size={16} color={c.surface} /> : null}
            </View>
            <AppText
              style={[styles.label, item.checked && styles.struck]}
              tone={item.checked ? 'muted' : 'ink'}
            >
              {item.label}
            </AppText>
          </Pressable>
          {item.custom ? (
            <IconButton
              icon="trash"
              label={`Remove ${item.label}`}
              onPress={() => void removePacking(item.id).then(refresh)}
            />
          ) : null}
        </View>
      ))}
      <View style={styles.add}>
        <TextField
          label="Add your own item"
          value={draft}
          onChangeText={setDraft}
          maxLength={60}
          placeholder="Camera tripod"
          returnKeyType="done"
        />
        <Button
          label="Add item"
          icon="plus"
          variant="outline"
          disabled={draft.trim().length === 0}
          onPress={() => {
            void addPacking(tripId, draft).then(refresh);
            setDraft('');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.tapTarget,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  check: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: layout.tapTarget,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
  struck: { textDecorationLine: 'line-through' },
  add: { gap: space.md, marginTop: space.xl },
});
