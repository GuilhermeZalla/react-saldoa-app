import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
    const { width, fontScale } = useWindowDimensions();

    return {
        isExpanded: width >= 768,
        hasSidebar: width >= 768,
        fontScale,
    };
}
