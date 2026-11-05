import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { ColorValue } from 'react-native';

export type IconName =
    | 'brand'
    | 'wallet'
    | 'home'
    | 'transactions'
    | 'categories'
    | 'target'
    | 'repeat'
    | 'user'
    | 'settings'
    | 'close'
    | 'chevron'
    | 'plus'
    | 'arrow-up'
    | 'arrow-down'
    | 'download'
    | 'shield'
    | 'logout'
    | 'trash'
    | 'calendar'
    | 'more'
    | 'eye'
    | 'eye-off'
    | 'search';

export function AppIcon({
    name,
    color,
    size = 26,
}: {
    name: IconName;
    color: ColorValue;
    size?: number;
}) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            accessible={false}
        >
            {name === 'calendar' && (
                <>
                    <Rect x={3} y={5} width={18} height={16} rx={2} />
                    <Path d="M16 3v4M8 3v4M3 11h18M8 15h2m4 0h2" />
                </>
            )}
            {name === 'more' && (
                <>
                    <Circle cx={5} cy={12} r={1} />
                    <Circle cx={12} cy={12} r={1} />
                    <Circle cx={19} cy={12} r={1} />
                </>
            )}
            {(name === 'eye' || name === 'eye-off') && (
                <>
                    <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                    <Circle cx={12} cy={12} r={3} />
                    {name === 'eye-off' && <Path d="m3 3 18 18" />}
                </>
            )}
            {name === 'search' && (
                <>
                    <Circle cx={10} cy={10} r={6} />
                    <Path d="m15 15 6 6" />
                </>
            )}
            {name === 'brand' && (
                <Svg viewBox="0 0 130 140" width={24} height={24}>
                    <Path
                        d="M88 30H49c-16 0-27 9-27 22s11 20 27 20h30c16 0 27 8 27 21s-11 23-27 23H40"
                        fill="none"
                        stroke={color}
                        strokeWidth={19}
                        strokeLinecap="round"
                    />
                    <Path
                        d="m31 101-13 15 13 14M97 15l13 15-13 14"
                        fill="none"
                        stroke={color}
                        strokeWidth={8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            )}
            {name === 'wallet' && (
                <>
                    <Rect x={3} y={3} width={18} height={18} rx={2} />
                    <Path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2M3 11h3c.8 0 1.6.3 2.1.9l1.1.9c1.6 1.6 4.1 1.6 5.7 0l1.1-.9c.5-.5 1.3-.9 2.1-.9H21" />
                </>
            )}
            {name === 'home' && (
                <Path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
            )}
            {name === 'transactions' && (
                <Path d="M8 3v18m-4-4 4 4 4-4M16 21V3m-4 4 4-4 4 4" />
            )}
            {name === 'categories' && (
                <>
                    <Rect x={3} y={3} width={7} height={7} rx={1.5} />
                    <Rect x={14} y={3} width={7} height={7} rx={1.5} />
                    <Rect x={3} y={14} width={7} height={7} rx={1.5} />
                    <Rect x={14} y={14} width={7} height={7} rx={1.5} />
                </>
            )}
            {name === 'target' && (
                <>
                    <Circle cx={12} cy={12} r={9} />
                    <Circle cx={12} cy={12} r={5} />
                    <Circle cx={12} cy={12} r={1} />
                </>
            )}
            {name === 'repeat' && (
                <Path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3" />
            )}
            {name === 'user' && (
                <>
                    <Circle cx={12} cy={8} r={4} />
                    <Path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" />
                </>
            )}
            {name === 'settings' && (
                <>
                    <Path d="M4 7h16M4 17h16" />
                    <Circle cx={9} cy={7} r={3} />
                    <Circle cx={15} cy={17} r={3} />
                </>
            )}
            {name === 'close' && <Path d="m6 6 12 12M6 18 18 6" />}
            {name === 'chevron' && <Path d="m9 5 7 7-7 7" />}
            {name === 'plus' && <Path d="M12 5v14M5 12h14" />}
            {name === 'arrow-up' && <Path d="M12 19V5m-6 6 6-6 6 6" />}
            {name === 'arrow-down' && <Path d="M12 5v14m-6-6 6 6 6-6" />}
            {name === 'download' && (
                <Path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />
            )}
            {name === 'shield' && (
                <Path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6" />
            )}
            {name === 'logout' && <Path d="M9 4H4v16h5m5-13 5 5-5 5m-6-5h11" />}
            {name === 'trash' && (
                <Path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
            )}
        </Svg>
    );
}
