import React from 'react';
import { Text, Image, Platform, StyleSheet, View } from 'react-native';
import { getCountryFlag } from '../utils/currency';

interface CountryFlagProps {
    countryCode: string;
    size?: number;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, size = 24 }) => {
    // Web: Use SVG/PNG from flagcdn (Windows browsers often lack flag emoji support)
    if (Platform.OS === 'web') {
        const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
        return (
            <Image
                source={{ uri: flagUrl }}
                style={{
                    width: size,
                    height: size * 0.75, // 4:3 aspect ratio roughly
                    resizeMode: 'contain',
                }}
            />
        );
    }

    // Native: Use Emoji
    return (
        <Text style={{ fontSize: size }}>
            {getCountryFlag(countryCode)}
        </Text>
    );
};

const styles = StyleSheet.create({});
