// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

const ICON_NAMES = [
  'house.fill',
  'paperplane.fill',
  'chevron.left.forwardslash.chevron.right',
  'chevron.right',
  'sparkles',
  'creditcard.fill',
  'chart.bar.fill',
  'person.crop.circle',
  'plus.app.fill',
  'qrcode.viewfinder',
  'doc.text.viewfinder',
  'target',
  'arrow.up',
  'arrow.down',
] as const;

export type IconSymbolName = (typeof ICON_NAMES)[number];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<IconSymbolName, ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  sparkles: 'auto-awesome',
  'creditcard.fill': 'credit-card',
  'chart.bar.fill': 'bar-chart',
  'person.crop.circle': 'person',
  'plus.app.fill': 'add-circle',
  'qrcode.viewfinder': 'qr-code-scanner',
  'doc.text.viewfinder': 'description',
  target: 'track-changes',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
