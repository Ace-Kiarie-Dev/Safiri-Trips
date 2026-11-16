import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cancelTripAlerts } from '@/lib/alerts';
import { removeTripOffline } from '@/lib/offline';
import * as trips from '@/lib/trips';

export const tripKeys = {
  all: ['trips'] as const,
  one: (id: string) => ['trips', id] as const,
  stops: (id: string) => ['trips', id, 'stops'] as const,
};

export const useTripList = () => useQuery({ queryKey: tripKeys.all, queryFn: trips.listTrips });

export const useTrip = (id: string) =>
  useQuery({ queryKey: tripKeys.one(id), queryFn: () => trips.getTrip(id) });

export const useStops = (id: string) =>
  useQuery({ queryKey: tripKeys.stops(id), queryFn: () => trips.listStops(id) });

/** Runs any trip write, then refreshes every trip query. */
export function useTripMutation<A, R>(fn: (arg: A) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

/** Deletes a trip and everything attached to it: alerts, offline pack, stops, packing list. */
export function useDeleteTrip() {
  return useTripMutation(async (id: string) => {
    await cancelTripAlerts(id);
    await removeTripOffline(id).catch(() => undefined);
    await trips.deleteTrip(id);
  });
}
