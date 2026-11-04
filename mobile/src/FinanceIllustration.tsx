import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { usePreferences } from './PreferencesContext';

export function FinanceIllustration({
    compact = false,
}: {
    compact?: boolean;
}) {
    const { colors } = usePreferences();

    return (
        <Svg
            width="100%"
            height={compact ? 76 : 150}
            viewBox="0 0 320 180"
            accessible={false}
        >
            <Ellipse
                cx={160}
                cy={158}
                rx={112}
                ry={9}
                fill={colors.surfaceMuted}
            />
            <Circle cx={165} cy={86} r={72} fill={colors.primarySoft} />
            <G rotation={-8} origin="160,90">
                <Rect
                    x={91}
                    y={38}
                    width={138}
                    height={110}
                    rx={20}
                    fill={colors.primary}
                />
                <Path
                    d="M91 67h138M109 87h22l12 12h34l12-12h22"
                    fill="none"
                    stroke={colors.primaryForeground}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Rect
                    x={109}
                    y={119}
                    width={36}
                    height={5}
                    rx={2.5}
                    fill={colors.primaryForeground}
                />
            </G>
            <Rect
                x={213}
                y={23}
                width={64}
                height={65}
                rx={16}
                fill={colors.surface}
                stroke={colors.border}
            />
            <Rect
                x={226}
                y={57}
                width={8}
                height={17}
                rx={3}
                fill={colors.primarySoft}
            />
            <Rect
                x={239}
                y={46}
                width={8}
                height={28}
                rx={3}
                fill={colors.primary}
            />
            <Rect
                x={252}
                y={35}
                width={8}
                height={39}
                rx={3}
                fill={colors.text}
            />
            <Circle
                cx={68}
                cy={119}
                r={23}
                fill={colors.surface}
                stroke={colors.border}
            />
            <Path
                d="m58 119 7 7 13-15"
                fill="none"
                stroke={colors.primary}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Circle cx={64} cy={46} r={5} fill={colors.primary} />
            <Path
                d="M266 123v12m-6-6h12M93 17v8m-4-4h8"
                stroke={colors.muted}
                strokeWidth={2}
                strokeLinecap="round"
            />
        </Svg>
    );
}
