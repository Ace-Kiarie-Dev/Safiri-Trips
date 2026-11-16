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
  | 'bookmark';

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
  }
}
