import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { parseDay, toIsoDay } from '@/lib/format';
import { layout, radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  start: string | null;
  end: string | null;
  /** Earliest selectable day, ISO. */
  minDate: string;
  /** Longest range allowed, in days. */
  maxDays: number;
  onChange: (start: string | null, end: string | null) => void;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const addDays = (iso: string, n: number) => {
  const d = parseDay(iso) ?? new Date();
  d.setDate(d.getDate() + n);
  return toIsoDay(d);
};

/** Tap a start day, then an end day. Tapping before the start moves the start. */
export function Calendar({ start, end, minDate, maxDays, onChange }: Props) {
  const c = useColors();
  const anchor = parseDay(start ?? minDate) ?? new Date();
  const [view, setView] = useState({ year: anchor.getFullYear(), month: anchor.getMonth() });

  const first = new Date(view.year, view.month, 1);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7; // Monday first
  const cells: (string | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      toIsoDay(new Date(view.year, view.month, i + 1)),
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const shift = (by: number) => {
    const d = new Date(view.year, view.month + by, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };
  const canGoBack = new Date(view.year, view.month, 1) > (parseDay(minDate) ?? new Date());

  const pick = (iso: string) => {
    if (!start || end) return onChange(iso, null);
    if (iso < start) return onChange(iso, null);
    const latest = addDays(start, maxDays - 1);
    onChange(start, iso > latest ? latest : iso);
  };

  return (
    <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={styles.header}>
        <IconButton
          icon="back"
          label="Previous month"
          onPress={() => shift(-1)}
          disabled={!canGoBack}
        />
        <AppText variant="title" accessibilityRole="header">
          {MONTHS[view.month]} {view.year}
        </AppText>
        <IconButton icon="chevron" label="Next month" onPress={() => shift(1)} />
      </View>
      <View style={styles.row}>
        {WEEKDAYS.map((d) => (
          <AppText key={d} variant="micro" tone="muted" style={styles.weekday}>
            {d}
          </AppText>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, r) => (
        <View key={r} style={styles.row}>
          {cells.slice(r * 7, r * 7 + 7).map((iso, i) => {
            if (!iso) return <View key={`e${i}`} style={styles.cell} />;
            const disabled = iso < minDate;
            const isEnd = iso === start || iso === end;
            const inRange = !!start && !!end && iso > start && iso < end;
            return (
              <Pressable
                key={iso}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={iso}
                accessibilityState={{ disabled, selected: isEnd || inRange }}
                onPress={() => pick(iso)}
                style={[
                  styles.cell,
                  inRange && { backgroundColor: c.indicator },
                  isEnd && { backgroundColor: c.primary, borderRadius: radius.sm },
                ]}
              >
                <AppText
                  variant="label"
                  tone={isEnd ? 'onPrimary' : disabled ? 'muted' : 'ink'}
                  style={disabled && styles.dim}
                >
                  {Number(iso.slice(8))}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.md, borderWidth: 1, padding: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', paddingVertical: space.xs },
  cell: {
    flex: 1,
    minHeight: layout.tapTarget - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: { opacity: 0.4 },
});
