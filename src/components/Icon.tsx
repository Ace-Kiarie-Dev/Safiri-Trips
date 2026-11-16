import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'map'
  | 'trips'
  | 'compass'
  | 'search'
  | 'settings'
  | 'locate'
  | 'plus'
  | 'back'
  | 'share'
  | 'download'
  | 'alert'
  | 'wifiOff'
  | 'check'
  | 'bookmark'
  | 'up'
  | 'down'
  | 'trash'
  | 'close'
  | 'pin'
  | 'sun'
  | 'cloud'
  | 'rain'
  | 'storm'
  | 'bell'
  | 'car'
  | 'chevron'
  | 'shuffle'
  | 'home'
  | 'clock'
  | 'wind'
  | 'sunrise';

type Props = { name: IconName; size?: number; color: string };

export function Icon({ name, size = 24, color }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {glyph(name)}
    </Svg>
  );
}

function glyph(name: IconName) {
  switch (name) {
    case 'map':
      return (
        <>
          <Path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
          <Path d="M9 4v14M15 6v14" />
        </>
      );
    case 'trips':
      return (
        <>
          <Rect x={3} y={7} width={18} height={13} rx={3} />
          <Path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
        </>
      );
    case 'compass':
      return (
        <>
          <Circle cx={12} cy={12} r={9} />
          <Path d="m15.5 8.5-2 5-5 2 2-5Z" />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx={11} cy={11} r={7} />
          <Path d="m20 20-3.5-3.5" />
        </>
      );
    case 'settings':
      return (
        <>
          <Path d="M4 6h8M16 6h4M4 12h2M10 12h10M4 18h10M18 18h2" />
          <Circle cx={14} cy={6} r={2} />
          <Circle cx={8} cy={12} r={2} />
          <Circle cx={16} cy={18} r={2} />
        </>
      );
    case 'locate':
      return (
        <>
          <Circle cx={12} cy={12} r={3} />
          <Circle cx={12} cy={12} r={8} />
          <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </>
      );
    case 'plus':
      return <Path d="M12 5v14M5 12h14" />;
    case 'back':
      return <Path d="M15 5l-7 7 7 7" />;
    case 'share':
      return <Path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />;
    case 'download':
      return <Path d="M12 4v12M7 11l5 5 5-5M5 20h14" />;
    case 'alert':
      return <Path d="M12 3 2 20h20ZM12 10v4M12 17h.01" />;
    case 'wifiOff':
      return (
        <Path d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4.2-2.3M12 20h.01M19 12.9a10 10 0 0 0-3.8-2.2" />
      );
    case 'check':
      return <Path d="M5 12l5 5 9-10" />;
    case 'bookmark':
      return <Path d="M6 3h12v18l-6-4-6 4Z" />;
    case 'up':
      return <Path d="M6 15l6-6 6 6" />;
    case 'down':
      return <Path d="M6 9l6 6 6-6" />;
    case 'chevron':
      return <Path d="M9 5l7 7-7 7" />;
    case 'trash':
      return <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />;
    case 'close':
      return <Path d="M6 6l12 12M18 6 6 18" />;
    case 'pin':
      return (
        <>
          <Path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
          <Circle cx={12} cy={9} r={2.5} />
        </>
      );
    case 'sun':
      return (
        <>
          <Circle cx={12} cy={12} r={4} />
          <Path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      );
    case 'cloud':
      return <Path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18Z" />;
    case 'rain':
      return (
        <>
          <Path d="M7 15h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 6.5 4.3 4.3 0 0 0 7 15Z" />
          <Path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" />
        </>
      );
    case 'storm':
      return (
        <>
          <Path d="M7 15h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 6.5 4.3 4.3 0 0 0 7 15Z" />
          <Path d="M13 15l-2 4h3l-2 3" />
        </>
      );
    case 'bell':
      return <Path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4ZM10 21h4" />;
    case 'car':
      return (
        <>
          <Path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3Z" />
          <Path d="M5 11h14" />
        </>
      );
    case 'shuffle':
      return <Path d="M16 3l4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" />;
    case 'home':
      return <Path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z" />;
    case 'clock':
      return (
        <>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M12 7v5l3 2" />
        </>
      );
    case 'wind':
      return <Path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8a2 2 0 1 1-2 2" />;
    case 'sunrise':
      return (
        <>
          <Path d="M12 10V3M9 6l3-3 3 3M3 17h18M5 21h14" />
          <Path d="M6 17a6 6 0 0 1 12 0" />
        </>
      );
  }
}
