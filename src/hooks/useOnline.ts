import { useNetInfo } from '@react-native-community/netinfo';

/** True until the device is known to be offline. Unknown (null) counts as online. */
export function useOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetInfo();
  return isConnected !== false && isInternetReachable !== false;
}
