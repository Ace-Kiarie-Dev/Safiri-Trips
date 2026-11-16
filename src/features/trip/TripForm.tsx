import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Calendar } from '@/components/Calendar';
import { Chip } from '@/components/Chip';
import { Stepper } from '@/components/Stepper';
import { TextField } from '@/components/TextField';
import { formatDay, parseDay, toIsoDay } from '@/lib/format';
import { MAX_DAYS, MAX_TITLE, type TripInput } from '@/lib/trips';
import { space } from '@/theme/tokens';

type Props = { initial?: TripInput; submitLabel: string; onSubmit: (input: TripInput) => void };

const endFrom = (start: string, days: number) => {
  const d = parseDay(start) ?? new Date();
  d.setDate(d.getDate() + days - 1);
  return toIsoDay(d);
};

const daysBetween = (start: string, end: string) => {
  const a = parseDay(start);
  const b = parseDay(end);
  return a && b ? Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1 : 1;
};

export function TripForm({ initial, submitLabel, onSubmit }: Props) {
  const today = toIsoDay(new Date());
  const [title, setTitle] = useState(initial?.title ?? '');
  const [dated, setDated] = useState(!!initial?.startDate);
  const [start, setStart] = useState<string | null>(initial?.startDate ?? null);
  const [end, setEnd] = useState<string | null>(
    initial?.startDate ? endFrom(initial.startDate, initial.days) : null,
  );
  const [days, setDays] = useState(initial?.days ?? 2);

  const resolvedDays = dated && start && end ? daysBetween(start, end) : days;

  return (
    <View style={styles.form}>
      <TextField
        label="Trip name"
        value={title}
        onChangeText={setTitle}
        maxLength={MAX_TITLE}
        placeholder="Weekend in Naivasha"
        autoFocus={!initial}
        returnKeyType="done"
      />
      <View style={styles.chips}>
        <Chip label="No dates yet" filled={!dated} onPress={() => setDated(false)} />
        <Chip label="Pick dates" filled={dated} onPress={() => setDated(true)} />
      </View>
      {dated ? (
        <>
          <Calendar
            start={start}
            end={end}
            minDate={today}
            maxDays={MAX_DAYS}
            onChange={(s, e) => {
              setStart(s);
              setEnd(e);
            }}
          />
          <AppText variant="label" tone="muted" accessibilityLiveRegion="polite">
            {!start
              ? 'Tap the first day of your trip.'
              : !end
                ? `From ${formatDay(start)}. Now tap the last day, or tap it again for a day trip.`
                : `${formatDay(start)} to ${formatDay(end)} · ${resolvedDays} ${resolvedDays === 1 ? 'day' : 'days'}`}
          </AppText>
        </>
      ) : (
        <Stepper
          label="Trip length"
          value={`${days} ${days === 1 ? 'day' : 'days'}`}
          onDecrease={() => setDays(days - 1)}
          onIncrease={() => setDays(days + 1)}
          canDecrease={days > 1}
          canIncrease={days < MAX_DAYS}
        />
      )}
      <Button
        label={submitLabel}
        icon="check"
        disabled={dated && !start}
        onPress={() =>
          onSubmit({
            title,
            startDate: dated ? start : null,
            days: dated && start ? (end ? daysBetween(start, end) : 1) : days,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.lg },
  chips: { flexDirection: 'row', gap: space.sm },
});
