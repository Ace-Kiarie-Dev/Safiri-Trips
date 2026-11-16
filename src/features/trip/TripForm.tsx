import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Stepper } from '@/components/Stepper';
import { TextField } from '@/components/TextField';
import { formatDay, parseDay, toIsoDay } from '@/lib/format';
import { MAX_DAYS, MAX_TITLE, type TripInput } from '@/lib/trips';
import { space } from '@/theme/tokens';

type Props = { initial?: TripInput; submitLabel: string; onSubmit: (input: TripInput) => void };

const shiftDay = (iso: string, by: number) => {
  const d = parseDay(iso) ?? new Date();
  d.setDate(d.getDate() + by);
  return toIsoDay(d);
};

export function TripForm({ initial, submitLabel, onSubmit }: Props) {
  const today = toIsoDay(new Date());
  const [title, setTitle] = useState(initial?.title ?? '');
  const [startDate, setStartDate] = useState<string | null>(initial?.startDate ?? null);
  const [days, setDays] = useState(initial?.days ?? 2);

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
        <Chip label="No date yet" filled={startDate === null} onPress={() => setStartDate(null)} />
        <Chip
          label="Pick a start date"
          filled={startDate !== null}
          onPress={() => setStartDate(startDate ?? today)}
        />
      </View>
      {startDate ? (
        <Stepper
          label="Start date"
          value={formatDay(startDate)}
          onDecrease={() => setStartDate(shiftDay(startDate, -1))}
          onIncrease={() => setStartDate(shiftDay(startDate, 1))}
          canDecrease={startDate > today}
        />
      ) : null}
      <Stepper
        label="Trip length"
        value={`${days} ${days === 1 ? 'day' : 'days'}`}
        onDecrease={() => setDays(days - 1)}
        onIncrease={() => setDays(days + 1)}
        canDecrease={days > 1}
        canIncrease={days < MAX_DAYS}
      />
      <Button
        label={submitLabel}
        icon="check"
        onPress={() => onSubmit({ title, startDate, days })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.lg },
  chips: { flexDirection: 'row', gap: space.sm },
});
