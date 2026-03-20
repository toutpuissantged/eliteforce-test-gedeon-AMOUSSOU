import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius, style }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.sequence([
            Animated.timing(opacity, {
                toValue: 0.7,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0.3,
                duration: 800,
                useNativeDriver: true,
            }),
        ]);

        Animated.loop(pulse).start();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.base,
                {
                    width: width || '100%',
                    height: height || 20,
                    borderRadius: borderRadius || 8,
                    opacity,
                },
                style,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    base: {
        backgroundColor: '#E5E7EB',
    },
});

export default Skeleton;
